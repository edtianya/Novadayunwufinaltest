const fs = require("fs");
const path = require("path");
const { DatabaseSync } = require("node:sqlite");

const dbFile = path.join(__dirname, "nova.sqlite");
const initSqlFile = path.join(__dirname, "init.sql");

const db = new DatabaseSync(dbFile);
db.exec("PRAGMA busy_timeout = 5000;");
db.exec(fs.readFileSync(initSqlFile, "utf8"));

module.exports = { db, dbFile };
