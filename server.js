const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const multer = require('multer');
const fs = require('fs');

const app = express();
app.use(express.json());
app.use(cors());

// إعداد المجلدات الثابتة
app.use(express.static(path.join(__dirname, 'public')));

// إعداد رفع الصور
const uploadDir = path.join(__dirname, 'public', 'uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, uploadDir),
    filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname)
});
const upload = multer({ storage: storage });

// الاتصال بـ MongoDB
const dbURI = "mongodb+srv://safaberhail2006_db_user:8BsDrCa7dZemCaia@cluster0.yh4nxpi.mongodb.net/ryry_store?retryWrites=true&w=majority";
mongoose.connect(dbURI)    .then(() => console.log('✅ Connected to MongoDB'))
    .catch(err => console.error('❌ MongoDB Error:', err));

// الموديلات
const Admin = mongoose.model('Admin', new mongoose.Schema({ email: { type: String, unique: true }, password: { type: String } }));
const Product = mongoose.model('Product', new mongoose.Schema({ name_fr: String, price: Number, old_price: Number, image_url: String }));
const Order = mongoose.model('Order', new mongoose.Schema({ product_name: String, customer_name: String, phone: String, wilaya: String, commune: String, address: String, date: { type: Date, default: Date.now } }));

// --- الروابط (API) ---

// تفعيل الأدمن لأول مرة (افتحي: http://localhost:5001/setup)
app.get('/setup', async (req, res) => {
    await Admin.deleteMany({});
    await new Admin({ email: "admin@ryry.com", password: "123" }).save();
    res.send("<h1>✅ Admin Ready!</h1><p>Email: admin@ryry.com | Pass: 123</p><a href='/login'>Go to Login</a>");
});

// تسجيل الدخول
app.post('/api/admin/login', async (req, res) => {
    const { email, password } = req.body;
    const user = await Admin.findOne({ email, password });
    if (user) res.json({ success: true });
    else res.status(401).json({ success: false });
});

// المنتجات (جلب، إضافة، حذف)
app.get('/api/products', async (req, res) => res.json(await Product.find()));
app.post('/api/products', upload.single('image'), async (req, res) => {
    try {
        const newP = new Product({
            name_fr: req.body.name_fr,
            price: Number(req.body.price),
            old_price: req.body.old_price ? Number(req.body.old_price) : null,
            image_url: '/uploads/' + req.file.filename
        });
        await newP.save();
        res.json({ success: true });
    } catch (e) { res.status(500).json({ error: e.message }); }
});
app.delete('/api/products/:id', async (req, res) => {
    await Product.findByIdAndDelete(req.params.id);
    res.json({ success: true });
});

// الطلبات (إرسال، جلب)
app.post('/api/orders', async (req, res) => {
    await new Order(req.body).save();
    res.json({ success: true });
});
app.get('/api/orders', async (req, res) => res.json(await Order.find().sort({ date: -1 })));
// حذف طلب (Order)
app.delete('/api/orders/:id', async (req, res) => {
    try {
        await Order.findByIdAndDelete(req.params.id);
        res.json({ success: true, message: "Commande supprimée" });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});
// فتح الصفحات
app.get('/login', (req, res) => res.sendFile(path.join(__dirname, 'public', 'login.html')));
app.get('/ryry-manage', (req, res) => res.sendFile(path.join(__dirname, 'public', 'ryry-admin-secret.html')));

const PORT = 5001;
app.listen(PORT, () => console.log(`🚀 http://localhost:${PORT}`));