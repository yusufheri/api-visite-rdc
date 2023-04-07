import express from "express";
import dotenv from "dotenv";
import mysql from "mysql";

const router = express.Router();

dotenv.config();

const pool = mysql.createPool({
  connectionLimit: 1000, //important
  host: process.env.host,
  user: process.env.user,
  password: process.env.password,
  database: process.env.database,
  debug: false,
});

const url = process.env.downloadImage;

const q1 = `SELECT id, numref, question,comment, CONCAT("${url}", illustration) AS illustration  FROM question ORDER BY RAND()`,
  q2 = `SELECT a.id, a.question_id AS question, a.ref, a.answer, a.comment, a.is_correct, CONCAT("${url}", illustration) AS illustration
 FROM answer AS a ORDER BY a.question_id  `;

router.route("/").get(async (req, res) => {
  try {
    pool.getConnection((error, connection) => {
      if (error) throw error;

      connection.query(q1, (err, questions) => {
        if (err) throw err;

        connection.query(q2, (err2, answers) => {
          if (err2) throw err2;

          questions.forEach((q) => {
            q.wrongAnswers = [];
            q.correctAnswer = "";
            answers.forEach((a) => {
              if (a.question == q.id) {
                if (a.is_correct === 1) q.correctAnswer = a.answer;
                else q.wrongAnswers.push(a.answer);
              }
            });
          });

          res.status(200).json({ success: true, data: questions });
        });
      });
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error });
  }
});

export default router;
