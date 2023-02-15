import mysql from "mysql";
import express from "express";
import dotenv from "dotenv";

dotenv.config();

const router = express.Router();

const pool = mysql.createPool({
  connectionLimit: 100, //important
  host: process.env.host,
  user: process.env.user,
  password: process.env.password,
  database: process.env.database,
  debug: false,
});

const url = process.env.downloadImage;

const q2 = `SELECT site_id AS site, CONCAT("${url}",filename) as picture FROM images ORDER BY site_id`,
  q3 = `SELECT s.id as site, h.name, h.description,h.website, h.phone_number, CONCAT("${url}",h.illustration) as illustration FROM site_hotel AS sh, site AS s, hotel AS h WHERE sh.site_id=s.id AND sh.hotel_id=h.id`,
  q4 = `SELECT s.id AS site,a.name AS agence, o.start_date, o.end_date, o.url FROM site as s, offre as o, offre_site as os, agence as a WHERE s.id=os.site_id AND o.id=os.offre_id AND o.agence_id = a.id`,
  q5 = `SELECT s.id AS site, ts.name, ts.comment,  CONCAT("${url}", ts.picture) as illustration
 FROM site AS s, site_tag_site AS sts, tag_site  AS ts WHERE s.id = sts.site_id AND sts.tag_site_id = ts.id AND  ts.is_animal = 1`;

// GET ALL SITES TOURISTIQUES
router.route("/").get(async (req, res) => {
  const q1 = `SELECT s.id, s.name,s.visited AS visite,  s.description, s.latitude, s.longitude,s.altitude, CONCAT("${url}", s.illustration) AS illustration,s.phone,s.email, s.website,p.name AS Province  FROM site AS s, site_province as sp, province as p WHERE s.id=sp.site_id  AND sp.province_id=p.id ORDER BY p.id, s.name`;

  try {
    pool.getConnection((error, connection) => {
      if (error) throw error;
      console.log("connected as id " + connection.threadId);

      connection.query(q1, (err, rows) => {
        if (err) throw err;

        connection.query(q2, (err2, data) => {
          if (err2) throw err2;

          connection.query(q3, (err3, hotels) => {
            if (err3) throw err3;

            connection.query(q4, (err4, offres) => {
              if (err4) throw err4;

              connection.query(q5, (err5, animals) => {
                connection.release(); //return the connection to pool
                if (err5) throw err5;

                rows.forEach((s) => {
                  s.pictures = data.filter((p) => p.site == s.id);
                  s.hotels = hotels.filter((h) => h.site == s.id);
                  s.agences = offres.filter((o) => o.site == s.id);
                  s.animals = animals.filter((a) => a.site == s.id);
                });

                res.status(200).json({ success: true, data: rows });
              });
            });
          });
        });
      });
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error });
  }
});

// GET MORE VISITED SITES TOURISTIQUES
router.route("/most-visited").get(async (req, res) => {
  const q1 = `SELECT s.id, s.visited AS visite, s.name, s.description, s.latitude, s.longitude,s.altitude, CONCAT("${url}", s.illustration) AS illustration,s.phone,s.email, s.website,p.name AS Province  FROM site AS s, site_province as sp, province as p WHERE s.id=sp.site_id  AND sp.province_id=p.id AND s.visited > 0 ORDER BY s.visited DESC, s.name ASC LIMIT 0,5`;

  try {
    pool.getConnection((error, connection) => {
      if (error) throw error;
      console.log("connected as id " + connection.threadId);

      connection.query(q1, (err, rows) => {
        if (err) throw err;

        connection.query(q2, (err2, data) => {
          if (err2) throw err2;

          connection.query(q3, (err3, hotels) => {
            if (err3) throw err3;

            connection.query(q4, (err4, offres) => {
              if (err4) throw err4;

              connection.query(q5, (err5, animals) => {
                connection.release(); //return the connection to pool
                if (err5) throw err5;

                rows.forEach((s) => {
                  s.pictures = data.filter((p) => p.site == s.id);
                  s.hotels = hotels.filter((h) => h.site == s.id);
                  s.agences = offres.filter((o) => o.site == s.id);
                  s.animals = animals.filter((a) => a.site == s.id);
                });

                res.status(200).json({ success: true, data: rows });
              });
            });
          });
        });
      });
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error });
  }
});

// GET ALL SITES FROM A PROVINCE
router.route("/:idProvince(\\d+)").get(async (req, res) => {
  const q1 =
    `SELECT s.id, s.name,s.visited AS visite,  s.description, s.latitude, s.longitude,s.altitude, CONCAT("${url}", s.illustration) AS illustration,s.phone,s.email, s.website,p.name AS Province  FROM site AS s, site_province as sp, province as p WHERE s.id=sp.site_id  AND sp.province_id=p.id AND p.id = ` +
    mysql.escape(req.params.idProvince) +
    ` ORDER BY p.id, s.name`;

  try {
    pool.getConnection((error, connection) => {
      if (error) throw error;

      connection.query(q1, (err, rows) => {
        if (err) throw err;

        connection.query(q2, (err2, data) => {
          if (err2) throw err2;

          connection.query(q3, (err3, hotels) => {
            if (err3) throw err3;

            connection.query(q4, (err4, offres) => {
              if (err4) throw err4;

              connection.query(q5, (err5, animals) => {
                connection.release(); //return the connection to pool
                if (err5) throw err5;

                rows.forEach((s) => {
                  s.pictures = data.filter((p) => p.site == s.id);
                  s.hotels = hotels.filter((h) => h.site == s.id);
                  s.agences = offres.filter((o) => o.site == s.id);
                  s.animals = animals.filter((a) => a.site == s.id);
                });

                res.status(200).json({ success: true, data: rows });
              });
            });
          });
        });
      });
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error });
  }
});

// UPDATE visited value
router.route("/visite/:idSite(\\d+)").put(async (req, res) => {
  setTimeout(() => {
    updateSite(req.params, res);
  }, 2000);
});

function updateSite(params, res) {
  var query =
    `UPDATE site SET visited = (IFNULL(visited, 0) + 1) WHERE site.id = ` +
    mysql.escape(params.idSite);
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
