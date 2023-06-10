import express from "express";
import * as dotenv from "dotenv";
import cors from "cors";

// Leverage the CommonJS require function to load JSON files
import { createRequire } from "module";
const require = createRequire(import.meta.url);

import swaggerUi from "swagger-ui-express";
const swaggerFile = require("./swagger_output.json");

import DBConnection from "./mysql/connect.js";
import provinceRoutes from "./routes/provinceRoutes.js";
import siteRoutes from "./routes/siteRoutes.js";
import sponsorRoutes from "./routes/sponsorRoutes.js";
import animalRoutes from "./routes/animalRoutes.js";
import restaurantRoutes from "./routes/restaurantsRoutes.js";
import questionsRoutes from "./routes/questionsRoutes.js";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json({ limit: "50mb" }));

app.use("/documentation", swaggerUi.serve, swaggerUi.setup(swaggerFile));
app.use("/api/v1/provinces", provinceRoutes);
app.use("/api/v1/sites", siteRoutes);
app.use("/api/v1/sponsors", sponsorRoutes);
app.use("/api/v1/animals", animalRoutes);
app.use("/api/v1/restaurants", restaurantRoutes);
app.use("/api/v1/questions", questionsRoutes);

const startServer = async () => {
  try {
    DBConnection();
    app.listen(8083, () =>
      console.log("sever has started on port https://localhost:8083")
    );
  } catch (error) {
    console.error(error);
  }
};

startServer();
