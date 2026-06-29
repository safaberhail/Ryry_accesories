// 1. قاعدة بيانات الـ 58 ولاية ببلدياتها كاملة
const algeriaCities = {
    "01": ["Adrar", "Tamest", "Charouine", "Reggane", "In Zghmir", "Tit", "Tsabit", "Timimoun", "Ouled Said", "Zaouiet Kounta", "Aoulef"],
    "02": ["Chlef", "Ténès", "Boukadir", "Oued Fodda", "Chettia", "Moussadek", "Harchoun", "Sidi Akkacha", "Oum Drou", "Sendjas"],
    "03": ["Laghouat", "Aflou", "Hassi R'Mel", "Ain Madhi", "Ksar El Hirane", "El Ghicha", "Sidi Bouzid", "Oued Morra"],
    "04": ["Oum El Bouaghi", "Ain Beida", "Ain M'lila", "Ain Fakroun", "Souk Naamane", "F'kirina", "Meskiana"],
    "05": ["Batna", "Arris", "Barika", "Ain Touta", "N'Gaous", "Merouana", "Tazoult", "Théniet El Abed"],
    "06": ["Béjaïa", "Amizour", "Akbou", "El Kseur", "Sidi Aïch", "Kherrata", "Tichy", "Aokas"],
    "07": ["Biskra", "Ouled Djellal", "Tolga", "Sidi Okba", "El Kantara", "Lichana", "Sidi Khaled"],
    "08": ["Béchar", "Kenadsa", "Taghit", "Abadla", "Beni Ounif", "Lahmar", "Mogheul"],
    "09": ["Blida", "Boufarik", "Ouled Yaïch", "Beni Mered", "Larbaa", "Meftah", "Mouzaia", "Bouinan", "Chréa"],
    "10": ["Bouira", "Lakhdaria", "Sour El Ghozlane", "Aïn Bessem", "M'Chedallah", "Bechloul", "Kadiria"],
    "11": ["Tamanrasset", "Abalessa", "Idles", "Tazrouk", "In Amguel"],
    "12": ["Tébessa", "Bir El Ater", "Cheria", "Ouenza", "El Kouif", "Morsott", "Al Aouinet"],
    "13": ["Tlemcen", "Maghnia", "Ghazaouet", "Remchi", "Mansourah", "Sebdou", "Hennaya", "Nedroma", "Ouled Mimoun"],
    "14": ["Tiaret", "Sougueur", "Frenda", "Ksar Chellala", "Mahdia", "Rahouia", "Dahmouni"],
    "15": ["Tizi Ouzou", "Azazga", "Draâ Ben Khedda", "Tigzirt", "Azeffoun", "Larbaâ Nath Irathen", "Boghni"],
    "16": ["Alger Centre", "Sidi M'Hamed", "Bab El Oued", "Kouba", "El Harrach", "Dely Ibrahim", "Zeralda", "Cheraga", "Bordj El Kiffan", "Bab Ezzouar", "Rouïba", "Reghaïa", "Hydra", "Birkhadem"],
    "17": ["Djelfa", "Hassi Bahbah", "Ain Oussera", "Messaad", "Dar Chioukh", "Charef", "Birine"],
    "18": ["Jijel", "Taher", "El Milia", "Chekfa", "Jimla", "El Ancer", "Sidi Abdelaziz", "El Kennar"],
    "19": ["Sétif", "El Eulma", "Ain Oulmene", "Ain Arnat", "Amoucha", "Bougaa", "Beni Aziz", "Hammam Sokhna"],
    "20": ["Saïda", "Youb", "Hassasna", "Ain El Hadjar", "Sidi Boukhobza"],
    "21": ["Skikda", "El Harrouch", "Azzaba", "Collo", "Tamalous", "Stora", "Ramdane Djamel"],
    "22": ["Sidi Bel Abbès", "Tessala", "Sfisef", "Ben Badis", "Telagh", "Sidi Ali Benyoub"],
    "23": ["Annaba", "El Bouni", "El Hadjar", "Berrahal", "Seraïdi", "Chetaïbi", "Annaba Centre"],
    "24": ["Guelma", "Oued Zenati", "Bouchegouf", "Héliopolis", "Hammâm Debagh", "Guelaat Bou Sbaa"],
    "25": ["Constantine", "El Khroub", "Hamma Bouziane", "Didouche Mourad", "Zighoud Youcef", "Ain Smara"],
    "26": ["Médéa", "Ksar El Boukhari", "Berrouaghia", "Beni Slimane", "Tablat", "Ouzera", "Seghouane"],
    "27": ["Mostaganem", "Ain Nouïssy", "Hassi Maâmeche", "Sidi Lakhdar", "Bouguirat", "Achaacha"],
    "28": ["M'Sila", "Bou Saâda", "Magra", "Sidi Aïssa", "Ouled Derradj", "Beni Ilmane", "Hammam Dhala"],
    "29": ["Mascara", "Sig", "Mohammadia", "Tighennif", "Ghriss", "Oued Taria", "Bou Hanifia"],
    "30": ["Ouargla", "Hassi Messaoud", "Rouissat", "Ain Beida", "N'Goussa"],
    "31": ["Oran", "Es Senia", "Arzew", "Bir El Djir", "Sidi Chami", "Ain El Turk", "Gdyel", "Boutlelis"],
    "32": ["El Bayadh", "Bougtob", "Brezina", "El Abiodh Sidi Cheikh", "Rogassa"],
    "33": ["Illizi", "In Amenas", "Bordj Omar Driss"],
    "34": ["Bordj Bou Arréridj", "Ras El Oued", "Mansoura", "Bordj Ghedir", "El Hamadia"],
    "35": ["Boumerdès", "Boudouaou", "Dellys", "Khemis El Khechna", "Isser", "Chabet El Ameur"],
    "36": ["El Tarf", "El Kala", "Drean", "Besbes", "Ben M'Hidi"],
    "37": ["Tindouf", "Oum El Assel"],
    "38": ["Tissemsilt", "Theniet El Had", "Lardjem", "Khemisti", "Bordj Bou Naama"],
    "39": ["El Oued", "Guémar", "Bayadha", "Robbah", "Magrane", "Hassi Khalifa"],
    "40": ["Khenchela", "Kais", "Chechar", "Ouled Rechache", "Babar", "Bouhmama"],
    "41": ["Souk Ahras", "Sedrata", "M'daourouch", "Taoura", "Merahna", "Haddada", "Hanancha", "Machroha"],
    "42": ["Tipaza", "Cherchell", "Kolea", "Hadjout", "Bou Ismaïl", "Gouraya"],
    "43": ["Mila", "Chelghoum Laïd", "Ferdjioua", "Grarem Gouga", "Teleghma", "Tadjenanet"],
    "44": ["Aïn Defla", "Khemis Miliana", "Miliana", "El Attaf", "Djendel", "Boumedfaa"],
    "45": ["Naâma", "Mecheria", "Ain Sefra", "Moghrar", "Assela"],
    "46": ["Aïn Témouchent", "Béni Saf", "Hammam Bou Hadjar", "El Amria", "El Malah"],
    "47": ["Ghardaïا", "Metlili", "El Guerrara", "Bounoura", "Zelfana", "Berriane"],
    "48": ["Relizane", "Oued Rhiou", "Mazouna", "Yellel", "Ammi Moussa", "Sidi M'Hamed Ben Ali"],
    "49": ["Timimoun", "Aougrout", "Charouine"],
    "50": ["Bordj Badji Mokhtar", "Timiaouine"],
    "51": ["Ouled Djellal", "Sidi Khaled"],
    "52": ["Béni Abbès", "Kerzaz", "El Ouata"],
    "53": ["In Salah", "In Ghar"],
    "54": ["In Guezzam", "Tin Zaouatine"],
    "55": ["Touggourt", "Temacine", "Megarine"],
    "56": ["Djanet", "Bordj El Haouas"],
    "57": ["El M'Ghair", "Djamaa"],
    "58": ["El Meniaa", "Hassi Gara"]
};

