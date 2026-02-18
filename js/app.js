const express = require("express");
const mysql = require("mysql2");
require("dotenv").config();

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));

const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
});

// ルート設定
app.use("/auth", require("./routes/auth")(db));

app.listen(3000, () => console.log("http://localhost:3000"));
