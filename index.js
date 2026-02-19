const express = require("express");
const app = express();
app.use(express.urlencoded({ extended: true }));

let keys = {
    "Uvis-VIP-2026": { expiry: "2026-12-31", hwid: null }
};

const SECRET_AUTH = "UvisTR_2026_Secure";

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
            <form action="/add" method="POST" style="background:#1e293b; padding:20px; border-radius:12px; margin-bottom:20px;">
                <input name="key" placeholder="Yeni Key" style="padding:10px; border-radius:4px; border:none; width:200px;" required>
                <input name="expiry" type="date" style="padding:10px; border-radius:4px; border:none;" required>
                <button type="submit" style="padding:10px 20px; border-radius:4px; background:#38bdf8; border:none; font-weight:bold; cursor:pointer;">Key Ekle</button>
            </form>
            <div>${keyRows}</div>
        </body>
        </html>
    `);
});

app.post("/add", (req, res) => {
    const { key, expiry } = req.body;
    if(key) keys[key] = { expiry: expiry, hwid: null };
    res.redirect("/admin");
});

app.get("/delete", (req, res) => {
    delete keys[req.query.key];
    res.redirect("/admin");
});

app.get("/reset", (req, res) => {
    if(keys[req.query.key]) keys[req.query.key].hwid = null;
    res.redirect("/admin");
});

app.get("/auth", (req, res) => {
    const { key, hwid, auth } = req.query;

    if (auth !== SECRET_AUTH) {
        console.log("[AUTH] Yanlış SECRET!");
        return res.json({ success: false, message: "Yetkisiz erişim" });
    }

    if (!key || !hwid) {
        return res.json({ success: false, message: "Key veya HWID eksik" });
    }

    if (!keys[key]) {
        return res.json({ success: false, message: "Geçersiz Key!" });
    }

    let k = keys[key];

    // Süre kontrolü
    if (new Date(k.expiry) < new Date()) {
        return res.json({ success: false, message: "Key süresi bitmiş!" });
    }

    // HWID kontrolü
    if (k.hwid === null) {
        k.hwid = hwid;                    // İlk kullanım → HWID kaydet
        console.log(`[AUTH] Yeni HWID kaydedildi → ${key} | ${hwid}`);
    } 
    else if (k.hwid !== hwid) {
        console.log(`[AUTH] HWID uyuşmazlığı → ${key}`);
        return res.json({ success: false, message: "Bu key başka cihazda kullanılıyor!" });
    }

    res.json({ success: true });
});

app.get("/", (req, res) => res.send("<h1>Sistem Aktif!</h1><a href='/admin'>Paneli Aç</a>"));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("UvisTR Sunucusu Port " + PORT + " üzerinde hazır!"));
