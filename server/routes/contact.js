const express = require("express");
const { nanoid } = require("nanoid");
const { readDb, writeDb } = require("../db");

const router = express.Router();

router.post("/", (req, res) => {
  const { name, email, company, message } = req.body;

  if (!name || !email) {
    return res.status(400).json({ message: "Ad ve e-posta alanları zorunludur." });
  }

  const db = readDb();

  db.contactMessages.push({
    id: nanoid(16),
    name,
    email,
    company: company || "",
    message: message || "",
    createdAt: new Date().toISOString()
  });

  writeDb(db);

  return res.json({ message: "Mesajınız alındı. En kısa sürede sizinle iletişime geçilecektir." });
});

module.exports = router;