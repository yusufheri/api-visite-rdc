import express from "express";
import dotenv from "dotenv";
import mysql from "mysql";

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

const url = process.env.downloadImage;

// GET ALL SPAONSORS
router.route("/").get(async (req, res) => {
  try {
    pool.getConnection((error, connection) => {
      if (error) throw error;

      console.log("connected as id " + connection.threadId);
      connection.query(
        `SELECT name, telephone, siteweb, description, CONCAT("${url}",illustration) as illustration,
                CONCAT("${url}",logo) as logo, p.start_date, p.end_date, p.url FROM abonne AS a, publicite AS p
                WHERE (a.id = p.abonne_id) AND (DATEDIFF(p.end_date, CURRENT_TIMESTAMP) >= 0) ORDER BY name `,
        (err, rows) => {
          connection.release(); //return the connection to pool
          if (err) throw err;

          res.status(200).json({ success: true, data: rows });
        }
      );
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error });
  }
});

export default router;
