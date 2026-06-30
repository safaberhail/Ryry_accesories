const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const multer = require('multer');
const fs = require('fs');

const app = express();
app.use(express.json());
app.use(cors());

// --- 1. إعدادات المجلدات ورفع الصور ---
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

// --- 2. خدمة الملفات الثابتة (مهم جداً للصور) ---
app.use(express.static(publicDir));
app.use('/uploads', express.static(uploadDir));

// --- 3. الاتصال بـ MongoDB Atlas ---
const dbURI = "mongodb+srv://safaberhail2006_db_user:8BsDrCa7dZemCaia@cluster0.yh4nxpi.mongodb.net/ryry_store?retryWrites=true&w=majority";

mongoose.connect(dbURI, { serverSelectionTimeoutMS: 5000 })
    .then(() => console.log('✅ Connected to MongoDB Atlas'))
    .catch(err => console.error('❌ Connection Error:', err.message));

// --- 4. الموديلات (Models) ---
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

// --- 5. مسار إصلاح الصور (تشغيله مرة واحدة) ---
app.get('/fix-images', async (req, res) => {
    try {
        const products = await Product.find();
        let fixed = 0;
        
        for (const product of products) {
            let newPath = product.image_url;
            
            if (newPath) {
                // إزالة public/ من المسار
                if (newPath.includes('public/uploads/')) {
                    newPath = newPath.replace('public/uploads/', '/uploads/');
                    product.image_url = newPath;
                    await product.save();
                    fixed++;
                }
                // إضافة / في البداية إذا كان المسار يبدأ بـ uploads/
                else if (newPath.startsWith('uploads/')) {
                    newPath = '/' + newPath;
                    product.image_url = newPath;
                    await product.save();
                    fixed++;
                }
                // إذا كان المسار لا يبدأ بـ /uploads/ وليس رابطاً كاملاً
                else if (!newPath.startsWith('/uploads/') && !newPath.startsWith('http')) {
                    newPath = '/uploads/' + newPath;
                    product.image_url = newPath;
                    await product.save();
                    fixed++;
                }
            }
        }
        
        res.send(`
            <h1>✅ ${fixed} produits corrigés !</h1>
            <p>Les chemins d'images ont été réparés.</p>
            <a href="/">Retour au site</a>
        `);
    } catch (e) {
        res.status(500).send('Erreur: ' + e.message);
    }
});

// --- 6. الروابط (Routes) ---

// تفعيل حساب الأدمن
app.get('/setup', async (req, res) => {
    try {
        await Admin.deleteMany({});
        await new Admin({ email: "admin@ryry.com", password: "ryry_password_2025" }).save();
        res.send("<h1>✅ Admin Ready on Render!</h1>");
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
        
        console.log('Fichier reçu:', req.file.filename);
        
        const newP = new Product({
            name_fr: req.body.name_fr,
            price: Number(req.body.price),
            old_price: req.body.old_price ? Number(req.body.old_price) : null,
            image_url: '/uploads/' + req.file.filename,
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
        console.error('Erreur suppression produit:', e);
        res.status(500).json({ error: e.message }); 
    }
});

// جلب كل الطلبات
app.get('/api/orders', async (req, res) => {
    try {
        const orders = await Order.find().sort({ date: -1 });
        res.json(orders);
    } catch (e) { 
        console.error('Erreur fetch orders:', e);
        res.status(500).json({ error: e.message }); 
    }
});

// استقبال طلب جديد
app.post('/api/orders', async (req, res) => {
    try {
        const newOrder = new Order(req.body);
        await newOrder.save();
        res.json({ success: true });
    } catch (e) { 
        console.error('Erreur création commande:', e);
        res.status(500).json({ error: e.message }); 
    }
});

// حذف طلب
app.delete('/api/orders/:id', async (req, res) => {
    try {
        await Order.findByIdAndDelete(req.params.id);
        res.json({ success: true, message: "Commande supprimée" });
    } catch (e) {
        console.error('Erreur suppression commande:', e);
        res.status(500).json({ error: e.message });
    }
});

// فتح الصفحات
app.get('/login', (req, res) => res.sendFile(path.join(publicDir, 'login.html')));
app.get('/ryry-manage', (req, res) => res.sendFile(path.join(publicDir, 'ryry-admin-secret.html')));

// --- 7. تشغيل السيرفر ---
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));