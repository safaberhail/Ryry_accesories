const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const multer = require('multer');

const app = express();
app.use(express.json());
app.use(cors());

// تأكدي أن كل ملفات الـ HTML والـ CSS داخل مجلد اسمه public
app.use(express.static(path.join(__dirname, 'public')));

// --- الرابط الصحيح والنظيف (تم تنظيفه من الزيادات) ---
const dbURI = "mongodb+srv://safaberhail2006_db_user:8BsDrCa7dZemCaia@cluster0.yh4nxpi.mongodb.net/ryry_store?retryWrites=true&w=majority";

mongoose.connect(dbURI)
    .then(() => console.log('✅ DATABASE CONNECTED SUCCESSFULLY!'))
    .catch(err => console.error('❌ DATABASE CONNECTION ERROR:', err.message));

// الموديلات
const Admin = mongoose.model('Admin', new mongoose.Schema({ email: { type: String, unique: true }, password: { type: String } }));
const Product = mongoose.model('Product', new mongoose.Schema({ name_fr: String, price: Number, old_price: Number, image_url: String }));
const Order = mongoose.model('Order', new mongoose.Schema({ product_name: String, customer_name: String, phone: String, wilaya: String, commune: String, address: String, date: { type: Date, default: Date.now } }));

// الروابط
app.get('/setup', async (req, res) => {
    try {
        await Admin.deleteMany({});
        const newAdmin = new Admin({ email: "admin@ryry.com", password: "ryry_password_2025" });
        await newAdmin.save();
        res.send("<h1>✅ Success: Admin account created!</h1><a href='/login'>Go to Login</a>");
    } catch (e) {
        console.error(e);
        res.status(500).send("Error: " + e.message);
    }
});

app.post('/api/admin/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await Admin.findOne({ email, password });
        if (user) res.json({ success: true });
        else res.status(401).json({ success: false, message: "Email or password incorrect" });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

app.get('/api/products', async (req, res) => {
    try {
        const products = await Product.find();
        res.json(products);
    } catch (e) { res.status(500).json(e); }
});

app.post('/api/orders', async (req, res) => {
    try {
        await new Order(req.body).save();
        res.json({ success: true });
    } catch (e) { res.status(500).json(e); }
});

// فتح الصفحات
app.get('/login', (req, res) => res.sendFile(path.join(__dirname, 'public', 'login.html')));
app.get('/ryry-manage', (req, res) => res.sendFile(path.join(__dirname, 'public', 'ryry-admin-secret.html')));

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => console.log(`🚀 Server on port ${PORT}`));