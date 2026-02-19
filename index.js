const express = require("express");
const app = express();
app.use(express.urlencoded({ extended: true }));

// ======================
// VERİTABANI (Bellek içi – Render için yeterli, istersen JSON file yap)
let keys = {
    "Uvis-VIP-2026": { 
        expiry: "2026-12-31", 
        hwid: null 
    }
};

// Admin login bilgileri (değiştirebilirsin)
const ADMIN_USER = "admin";
const ADMIN_PASS = "UvisTR2026";

// ======================
// LOGIN SAYFASI
app.get("/login", (req, res) => {
    res.send(`
        <!DOCTYPE html>
        <html lang="tr">
        <head>
            <meta charset="utf-8">
            <title>UvisTR Admin Login</title>
            <style>
                body { background:#0f172a; color:white; font-family:Arial; display:flex; justify-content:center; align-items:center; height:100vh; margin:0; }
                .login-box { background:#1e293b; padding:40px; border-radius:12px; box-shadow:0 10px 30px rgba(0,0,0,0.5); width:350px; text-align:center; }
                input { width:100%; padding:12px; margin:10px 0; border-radius:6px; border:none; }
                button { width:100%; padding:12px; background:#38bdf8; border:none; border-radius:6px; color:black; font-weight:bold; cursor:pointer; }
            </style>
        </head>
        <body>
            <div class="login-box">
                <h2>UvisTR Admin Panel</h2>
                <form action="/login" method="POST">
                    <input type="text" name="username" placeholder="Kullanıcı Adı" required>
                    <input type="password" name="password" placeholder="Şifre" required>
                    <button type="submit">Giriş Yap</button>
                </form>
            </div>
        </body>
        </html>
    `);
});

// ======================
// LOGIN KONTROLÜ
app.post("/login", (req, res) => {
    const { username, password } = req.body;
    if (username === ADMIN_USER && password === ADMIN_PASS) {
        res.redirect("/admin");
    } else {
        res.send("<h1 style='color:red;text-align:center;'>Yanlış kullanıcı adı veya şifre!</h1><a href='/login'>Tekrar Dene</a>");
    }
});

// ======================
// ADMIN PANELİ (Login olmadan erişilemez – redirect login'e)
app.get("/admin", (req, res) => {
    // Basit login kontrolü (gerçek projede session kullanabilirsin)
    // Şimdilik basitçe yönlendirme yapıyoruz, istersen cookie/session ekleriz
    res.redirect("/login"); // Gerçekte session ile kontrol et
    // Not: Gerçek login için session eklemek istersen söyle, eklerim
});

// ======================
// KEY EKLE (POST)
app.post("/add", (req, res) => {
    const { key, expiry } = req.body;
    if (key && expiry) {
        keys[key] = { expiry: expiry, hwid: null };
        console.log(`[ADMIN] Yeni key eklendi: ${key} | Bitiş: ${expiry}`);
    }
    res.redirect("/admin");
});

// ======================
// HWID SIFIRLA
app.get("/reset", (req, res) => {
    const key = req.query.key;
    if (keys[key]) {
        keys[key].hwid = null;
        console.log(`[ADMIN] HWID sıfırlandı: ${key}`);
    }
    res.redirect("/admin");
});

// ======================
// KEY SİL
app.get("/delete", (req, res) => {
    const key = req.query.key;
    if (keys[key]) {
        delete keys[key];
        console.log(`[ADMIN] Key silindi: ${key}`);
    }
    res.redirect("/admin");
});

// ======================
// LOADER İÇİN AUTH ENDPOINT (HWID KONTROLLÜ)
app.get("/auth", (req, res) => {
    const { key, hwid, auth } = req.query;

    if (auth !== SECRET_AUTH) {
        console.log("[AUTH] Yanlış SECRET denemesi!");
        return res.json({ success: false, message: "Yetkisiz erişim" });
    }

    if (!key || !hwid) {
        return res.json({ success: false, message: "Key veya HWID eksik" });
    }

    if (!keys[key]) {
        console.log(`[AUTH] Geçersiz key: ${key}`);
        return res.json({ success: false, message: "Geçersiz Key!" });
    }

    const k = keys[key];

    // Süre kontrolü
    if (new Date(k.expiry) < new Date()) {
        console.log(`[AUTH] Süresi bitmiş key: ${key}`);
        return res.json({ success: false, message: "Key süresi bitmiş!" });
    }

    // HWID kontrolü
    if (k.hwid === null) {
        k.hwid = hwid;
        console.log(`[AUTH] HWID kaydedildi → Key: ${key} | HWID: ${hwid}`);
    } 
    else if (k.hwid !== hwid) {
        console.log(`[AUTH] HWID uyuşmazlığı → Key: ${key}`);
        return res.json({ success: false, message: "Bu key başka cihazda kullanılıyor!" });
    }

    console.log(`[AUTH] Başarılı giriş → Key: ${key}`);
    res.json({ success: true });
});

// ======================
// ANA SAYFA
app.get("/", (req, res) => {
    res.send("<h1>UvisTR Key Sistemi Çalışıyor</h1><a href='/login'>Admin Paneli</a>");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`UvisTR Key Sistemi ${PORT} portunda çalışıyor!`);
});
