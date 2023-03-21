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

const q2 = `SELECT  s.id, s.name, s.description, s.latitude, s.longitude,s.altitude, CONCAT("${url}", s.illustration) AS illustration, sts.tag_site_id as tag, s.phone,s.email, s.website FROM site AS s, site_tag_site AS sts WHERE s.id=sts.site_id`,
  q3 = `SELECT s.id as site, h.name, h.description,h.website, h.phone_number, CONCAT("${url}",h.illustration) as illustration FROM site_hotel AS sh, site AS s, hotel AS h WHERE sh.site_id=s.id AND sh.hotel_id=h.id`,
  q4 = `SELECT s.id AS site,a.name AS agence, o.start_date, o.end_date, o.url,a.illustration FROM site as s, offre as o, offre_site as os, agence as a WHERE s.id=os.site_id AND o.id=os.offre_id AND o.agence_id = a.id`,
  q5 = `SELECT site_id AS site, CONCAT("${url}",filename) as picture FROM images ORDER BY site_id`;

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

          connection.query(q2, (err2, sites) => {
            if (err2) throw err2;

            connection.query(q3, (err3, hotels) => {
              if (err3) throw err3;

              connection.query(q4, (err4, offres) => {
                if (err4) throw err4;

                connection.query(q5, (err5, pictures) => {
                  connection.release(); //return the connection to pool
                  if (err5) throw err5;

                  sites.forEach((s) => {
                    s.pictures = pictures.filter((p) => p.site == s.id);
                    s.hotels = hotels.filter((h) => h.site == s.id);
                    s.agences = offres.filter((o) => o.site == s.id);
                  });

                  animals.forEach((a) => {
                    a.sites = sites.filter((s) => s.tag == a.id);
                  });

                  res.status(200).json({ success: true, data: animals });
                });
              });
            });
          });
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

      connection.query(
        `SELECT id, name, comment,  CONCAT("${url}",picture) as illustration FROM tag_site WHERE tag_site.is_animal = 1 AND tag_site.visited > 0 ORDER BY name `,
        (err, animals) => {
          if (err) throw err;

          connection.query(q2, (err2, sites) => {
            if (err2) throw err2;

            connection.query(q3, (err3, hotels) => {
              if (err3) throw err3;

              connection.query(q4, (err4, offres) => {
                if (err4) throw err4;

                connection.query(q5, (err5, pictures) => {
                  connection.release(); //return the connection to pool
                  if (err5) throw err5;

                  sites.forEach((s) => {
                    s.pictures = pictures.filter((p) => p.site == s.id);
                    s.hotels = hotels.filter((h) => h.site == s.id);
                    s.agences = offres.filter((o) => o.site == s.id);
                  });

                  animals.forEach((a) => {
                    a.sites = sites.filter((s) => s.tag == a.id);
                  });

                  res.status(200).json({ success: true, data: animals });
                });
              });
            });
          });
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

// GET ANIMALS FOR A PROVINCE
router.route("/:idProvince(\\d+)").get(async (req, res) => {
  const province = mysql.escape(req.params.idProvince);

  const q1 = `SELECT ts.id, ts.name, ts.comment,  CONCAT("${url}",ts.picture) as illustration, ts.visited FROM tag_site AS ts, site_tag_site AS sts, site AS s, site_province AS sp WHERE  (ts.is_animal=1) AND (ts.id = sts.tag_site_id) AND (s.id = sts.site_id)  AND (s.id = sp.site_id) AND (sp.province_id= ${province}) `;

  try {
    pool.getConnection((error, connection) => {
      if (error) throw error;

      connection.query(q1, (err, animals) => {
        if (err) throw err;

        connection.query(q2, (err2, sites) => {
          if (err2) throw err2;

          connection.query(q3, (err3, hotels) => {
            if (err3) throw err3;

            connection.query(q4, (err4, offres) => {
              if (err4) throw err4;

              connection.query(q5, (err5, pictures) => {
                connection.release(); //return the connection to pool
                if (err5) throw err5;

                sites.forEach((s) => {
                  s.pictures = pictures.filter((p) => p.site == s.id);
                  s.hotels = hotels.filter((h) => h.site == s.id);
                  s.agences = offres.filter((o) => o.site == s.id);
                });

                animals.forEach((a) => {
                  a.sites = sites.filter((s) => s.tag == a.id);
                });

                res.status(200).json({ success: true, data: animals });
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
