const express = require("express");
const app = express();
app.use(express.urlencoded({ extended: true }));

// ======================
// VERİTABANI (In-Memory - Render için yeterli)
let keys = {
    "Uvis-VIP-2026": { 
        expiry: "2026-12-31", 
        hwid: null 
    }
};

const SECRET_AUTH = "UvisTR_2026_Secure";

// ======================
// ADMIN PANELİ
app.get("/admin", (req, res) => {
    let html = `
    <!DOCTYPE html>
    <html lang="tr">
    <head>
        <meta charset="utf-8">
        <title>UvisTR Key Sistemi - Admin</title>
        <style>
            body { background:#0f172a; color:white; font-family:Arial; padding:30px; }
            h1 { color:#38bdf8; }
            .key { background:#1e293b; padding:15px; margin:10px 0; border-radius:8px; border:1px solid #334155; }
            input, button { padding:10px; margin:5px; border-radius:6px; border:none; }
            button { background:#38bdf8; color:black; font-weight:bold; cursor:pointer; }
            .danger { background:#ef4444; color:white; }
        </style>
    </head>
    <body>
        <h1>UvisTR Key Yönetim Paneli</h1>
        
        <form action="/add" method="POST">
            <input name="key" placeholder="Yeni Key (ör: Premium2026)" required>
            <input name="expiry" type="date" required>
            <button type="submit">Key Ekle</button>
        </form>

        <h2>Mevcut Keyler</h2>
    `;

    Object.keys(keys).forEach(k => {
        html += `
        <div class="key">
            <b style="color:#38bdf8; font-size:18px;">${k}</b><br>
            <small>Bitiş: ${keys[k].expiry} | HWID: ${keys[k].hwid || "<span style='color:#fbbf24'>Bekleniyor</span>"}</small><br>
            <a href="/reset?key=${k}" style="color:#fbbf24; text-decoration:none;">HWID Sıfırla</a> | 
            <a href="/delete?key=${k}" class="danger" style="text-decoration:none;">Sil</a>
        </div>`;
    });

    html += `</body></html>`;
    res.send(html);
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
    res.send("<h1>UvisTR Key Sistemi Çalışıyor</h1><a href='/admin'>Yönetim Paneli</a>");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`UvisTR Key Sistemi ${PORT} portunda çalışıyor!`);
});
