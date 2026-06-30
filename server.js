const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const app = express();
app.use(express.json({ limit: '50mb' })); // مهم لاستقبال الصور الكبيرة
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

// --- 2. خدمة الملفات الثابتة ---
const publicDir = path.join(__dirname, 'public');
app.use(express.static(publicDir));

// --- 3. الاتصال بـ MongoDB ---
const dbURI = "mongodb+srv://safaberhail2006_db_user:8BsDrCa7dZemCaia@cluster0.yh4nxpi.mongodb.net/ryry_store?retryWrites=true&w=majority";

mongoose.connect(dbURI, { serverSelectionTimeoutMS: 5000 })
    .then(() => console.log('✅ Connected to MongoDB Atlas'))
    .catch(err => console.error('❌ Connection Error:', err.message));

// --- 4. الموديلات ---
const Admin = mongoose.model('Admin', new mongoose.Schema({ 
    email: { type: String, unique: true }, 
    password: { type: String } 
}));

// موديل المنتج مع تخزين الصورة كـ Base64
const Product = mongoose.model('Product', new mongoose.Schema({ 
    name_fr: String, 
    price: Number, 
    old_price: Number, 
    image_data: { type: String, default: '' }, // الصورة بصيغة Base64
    image_mime: { type: String, default: 'image/jpeg' },
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

// --- 5. الروابط (Routes) ---

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

// جلب المنتجات (مع إرسال الصورة كـ Base64)
app.get('/api/products', async (req, res) => {
    try {
        const products = await Product.find();
        // تحويل الصورة إلى URL بيانات
        const productsWithImages = products.map(p => {
            const pObj = p.toObject();
            if (pObj.image_data) {
                pObj.image_url = `data:${pObj.image_mime || 'image/jpeg'};base64,${pObj.image_data}`;
            } else {
                pObj.image_url = '';
            }
            delete pObj.image_data;
            delete pObj.image_mime;
            return pObj;
        });
        res.json(productsWithImages);
    } catch (e) { 
        console.error('Erreur fetch products:', e);
        res.status(500).json({ error: e.message }); 
    }
});

// إضافة منتج (مع استقبال الصورة كـ Base64)
app.post('/api/products', async (req, res) => {
    try {
        const { name_fr, price, old_price, image_data, image_mime, bg_gradient } = req.body;
        
        // التحقق من وجود الصورة
        if (!image_data) {
            return res.status(400).json({ error: 'Image requise' });
        }
        
        // إزالة البادئة إذا وجدت
        let cleanImageData = image_data;
        if (image_data.includes('base64,')) {
            cleanImageData = image_data.split('base64,')[1];
        }
        
        const newP = new Product({
            name_fr: name_fr,
            price: Number(price),
            old_price: old_price ? Number(old_price) : null,
            image_data: cleanImageData,
            image_mime: image_mime || 'image/jpeg',
            bg_gradient: bg_gradient || '#0A4240'
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

// مسار الحصول على Chat ID
app.get('/get-chat-id', async (req, res) => {
    try {
        const url = `https://api.telegram.org/bot${BOT_TOKEN}/getUpdates`;
        const response = await fetch(url);
        const data = await response.json();
        
        let html = `
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    body { font-family: Arial; padding: 20px; background: #f5f5f5; }
                    .container { background: white; padding: 30px; border-radius: 15px; max-width: 800px; margin: 0 auto; }
                    .chat-id { background: #0A4240; color: #D4A853; padding: 15px; border-radius: 10px; font-size: 24px; text-align: center; margin: 20px 0; }
                    .instruction { background: #fff3cd; padding: 15px; border-radius: 10px; border-left: 5px solid #ffc107; }
                    table { width: 100%; border-collapse: collapse; margin-top: 20px; }
                    th, td { padding: 10px; text-align: left; border-bottom: 1px solid #ddd; }
                    th { background: #0A4240; color: white; }
                </style>
            </head>
            <body>
                <div class="container">
                    <h1>🔍 Trouver le Chat ID</h1>
                    <div class="instruction">
                        <strong>📌 Instructions :</strong><br>
                        1. Demandez au propriétaire du bot d'envoyer un message à <strong>@ryry_accessory_bot</strong><br>
                        2. Rafraîchissez cette page après l'envoi du message<br>
                        3. Le Chat ID apparaîtra ci-dessous
                    </div>
        `;
        
        if (data.ok && data.result.length > 0) {
            const lastUpdate = data.result[data.result.length - 1];
            const chatId = lastUpdate.message?.chat?.id || lastUpdate.callback_query?.message?.chat?.id;
            const username = lastUpdate.message?.chat?.username || 'Inconnu';
            const firstName = lastUpdate.message?.chat?.first_name || '';
            const lastName = lastUpdate.message?.chat?.last_name || '';
            
            html += `
                <div class="chat-id">
                    🆔 Chat ID: <strong>${chatId}</strong>
                </div>
                <p><strong>👤 Utilisateur:</strong> ${firstName} ${lastName} (@${username})</p>
                <p><strong>📝 Dernier message:</strong> ${lastUpdate.message?.text || 'N/A'}</p>
                <p style="color: green; font-weight: bold;">✅ Copiez ce Chat ID et remplacez-le dans server.js</p>
                <hr>
                <h3>📋 Tous les messages récents :</h3>
                <table>
                    <tr><th>ID</th><th>Nom</th><th>Username</th><th>Message</th></tr>
            `;
            
            data.result.forEach(update => {
                const msg = update.message;
                if (msg) {
                    const cid = msg.chat.id;
                    const name = `${msg.chat.first_name || ''} ${msg.chat.last_name || ''}`.trim();
                    const username = msg.chat.username || 'N/A';
                    const text = msg.text || '(Média)';
                    html += `<tr><td>${cid}</td><td>${name}</td><td>@${username}</td><td>${text}</td></tr>`;
                }
            });
            
            html += `</table>`;
        } else {
            html += `
                <div style="background: #f8d7da; padding: 20px; border-radius: 10px; margin: 20px 0; border-left: 5px solid #dc3545;">
                    <strong>⚠️ Aucun message trouvé.</strong><br>
                    Demandez au propriétaire d'envoyer un message au bot, puis rafraîchissez cette page.
                </div>
            `;
        }
        
        html += `
                </div>
            </body>
            </html>
        `;
        
        res.send(html);
    } catch (e) {
        res.status(500).send('Erreur: ' + e.message);
    }
});

// فتح الصفحات
app.get('/login', (req, res) => res.sendFile(path.join(publicDir, 'login.html')));
app.get('/ryry-manage', (req, res) => res.sendFile(path.join(publicDir, 'ryry-admin-secret.html')));

// --- 6. تشغيل السيرفر ---
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📱 Allez sur: http://localhost:${PORT}/ryry-manage pour ajouter des produits`);
});