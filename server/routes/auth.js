const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { nanoid } = require("nanoid");
const { readDb, writeDb } = require("../db");
const authRequired = require("../middleware_auth");

const router = express.Router();

function safeUser(user) {
  return {
    id: user.id,
    type: user.type,
    companyName: user.companyName,
    email: user.email,
    verified: user.verified,
    createdAt: user.createdAt
  };
}

function createToken(user) {
  return jwt.sign(
    { id: user.id, email: user.email },
    process.env.JWT_SECRET || "biogate_dev_secret",
    { expiresIn: "7d" }
  );
}

router.post("/register", async (req, res) => {
  const { type, companyName, email, password } = req.body;

  if (!companyName || !email || !password) {
    return res.status(400).json({ message: "Lütfen tüm alanları doldurun." });
  }

  if (password.length < 6) {
    return res.status(400).json({ message: "Şifre en az 6 karakter olmalıdır." });
  }

  const normalizedEmail = String(email).trim().toLowerCase();
  const db = readDb();

  if (db.users.some((user) => user.email === normalizedEmail)) {
    return res.status(409).json({ message: "Bu e-posta zaten kayıtlı." });
  }

  const passwordHash = await bcrypt.hash(password, 10);

  const user = {
    id: nanoid(16),
    type: type || "Fabrika",
    companyName: String(companyName).trim(),
    email: normalizedEmail,
    passwordHash,
    verified: true,
    createdAt: new Date().toISOString()
  };

  db.users.push(user);
  writeDb(db);

  return res.status(201).json({
    message: "Kayıt başarılı. Hesabınız otomatik doğrulandı, giriş yapabilirsiniz."
  });
});

router.post("/login", async (req, res) => {
  const normalizedEmail = String(req.body.email || "").trim().toLowerCase();
  const password = req.body.password || "";

  const db = readDb();
  const user = db.users.find((item) => item.email === normalizedEmail);

  if (!user) {
    return res.status(401).json({ message: "E-posta veya şifre hatalı." });
  }

  const passwordOk = await bcrypt.compare(password, user.passwordHash);

  if (!passwordOk) {
    return res.status(401).json({ message: "E-posta veya şifre hatalı." });
  }

  return res.json({
    message: "Giriş başarılı.",
    token: createToken(user),
    user: safeUser(user)
  });
});

router.get("/me", authRequired, (req, res) => {
  const db = readDb();
  const user = db.users.find((item) => item.id === req.user.id);

  if (!user) {
    return res.status(404).json({ message: "Kullanıcı bulunamadı." });
  }

  return res.json({ user: safeUser(user) });
});

module.exports = router;