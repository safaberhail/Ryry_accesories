const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const multer = require('multer');
const fs = require('fs');

const app = express();
app.use(express.json());
app.use(cors());

// --- 1. إعدادات المجلدات ورفع الصور (المكان الذي حدث فيه الخطأ) ---
const uploadDir = path.join(__dirname, 'public', 'uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => { cb(null, uploadDir); },
    filename: (req, file, cb) => { cb(null, Date.now() + '-' + file.originalname); }
});

// تعريف متغير upload (هذا ما كان ينقصك)
const upload = multer({ storage: storage });

app.use(express.static(path.join(__dirname, 'public')));

// --- 2. الاتصال بـ MongoDB Atlas ---
const dbURI = "mongodb+srv://safaberhail2006_db_user:8BsDrCa7dZemCaia@cluster0.yh4nxpi.mongodb.net/ryry_store?retryWrites=true&w=majority";

mongoose.connect(dbURI, { serverSelectionTimeoutMS: 5000 })
    .then(() => console.log('✅ Connected to MongoDB Atlas'))
    .catch(err => console.error('❌ Connection Error:', err.message));

// --- 3. الموديلات (Models) ---
const Admin = mongoose.model('Admin', new mongoose.Schema({ email: { type: String, unique: true }, password: { type: String } }));
const Product = mongoose.model('Product', new mongoose.Schema({ name_fr: String, price: Number, old_price: Number, image_url: String }));
const Order = mongoose.model('Order', new mongoose.Schema({ product_name: String, quantity: Number, delivery_type: String, total_price: String, customer_name: String, phone: String, wilaya: String, commune: String, address: String, date: { type: Date, default: Date.now } }));

// --- 4. الروابط (Routes) ---

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
    } catch (e) { res.status(500).json(e); }
});

// إضافة منتج (مع رفع الصورة)
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

// حذف منتج
app.delete('/api/products/:id', async (req, res) => {
    try {
        await Product.findByIdAndDelete(req.params.id);
        res.json({ success: true });
    } catch (e) { res.status(500).json(e); }
});

// استقبال طلبات الزبائن
app.post('/api/orders', async (req, res) => {
    try {
        const newOrder = new Order(req.body);
        await newOrder.save();
        res.json({ success: true });
    } catch (e) { res.status(500).json(e); }
});

// جلب الطلبات للمدير
app.get('/api/orders', async (req, res) => {
    try {
        const orders = await Order.find().sort({ date: -1 });
        res.json(orders);
    } catch (e) { res.status(500).json(e); }
});

// فتح الصفحات
app.get('/login', (req, res) => res.sendFile(path.join(__dirname, 'public', 'login.html')));
app.get('/ryry-manage', (req, res) => res.sendFile(path.join(__dirname, 'public', 'ryry-admin-secret.html')));

// تشغيل السيرفر
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));