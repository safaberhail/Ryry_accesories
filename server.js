const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const multer = require('multer');
const fs = require('fs');

const app = express();
app.use(express.json());
app.use(cors());

// --- 1. إعدادات البوت ---
const BOT_TOKEN = '8879359089:AAGElzjWJKZuyriJWJm0OkocuWxWjeZ_wMQ';
const CHAT_ID = '5235221577';

async function sendTelegramMessage(message) {
    try {
        const url = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`;
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                chat_id: CHAT_ID,
                text: message,
                parse_mode: 'HTML'
            })
        });
        return response.ok;
    } catch (error) {
        console.error('Erreur Telegram:', error);
        return false;
    }
}

// --- 2. إعدادات المجلدات ورفع الصور ---
const publicDir = path.join(__dirname, 'public');
const uploadDir = path.join(publicDir, 'uploads');

// التأكد من وجود المجلدات
if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
}
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => { cb(null, uploadDir); },
    filename: (req, file, cb) => { cb(null, Date.now() + '-' + file.originalname); }
});

const upload = multer({ storage: storage });

// --- 3. خدمة الملفات الثابتة (مهم جداً للصور) ---
app.use(express.static(publicDir));
app.use('/uploads', express.static(uploadDir));

// --- 4. الاتصال بـ MongoDB ---
const dbURI = "mongodb+srv://safaberhail2006_db_user:8BsDrCa7dZemCaia@cluster0.yh4nxpi.mongodb.net/ryry_store?retryWrites=true&w=majority";

mongoose.connect(dbURI, { serverSelectionTimeoutMS: 5000 })
    .then(() => console.log('✅ Connected to MongoDB Atlas'))
    .catch(err => console.error('❌ Connection Error:', err.message));

// --- 5. الموديلات ---
const Admin = mongoose.model('Admin', new mongoose.Schema({ 
    email: { type: String, unique: true }, 
    password: { type: String } 
}));

const Product = mongoose.model('Product', new mongoose.Schema({ 
    name_fr: String, 
    price: Number, 
    old_price: Number, 
    image_url: String,
    bg_gradient: { type: String, default: '#0A4240' }
}));

const Order = mongoose.model('Order', new mongoose.Schema({ 
    product_name: String, 
    quantity: Number, 
    delivery_type: String, 
    total_price: String, 
    customer_name: String, 
    phone: String, 
    wilaya: String, 
    commune: String, 
    address: String, 
    date: { type: Date, default: Date.now } 
}));

// --- 6. مسار إصلاح جميع الصور (الحل السحري) ---
app.get('/fix-all-images', async (req, res) => {
    try {
        const products = await Product.find();
        let fixed = 0;
        
        for (const product of products) {
            let oldPath = product.image_url;
            let newPath = oldPath;
            
            if (oldPath) {
                // الحالة 1: public/uploads/xxx
                if (oldPath.includes('public/uploads/')) {
                    newPath = oldPath.replace('public/uploads/', '/uploads/');
                }
                // الحالة 2: uploads/xxx (بدون slash)
                else if (oldPath.startsWith('uploads/')) {
                    newPath = '/' + oldPath;
                }
                // الحالة 3: xxx (اسم ملف فقط)
                else if (!oldPath.startsWith('/uploads/') && !oldPath.startsWith('http')) {
                    newPath = '/uploads/' + oldPath;
                }
                // الحالة 4: /uploads/xxx (صحيح) - لا نغيره
                
                // إذا تغير المسار
                if (newPath !== oldPath) {
                    product.image_url = newPath;
                    await product.save();
                    fixed++;
                    console.log(`✅ Fixé: ${oldPath} → ${newPath}`);
                }
            }
        }
        
        // عرض نتيجة الإصلاح مع رابط للعودة
        res.send(`
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    body { font-family: Arial; text-align: center; padding: 50px; background: #f5f5f5; }
                    .container { background: white; padding: 40px; border-radius: 20px; max-width: 600px; margin: 0 auto; box-shadow: 0 4px 20px rgba(0,0,0,0.1); }
                    h1 { color: #0A4240; }
                    .success { color: green; font-size: 48px; }
                    .btn { display: inline-block; padding: 12px 30px; background: #0A4240; color: white; text-decoration: none; border-radius: 50px; margin-top: 20px; }
                    .details { text-align: left; margin: 20px 0; padding: 20px; background: #f9f9f9; border-radius: 10px; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="success">✅</div>
                    <h1>${fixed} produits corrigés !</h1>
                    <div class="details">
                        <strong>Détails :</strong><br>
                        Total produits: ${products.length}<br>
                        Corrigés: ${fixed}<br>
                        Non corrigés: ${products.length - fixed}
                    </div>
                    <a href="/" class="btn">🏠 Retour au site</a>
                    <br><br>
                    <a href="/fix-images-debug" class="btn" style="background: #D4A853;">🔍 Voir détails</a>
                </div>
            </body>
            </html>
        `);
    } catch (e) {
        res.status(500).send('Erreur: ' + e.message);
    }
});

// مسار لعرض تفاصيل الصور (للتشخيص)
app.get('/fix-images-debug', async (req, res) => {
    try {
        const products = await Product.find();
        let html = '<h1>Détails des produits</h1><table border="1" style="border-collapse:collapse;width:100%">';
        html += '<tr><th>Nom</th><th>Image URL</th><th>Statut</th></tr>';
        
        for (const p of products) {
            const imgPath = p.image_url || 'Aucune';
            const exists = imgPath && imgPath !== 'Aucune' ? '✅' : '❌';
            html += `<tr>
                <td>${p.name_fr}</td>
                <td>${imgPath}</td>
                <td>${exists}</td>
            </tr>`;
        }
        html += '</table><br><a href="/">Retour</a>';
        res.send(html);
    } catch (e) {
        res.status(500).send('Erreur: ' + e.message);
    }
});

// --- 7. الروابط (Routes) ---

// تفعيل حساب الأدمن
app.get('/setup', async (req, res) => {
    try {
        await Admin.deleteMany({});
        await new Admin({ email: "admin@ryry.com", password: "ryry_password_2025" }).save();
        res.send("<h1>✅ Admin Ready!</h1>");
    } catch (e) { res.status(500).send("Error: " + e.message); }
});

// تسجيل الدخول
app.post('/api/admin/login', async (req, res) => {
    const { email, password } = req.body;
    const user = await Admin.findOne({ email, password });
    if (user) res.json({ success: true });
    else res.status(401).json({ success: false });
});

// جلب المنتجات
app.get('/api/products', async (req, res) => {
    try {
        const products = await Product.find();
        res.json(products);
    } catch (e) { 
        console.error('Erreur fetch products:', e);
        res.status(500).json({ error: e.message }); 
    }
});

// إضافة منتج (مع رفع الصورة)
app.post('/api/products', upload.single('image'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'Aucune image téléchargée' });
        }
        
        // مسار الصورة الصحيح
        const imagePath = '/uploads/' + req.file.filename;
        console.log('✅ Image sauvegardée:', imagePath);
        
        const newP = new Product({
            name_fr: req.body.name_fr,
            price: Number(req.body.price),
            old_price: req.body.old_price ? Number(req.body.old_price) : null,
            image_url: imagePath,
            bg_gradient: req.body.bg_gradient || '#0A4240'
        });
        await newP.save();
        res.json({ success: true, product: newP });
    } catch (e) { 
        console.error('Erreur ajout produit:', e);
        res.status(500).json({ error: e.message }); 
    }
});

// حذف منتج
app.delete('/api/products/:id', async (req, res) => {
    try {
        await Product.findByIdAndDelete(req.params.id);
        res.json({ success: true });
    } catch (e) { 
        res.status(500).json({ error: e.message }); 
    }
});

// جلب الطلبات
app.get('/api/orders', async (req, res) => {
    try {
        const orders = await Order.find().sort({ date: -1 });
        res.json(orders);
    } catch (e) { 
        res.status(500).json({ error: e.message }); 
    }
});

// استقبال طلب جديد
app.post('/api/orders', async (req, res) => {
    try {
        const orderData = req.body;
        const newOrder = new Order(orderData);
        await newOrder.save();
        
        // إرسال إشعار إلى التيليجرام
        const message = `
🛍️ <b>NOUVELLE COMMANDE !</b>

👤 <b>Client:</b> ${orderData.customer_name}
📞 <b>Téléphone:</b> ${orderData.phone}

📦 <b>Produit:</b> ${orderData.product_name}
🔢 <b>Quantité:</b> ${orderData.quantity || 1}
💵 <b>Total:</b> ${orderData.total_price}

🚚 <b>Livraison:</b> ${orderData.delivery_type}
📍 <b>Wilaya:</b> ${orderData.wilaya}
🏘️ <b>Commune:</b> ${orderData.commune}
🏠 <b>Adresse:</b> ${orderData.address}

📅 <b>Date:</b> ${new Date().toLocaleString('fr-FR')}
        `;
        
        await sendTelegramMessage(message);
        console.log('✅ Notification Telegram envoyée');
        
        res.json({ success: true, order: newOrder });
    } catch (e) { 
        console.error('Erreur création commande:', e);
        res.status(500).json({ error: e.message }); 
    }
});

// حذف طلب
app.delete('/api/orders/:id', async (req, res) => {
    try {
        await Order.findByIdAndDelete(req.params.id);
        res.json({ success: true });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// مسار اختبار البوت
app.get('/test-bot', async (req, res) => {
    const testMessage = `🤖 <b>Test du Bot</b>\n✅ Le bot fonctionne correctement !\n📅 ${new Date().toLocaleString('fr-FR')}`;
    const result = await sendTelegramMessage(testMessage);
    res.send(result ? '✅ Message envoyé !' : '❌ Erreur');
});

// فتح الصفحات
app.get('/login', (req, res) => res.sendFile(path.join(publicDir, 'login.html')));
app.get('/ryry-manage', (req, res) => res.sendFile(path.join(publicDir, 'ryry-admin-secret.html')));

// --- 8. تشغيل السيرفر ---
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📱 Allez sur: http://localhost:${PORT}/fix-all-images pour réparer les images`);
});