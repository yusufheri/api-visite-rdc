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

const q2 = `SELECT  s.id, s.name, s.description, s.latitude, s.longitude,s.altitude, CONCAT("${url}", s.illustration) AS illustration, rs.restaurant_id as restaurant, s.phone,s.email, s.website FROM site AS s, site_restaurant AS rs WHERE s.id=rs.site_id`,
  q3 = `SELECT s.id as site, h.name, h.description,h.website, h.phone_number, CONCAT("${url}",h.illustration) as illustration FROM site_hotel AS sh, site AS s, hotel AS h WHERE sh.site_id=s.id AND sh.hotel_id=h.id`,
  q4 = `SELECT s.id AS site,a.name AS agence,a.website,a.email,a.phone_number, o.start_date, o.end_date, o.url,a.illustration FROM site as s, offre as o, offre_site as os, agence as a WHERE s.id=os.site_id AND o.id=os.offre_id AND o.agence_id = a.id`,
  q5 = `SELECT site_id AS site, CONCAT("${url}",filename) as picture FROM images ORDER BY site_id`;

// GET ALL RESTAURANTS
router.route("/").get(async (req, res) => {
  try {
    pool.getConnection((error, connection) => {
      if (error) throw error;

      console.log("connected as id " + connection.threadId);
      connection.query(
        `SELECT r.id, r.name, r.website, r.phone_number, r.description, p.name as province,  CONCAT("${url}",r.illustration) as illustration 
        FROM province AS p, restaurant AS r WHERE r.province_id = p.id ORDER BY p.name, r.name `,
        (err, restaurants) => {
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

                  restaurants.forEach((r) => {
                    r.sites = sites.filter((s) => s.restaurant == r.id);
                  });

                  res.status(200).json({ success: true, data: restaurants });
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

export default router;
