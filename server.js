const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const multer = require('multer');

const app = express();
app.use(express.json());
app.use(cors());
app.use(express.static(path.join(__dirname, 'public')));

// رابط قاعدة البيانات المصلح
const dbURI = "mongodb+srv://safaberhail2006_db_user:8BsDrCa7dZemCaia@cluster0.yh4nxpi.mongodb.net/ryry_store?retryWrites=true&w=majority";

mongoose.connect(dbURI)
    .then(() => console.log('✅ Connected to MongoDB Atlas'))
    .catch(err => console.error('❌ Database Connection Error:', err.message));

// الموديلات
const Admin = mongoose.model('Admin', new mongoose.Schema({ email: { type: String, unique: true }, password: { type: String } }));
const Product = mongoose.model('Product', new mongoose.Schema({ name_fr: String, price: Number, old_price: Number, image_url: String }));
const Order = mongoose.model('Order', new mongoose.Schema({ product_name: String, customer_name: String, phone: String, wilaya: String, commune: String, address: String, date: { type: Date, default: Date.now } }));

// الروابط
app.get('/setup', async (req, res) => {
    try {
        await Admin.deleteMany({});
        await new Admin({ email: "admin@ryry.com", password: "ryry_password_2025" }).save();
        res.send("Admin Ready on Render!");
    } catch (e) { res.status(500).send("Error during setup: " + e.message); }
});

app.post('/api/admin/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await Admin.findOne({ email, password });
        if (user) res.json({ success: true });
        else res.status(401).json({ success: false, message: "Invalid credentials" });
    } catch (e) { res.status(500).json({ success: false, error: e.message }); }
});

app.get('/api/products', async (req, res) => res.json(await Product.find()));
app.post('/api/orders', async (req, res) => { await new Order(req.body).save(); res.json({ success: true }); });

app.get('/login', (req, res) => res.sendFile(path.join(__dirname, 'public', 'login.html')));
app.get('/ryry-manage', (req, res) => res.sendFile(path.join(__dirname, 'public', 'ryry-admin-secret.html')));

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => console.log(`🚀 App on port ${PORT}`));