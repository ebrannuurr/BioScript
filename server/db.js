const fs = require("fs");
const path = require("path");

const dataDir = path.join(__dirname, "data");
const dbPath = path.join(dataDir, "db.json");

const initialData = {
  users: [],
  heatRequests: [],
  contactMessages: [],
  matches: [],
  notifications: [],
  factorySources: []
};

function ensureDb() {
  if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
  if (!fs.existsSync(dbPath)) fs.writeFileSync(dbPath, JSON.stringify(initialData, null, 2), "utf-8");
}

function readDb() {
  ensureDb();
  return JSON.parse(fs.readFileSync(dbPath, "utf-8") || JSON.stringify(initialData));
}

function writeDb(data) {
  ensureDb();
  fs.writeFileSync(dbPath, JSON.stringify(data, null, 2), "utf-8");
}

module.exports = { readDb, writeDb };