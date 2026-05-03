const express = require("express");
const { nanoid } = require("nanoid");
const { readDb, writeDb } = require("../db");
const authRequired = require("../middleware_auth");
const adminRequired = require("../middleware_admin");

const router = express.Router();

router.use(authRequired);
router.use(adminRequired);

router.get("/overview", (req, res) => {
  const db = readDb();

  return res.json({
    users: (db.users || []).map((user) => ({
      id: user.id,
      type: user.type,
      companyName: user.companyName,
      email: user.email,
      verified: user.verified,
      createdAt: user.createdAt
    })),
    heatRequests: db.heatRequests || [],
    contactMessages: db.contactMessages || [],
    matches: db.matches || [],
    notifications: db.notifications || [],
    factorySources: db.factorySources || []
  });
});

router.post("/match", (req, res) => {
  const { requestId, factoryName, note, status } = req.body;

  if (!requestId || !factoryName) {
    return res.status(400).json({ message: "Talep ve fabrika/kaynak bilgisi zorunludur." });
  }

  const db = readDb();
  db.matches = db.matches || [];
  db.notifications = db.notifications || [];

  const request = (db.heatRequests || []).find((item) => item.id === requestId);

  if (!request) {
    return res.status(404).json({ message: "Talep bulunamadı." });
  }

  const matchStatus = status || "Uygun kaynak bulundu";

  const match = {
    id: nanoid(16),
    requestId,
    userId: request.userId,
    factoryName,
    note: note || "",
    status: matchStatus,
    createdBy: req.user.email,
    createdAt: new Date().toISOString()
  };

  request.status = matchStatus;
  request.matchedFactory = factoryName;
  request.updatedAt = new Date().toISOString();

  const notification = {
    id: nanoid(16),
    userId: request.userId,
    type: "match",
    title: "Isı talebiniz için eşleşme bulundu",
    message: `${request.city || "Seçilen şehir"} için oluşturduğunuz ısı talebi değerlendirildi. Size uygun bir kaynak bulundu: ${factoryName}. BioGate ekibi detaylar için sizinle iletişime geçecektir.`,
    requestId,
    matchId: match.id,
    read: false,
    createdAt: new Date().toISOString()
  };

  db.matches.push(match);
  db.notifications.push(notification);
  writeDb(db);

  return res.status(201).json({
    message: "Kayıt oluşturuldu ve yalnızca ısı alıcısına bildirim gönderildi.",
    match,
    notification
  });
});

router.patch("/request/:id/status", (req, res) => {
  const { status } = req.body;
  const db = readDb();

  const request = (db.heatRequests || []).find((item) => item.id === req.params.id);

  if (!request) {
    return res.status(404).json({ message: "Talep bulunamadı." });
  }

  request.status = status || "İnceleniyor";
  request.updatedAt = new Date().toISOString();
  writeDb(db);

  return res.json({
    message: "Talep durumu güncellendi.",
    request
  });
});

module.exports = router;