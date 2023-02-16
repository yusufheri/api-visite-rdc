import swaggerAutogen from "swagger-autogen";

const outputFile = "./swagger_output.json";
const endpointsFiles = [
  "./routes/animalRoutes.js",
  "./routes/provinceRoutes.js",
  "./routes/siteRoutes.js",
  "./routes/sponsorRoutes.js",
];

swaggerAutogen(outputFile, endpointsFiles);
