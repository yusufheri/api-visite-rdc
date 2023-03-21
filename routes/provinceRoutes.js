import mysql from "mysql";
import express from "express";
import dotenv from "dotenv";

const router = express.Router();

dotenv.config();

const pool = mysql.createPool({
  connectionLimit: 100, //important
  host: process.env.host,
  user: process.env.user,
  password: process.env.password,
  database: process.env.database,
  debug: false,
});

// GET ALL PROVINCES
router.route("/").get(async (req, res) => {
  try {
    pool.getConnection((error, connection) => {
      if (error) throw error;
      console.log("connected as id " + connection.threadId);
      connection.query("SELECT * FROM province ORDER BY name", (err, rows) => {
        connection.release(); //return the connection to pool
        if (err) throw err;
        res.status(200).json({ success: true, data: rows });
      });
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error });
  }
});

export default router;