// 2. المتغيرات العالمية للحسابات
let currentQty = 1;
let currentUnitPrice = 0;

// أسعار التوصيل (سيتم تحديثها لاحقاً بقائمة شركتك)
// قاعدة بيانات أسعار التوصيل لشركة DHD Livraison (المنزل / المكتب)
const deliveryFees = {
    "01": { home: 1100, office: 600 },
    "02": { home: 700, office: 400 },
    "03": { home: 900, office: 500 },
    "04": { home: 700, office: 400 },
    "05": { home: 700, office: 400 },
    "06": { home: 600, office: 400 },
    "07": { home: 900, office: 500 },
    "08": { home: 1300, office: 600 },
    "09": { home: 500, office: 300 },
    "10": { home: 600, office: 400 },
    "11": { home: 1300, office: 600 },
    "12": { home: 800, office: 400 },
    "13": { home: 800, office: 400 },
    "14": { home: 800, office: 400 },
    "15": { home: 700, office: 400 },
    "16": { home: 500, office: 400 },
    "17": { home: 900, office: 500 },
    "18": { home: 700, office: 400 },
    "19": { home: 600, office: 400 },
    "20": { home: 800, office: 400 },
    "21": { home: 700, office: 400 },
    "22": { home: 800, office: 400 },
    "23": { home: 700, office: 400 },
    "24": { home: 700, office: 400 },
    "25": { home: 700, office: 400 },
    "26": { home: 700, office: 400 },
    "27": { home: 700, office: 400 },
    "28": { home: 600, office: 400 },
    "29": { home: 700, office: 400 },
    "30": { home: 900, office: 500 },
    "31": { home: 700, office: 400 },
    "32": { home: 900, office: 500 },
    "33": { home: 1300, office: 600 },
    "34": { home: 450, office: 250 },
    "35": { home: 700, office: 400 },
    "36": { home: 700, office: 400 },
    "37": { home: 1300, office: 600 },
    "38": { home: 800, office: 400 },
    "39": { home: 900, office: 500 },
    "40": { home: 800, office: 500 },
    "41": { home: 800, office: 500 },
    "42": { home: 700, office: 400 },
    "43": { home: 700, office: 400 },
    "44": { home: 700, office: 400 },
    "45": { home: 900, office: 500 },
    "46": { home: 700, office: 400 },
    "47": { home: 900, office: 500 },
    "48": { home: 700, office: 400 },
    "49": { home: 1300, office: 600 },
    "50": { home: 1300, office: 600 }, // Bordj Badji Mokhtar
    "51": { home: 900, office: 500 },
    "52": { home: 1300, office: 0 },   // Beni Abbes (لا يوجد مكتب)
    "53": { home: 1300, office: 600 },
    "54": { home: 1300, office: 600 }, // In Guezzam
    "55": { home: 900, office: 500 },
    "56": { home: 1300, office: 600 }, // Djanet
    "57": { home: 900, office: 0 },   // El M'Ghair (لا يوجد مكتب)
    "58": { home: 1000, office: 500 }
};

