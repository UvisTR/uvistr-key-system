const express = require("express");
const app = express();
app.use(express.urlencoded({ extended: true }));

// ======================
// VERİTABANI (Bellek içi)
let keys = {
    "Uvis-VIP-2026": { 
        expiry: "2026-12-31", 
        hwid: null 
    }
};

// Admin bilgileri (şifre değiştikçe güncelleniyor)
let admin = {
    username: "admin",
    password: "UvisTR2026"  // Başlangıç şifresi - buradan değiştirebilirsin
};

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
    if (username === admin.username && password === admin.password) {
        res.redirect("/admin");
    } else {
        res.send("<h1 style='color:red;text-align:center;'>Yanlış kullanıcı adı veya şifre!</h1><a href='/login'>Tekrar Dene</a>");
    }
});

// ======================
// ŞİFRE DEĞİŞTİRME SAYFASI (Giriş yaptıktan sonra erişilebilir)
app.get("/change-password", (req, res) => {
    res.send(`
        <!DOCTYPE html>
        <html lang="tr">
        <head>
            <meta charset="utf-8">
            <title>Şifre Değiştir</title>
            <style>
                body { background:#0f172a; color:white; font-family:Arial; padding:40px; max-width:500px; margin:auto; }
                h1 { color:#38bdf8; }
                input { width:100%; padding:12px; margin:10px 0; border-radius:6px; border:none; }
                button { padding:12px 20px; background:#38bdf8; border:none; border-radius:6px; color:black; font-weight:bold; cursor:pointer; }
            </style>
        </head>
        <body>
            <h1>Şifre Değiştir</h1>
            <form action="/change-password" method="POST">
                <input type="password" name="oldPass" placeholder="Eski Şifre" required>
                <input type="password" name="newPass" placeholder="Yeni Şifre" required>
                <button type="submit">Şifreyi Güncelle</button>
            </form>
            <a href="/admin">Admin Paneline Dön</a>
        </body>
        </html>
    `);
});

// ======================
// ŞİFRE DEĞİŞTİRME İŞLEMİ
app.post("/change-password", (req, res) => {
    const { oldPass, newPass } = req.body;

    if (oldPass !== admin.password) {
        return res.send("<h1 style='color:red;'>Eski şifre yanlış!</h1><a href='/change-password'>Tekrar Dene</a>");
    }

    if (!newPass || newPass.length < 6) {
        return res.send("<h1 style='color:red;'>Yeni şifre çok kısa (min 6 karakter)!</h1><a href='/change-password'>Tekrar Dene</a>");
    }

    admin.password = newPass;
    console.log("[ADMIN] Şifre değiştirildi → Yeni şifre:", newPass);

    res.send("<h1 style='color:#38bdf8;'>Şifre başarıyla değiştirildi!</h1><a href='/admin'>Admin Paneline Dön</a>");
});

// ======================
// ADMIN PANELİ (Giriş yapıldıktan sonra erişilebilir)
app.get("/admin", (req, res) => {
    let keyRows = Object.keys(keys).map(k => `
        <div style="background:#1e293b; padding:15px; border-radius:8px; margin-bottom:10px; display:flex; justify-content:space-between; align-items:center; border:1px solid #334155;">
            <div>
                <b style="color:#38bdf8; font-size:18px;">${k}</b><br>
                <small style="color:#94a3b8;">📅 Bitiş: ${keys[k].expiry} | 🆔 HWID: ${keys[k].hwid || "Bekleniyor"}</small>
            </div>
            <div>
                <a href="/reset?key=${k}" style="background:#fbbf24; color:black; padding:5px 10px; border-radius:4px; text-decoration:none; font-weight:bold; margin-right:5px;">Sıfırla</a>
                <a href="/delete?key=${k}" style="background:#ef4444; color:white; padding:5px 10px; border-radius:4px; text-decoration:none; font-weight:bold;">Sil</a>
            </div>
        </div>`).join("");

    res.send(`
        <!DOCTYPE html>
        <html style="background:#0f172a; color:white; font-family:sans-serif;">
        <head><title>UvisTR Dashboard</title></head>
        <body style="padding:40px; max-width:800px; margin:auto;">
            <h1 style="color:#38bdf8; border-bottom:2px solid #1e293b; padding-bottom:10px;">UvisTR Yönetim Paneli</h1>
            <a href="/change-password" style="background:#fbbf24; color:black; padding:10px 20px; border-radius:6px; text-decoration:none; font-weight:bold;">Şifre Değiştir</a>
            <br><br>
            <form action="/add" method="POST" style="background:#1e293b; padding:20px; border-radius:12px; margin-bottom:20px;">
                <input name="key" placeholder="Yeni Key" style="padding:10px; border-radius:4px; border:none; width:200px;" required>
                <input name="expiry" type="date" style="padding:10px; border-radius:4px; border:none;" required>
                <button type="submit" style="padding:10px 20px; border-radius:4px; background:#38bdf8; border:none; font-weight:bold; cursor:pointer;">Key Ekle</button>
            </form>
            <div>${keyRows}</div>
            <br><a href="/logout" style="color:#ef4444;">Çıkış Yap</a>
        </body>
        </html>
    `);
});

// ======================
// KEY EKLE
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
    } else if (k.hwid !== hwid) {
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
