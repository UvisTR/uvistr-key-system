const express = require("express");
const app = express();
app.use(express.urlencoded({ extended: true }));

// --- AYARLAR ---
const ADMIN_PASSWORD = "UvisAdmin123"; // Panelin giriş şifresi
const SECRET_AUTH = "UvisTR_2026_Secure"; // Roblox'un kullandığı şifre

// Veritabanı (Render kapanınca sıfırlanır, kalıcı olması için ilerde MongoDB ekleriz)
let keys = {
    "Uvis-VIP-2026": { expiry: "2026-12-31", hwid: null }
};

// --- YÖNETİM PANELİ (HTML) ---
app.get("/admin", (req, res) => {
    let keyRows = Object.keys(keys).map(k => `
        <tr>
            <td>${k}</td>
            <td>${keys[k].expiry}</td>
            <td>${keys[k].hwid || "Yok"}</td>
            <td>
                <a href="/delete?key=${k}">[SİL]</a>
                <a href="/reset?key=${k}">[HWID SIFIRLA]</a>
            </td>
        </tr>`).join("");

    res.send(`
        <html><body style="font-family:sans-serif; background:#121212; color:white; padding:20px;">
            <h2>UvisTR Key Yönetimi</h2>
            <form action="/add" method="POST">
                <input name="key" placeholder="Yeni Key">
                <input name="expiry" placeholder="YIL-AY-GÜN (2026-12-31)">
                <button type="submit">Ekle</button>
            </form>
            <table border="1" style="width:100%; margin-top:20px; text-align:left;">
                <tr><th>Key</th><th>Bitiş</th><th>HWID</th><th>İşlem</th></tr>
                ${keyRows}
            </table>
        </body></html>
    `);
});

// --- İŞLEMLER ---
app.post("/add", (req, res) => {
    const { key, expiry } = req.body;
    if(key) keys[key] = { expiry: expiry || "2026-12-31", hwid: null };
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

// --- ROBLOX DOĞRULAMA (API) ---
app.get("/auth", (req, res) => {
  const { key, hwid, auth } = req.query;
  if (auth !== SECRET_AUTH) return res.status(403).json({ success: false });

  if (keys[key]) {
    let k = keys[key];
    if (k.hwid === null) k.hwid = hwid;
    if (k.hwid !== hwid) return res.json({ success: false, message: "HWID Hatasi!" });
    return res.json({ success: true, expiry: k.expiry });
  }
  res.json({ success: false, message: "Key Gecersiz!" });
});

app.get("/", (req, res) => res.send("Sistem Aktif! /admin yazarak panele girin."));
app.listen(process.env.PORT || 3000);
