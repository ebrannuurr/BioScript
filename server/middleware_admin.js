function adminRequired(req, res, next) {
  const allowed = (process.env.ADMIN_EMAILS || "")
    .split(",")
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);

  const userEmail = (req.user?.email || "").toLowerCase();

  if (!allowed.includes(userEmail)) {
    return res.status(403).json({ message: "Bu alana yalnızca yetkili geliştiriciler erişebilir." });
  }

  next();
}

module.exports = adminRequired;