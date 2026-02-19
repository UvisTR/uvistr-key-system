const express = require("express");
const app = express();
app.use(express.urlencoded({ extended: true }));

// --- AYARLAR ---
const SECRET_AUTH = "UvisTR_2026_Secure"; 
let keys = {
    "Uvis-VIP-2026": { expiry: "2026-12-31", hwid: null }
};

// --- MODERN ARAYÜZ (HTML & CSS) ---
app.get("/admin", (req, res) => {
    let keyRows = Object.keys(keys).map(k => `
        <div class="key-card">
            <div class="info">
                <span class="key-name">${k}</span>
                <span class="key-expiry">📅 ${keys[k].expiry}</span>
                <span class="key-hwid">🆔 ${keys[k].hwid || "Cihaz Bekleniyor..."}</span>
            </div>
            <div class="actions">
                <a href="/reset?key=${k}" class="btn-reset">HWID Sıfırla</a>
                <a href="/delete?key=${k}" class="btn-delete">Sil</a>
            </div>
        </div>`).join("");

    res.send(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>UvisTR | Admin Panel</title>
            <style>
                body { font-family: 'Segoe UI', sans-serif; background: #0f172a; color: #f8fafc; margin: 0; padding: 40px; }
                .container { max-width: 900px; margin: auto; }
                .header { display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #1e293b; padding-bottom: 20px; margin-bottom: 30px; }
                .title { font-size:
