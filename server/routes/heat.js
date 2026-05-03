const express = require("express");
const { nanoid } = require("nanoid");
const { readDb, writeDb } = require("../db");
const authRequired = require("../middleware_auth");

const router = express.Router();

router.post("/request", authRequired, (req, res) => {
  const { temperature, purpose, city } = req.body;

  if (!city) {
    return res.status(400).json({ message: "Şehir seçimi zorunludur." });
  }

  const db = readDb();

  db.heatRequests = db.heatRequests || [];
  db.heatRequests.push({
    id: nanoid(16),
    userId: req.user.id,
    temperature: temperature || "",
    purpose: purpose || "",
    city,
    status: "Yeni",
    createdAt: new Date().toISOString()
  });

  writeDb(db);

  return res.json({ message: "Isı talebiniz alındı. BioGate ekibi talebi değerlendirecektir." });
});

module.exports = router;