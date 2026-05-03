const jwt = require("jsonwebtoken");

function authRequired(req, res, next) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;

  if (!token) return res.status(401).json({ message: "Giriş yapmanız gerekiyor." });

  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET || "biogate_dev_secret");
    next();
  } catch {
    return res.status(401).json({ message: "Oturum geçersiz. Lütfen tekrar giriş yapın." });
  }
}

module.exports = authRequired;