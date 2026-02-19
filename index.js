const express = require("express");
const app = express();

const SECRET_AUTH = "UvisTR_2026_Secure"; 
let keys = {
    "Uvis-VIP-2026": { expiry: "2026-12-31", hwid: null }
};

app.get("/", (req, res) => {
  res.send("Sistem Aktif!");
});

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

app.listen(process.env.PORT || 3000);