// دالة حساب المجموع المحدثة للتعامل مع المكاتب غير المتوفرة
function calculateTotal() {
    const wilayaId = document.getElementById('cust-wilaya').value;
    // جلب نوع التوصيل (منزل أو مكتب)
    const deliveryType = document.querySelector('input[name="del-type"]:checked').value;
    
    let deliveryCost = 0;

    // 1. حساب سعر التوصيل
    if (wilayaId) {
        const fees = deliveryFees[wilayaId] || deliveryFees["default"];
        deliveryCost = fees[deliveryType];
        
        // تنبيه في حالة عدم توفر مكتب في تلك الولاية (مثل بني عباس)
        if (deliveryCost === 0) {
            alert("Désolé, la livraison en bureau n'est pas disponible pour هذه الولاية. Veuillez choisir 'À domicile'.");
            document.querySelector('input[value="home"]').checked = true;
            deliveryCost = fees.home;
        }
        document.getElementById('delivery-price').innerText = deliveryCost + " DA";
    } else {
        document.getElementById('delivery-price').innerText = "Choisir Wilaya";
    }

    // 2. الحساب المنطقي: (سعر المنتج × الكمية) + سعر التوصيل
    const subtotal = currentUnitPrice * currentQty;
    const total = subtotal + deliveryCost;

    // 3. تحديث الواجهة
    document.getElementById('total-price').innerText = total + " DA";
}
// 3. دالة تحديث البلديات
function updateCommunes() {
    const wilayaId = document.getElementById('cust-wilaya').value;
    const communeSelect = document.getElementById('cust-commune');
    communeSelect.innerHTML = '<option value="">Sélectionnez Commune</option>';
    
    if (algeriaCities[wilayaId]) {
        const sorted = algeriaCities[wilayaId].sort();
        sorted.forEach(c => {
            let opt = document.createElement('option');
            opt.value = c;
            opt.innerHTML = c;
            communeSelect.appendChild(opt);
        });
    }
}

