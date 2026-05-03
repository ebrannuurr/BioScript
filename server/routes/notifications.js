const express = require("express");
const { readDb, writeDb } = require("../db");
const authRequired = require("../middleware_auth");

const router = express.Router();

router.use(authRequired);

router.get("/", (req, res) => {
  const db = readDb();

  const notifications = (db.notifications || [])
    .filter((item) => item.userId === req.user.id)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  return res.json({ notifications });
});

router.patch("/:id/read", (req, res) => {
  const db = readDb();

  const notification = (db.notifications || []).find(
    (item) => item.id === req.params.id && item.userId === req.user.id
  );

  if (!notification) {
    return res.status(404).json({ message: "Bildirim bulunamadı." });
  }

  notification.read = true;
  notification.readAt = new Date().toISOString();
  writeDb(db);

  return res.json({ message: "Bildirim okundu olarak işaretlendi.", notification });
});

module.exports = router;