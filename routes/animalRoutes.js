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

// GET ALL ANIMALS
router.route("/").get(async (req, res) => {
  try {
    pool.getConnection((error, connection) => {
      if (error) throw error;

      console.log("connected as id " + connection.threadId);
      connection.query(
        `SELECT id, name, comment,  CONCAT("${url}",picture) as illustration FROM tag_site WHERE tag_site.is_animal = 1 ORDER BY name `,
        (err, animals) => {
          if (err) throw err;

          connection.query(
            `SELECT  s.id, s.name, s.description, s.latitude, s.longitude,s.altitude, CONCAT("${url}", s.illustration) AS illustration,s.phone,s.email, s.website,
           sts.tag_site_id AS tag FROM site AS s, site_tag_site AS sts WHERE s.id=sts.site_id`,
            (err2, data) => {
              connection.release(); //return the connection to pool
              if (err2) throw err2;

              animals.forEach((a) => {
                a.sites = data.filter((d) => d.tag == a.id);
              });

              res.status(200).json({ success: true, data: animals });
            }
          );
        }
      );
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error });
  }
});

// GET MOST VISITED ANIMALS
router.route("/most-visited").get(async (req, res) => {
  try {
    pool.getConnection((error, connection) => {
      if (error) throw error;

      console.log("connected as id " + connection.threadId);
      connection.query(
        `SELECT id, name, comment,  CONCAT("${url}",picture) as illustration FROM tag_site WHERE tag_site.is_animal = 1 AND tag_site.visited > 0 ORDER BY name `,
        (err, animals) => {
          if (err) throw err;

          connection.query(
            `SELECT  s.id, s.name, s.description, s.latitude, s.longitude,s.altitude, CONCAT("${url}", s.illustration) AS illustration,s.phone,s.email, s.website,
             sts.tag_site_id AS tag FROM site AS s, site_tag_site AS sts WHERE s.id=sts.site_id`,
            (err2, data) => {
              connection.release(); //return the connection to pool
              if (err2) throw err2;

              animals.forEach((a) => {
                a.sites = data.filter((d) => d.tag == a.id);
              });

              res.status(200).json({ success: true, data: animals });
            }
          );
        }
      );
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error });
  }
});

// UPDATE visited value
router.route("/visite/:idAnimal(\\d+)").put(async (req, res) => {
  setTimeout(() => {
    updateSite(req.params, res);
  }, 1500);
});

function updateSite(params, res) {
  var query =
    `UPDATE tag_site SET visited = (IFNULL(visited, 0) + 1) WHERE tag_site.id = ` +
    mysql.escape(params.idAnimal);
  try {
    pool.getConnection((err, connection) => {
      if (err) throw err;

      connection.query(query, (err2, result) => {
        if (err2) throw err2;

        res.status(500).json({ success: true, data: result.message });
      });
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error });
  }
}

export default router;