// 4. دالة حساب المجموع
function calculateTotal() {
    const wilayaId = document.getElementById('cust-wilaya').value;
    // جلب نوع التوصيل المختار (راديو)
    const deliveryType = document.querySelector('input[name="del-type"]:checked').value;
    
    let deliveryCost = 0;

    if (wilayaId) {
        const fees = deliveryFees[wilayaId] || deliveryFees["default"];
        deliveryCost = fees[deliveryType];
        document.getElementById('delivery-price').innerText = deliveryCost + " DA";
    } else {
        document.getElementById('delivery-price').innerText = "Choisir Wilaya";
    }

    const total = (currentUnitPrice * currentQty) + deliveryCost;
    document.getElementById('total-price').innerText = total + " DA";
}

// 5. جلب السلع وعرضها
// ... (قاعدة بيانات algeriaCities و deliveryFees تبقى كما هي) ...

async function fetchProducts() {
    try {
        const res = await fetch('/api/products');
        const products = await res.json();
        const list = document.getElementById('product-list');
        if(!list) return;

        list.innerHTML = products.map(p => `
            <div class="product-card">
                <div class="product-img-wrapper">
                    <img src="${p.image_url}" onerror="this.src='https://via.placeholder.com/300'">
                </div>
                <div class="product-info">
                    <h3>${p.name_fr}</h3>
                    <div class="price-container">
                        <span class="current-price">${p.price} DA</span>
                        ${p.old_price ? `<span class="old-price">${p.old_price} DA</span>` : ''}
                    </div>
                    <button class="btn-main" style="width:100%;" onclick="openOrder('${p.name_fr}', ${p.price})">
                        Commander 
                    </button>
                </div>
            </div>
        `).join('');
    } catch (e) { console.error(e); }
}

// دالة فتح الطلب وتمرير السعر
function openOrder(pName, price) {
    // تخزين سعر المنتج في متغير عالمي لاستخدامه في الحساب
    currentUnitPrice = price; 
    currentQty = 1;

    document.getElementById('selected-product').value = pName;
    document.getElementById('summary-p-name').innerText = pName;
    document.getElementById('unit-price').innerText = price + " DA";
    document.getElementById('display-qty').innerText = currentQty;
    
    // إظهار المودال
    document.getElementById('order-modal').style.display = 'flex';
    
    // تشغيل الحساب المبدئي
    calculateTotal();
}

// دالة إغلاق المودال
function closeModal() {
    document.getElementById('order-modal').style.display = 'none';
}

// ... (دوال changeQty و calculateTotal وإرسال الطلب كما هي) ...
fetchProducts();
function closeModal() {
    document.getElementById('order-modal').style.display = 'none';
}

// 7. التحكم في الكمية (+/-)
function changeQty(val) {
    currentQty += val;
    if (currentQty < 1) currentQty = 1; // منع النزول تحت 1
    document.getElementById('display-qty').innerText = currentQty;
    
    // إعادة الحساب فوراً عند تغيير الكمية
    calculateTotal();
}

// 8. إرسال الطلب
document.getElementById('order-form').onsubmit = async (e) => {
    e.preventDefault();
    
    const deliveryType = document.querySelector('input[name="del-type"]:checked').value;

    const data = {
        product_name: document.getElementById('selected-product').value,
        quantity: currentQty,
        delivery_type: deliveryType === 'home' ? 'Domicile' : 'Bureau/Relais',
        total_price: document.getElementById('total-price').innerText,
        customer_name: document.getElementById('cust-name').value,
        phone: document.getElementById('cust-phone').value,
        wilaya: document.getElementById('cust-wilaya').options[document.getElementById('cust-wilaya').selectedIndex].text,
        commune: document.getElementById('cust-commune').value,
        address: document.getElementById('cust-address').value
    };

    const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    });

    if (res.ok) {
        alert("✅ Merci! Votre commande a été reçue.");
        closeModal();
        e.target.reset();
    }
};

// تحميل المنتجات عند تشغيل الصفحة
fetchProducts();