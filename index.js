import express  from "express";
import * as dotenv from 'dotenv';
import cors from 'cors';

import DBConnection from "./mysql/connect.js";
import provinceRoutes from './routes/provinceRoutes.js';
import siteRoutes from './routes/siteRoutes.js';
import sponsorRoutes from './routes/sponsorRoutes.js';
import animalRoutes from './routes/animalRoutes.js'

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json({limit: '50mb'}));

app.use('/api/v1/provinces', provinceRoutes);
app.use('/api/v1/sites', siteRoutes);
app.use('/api/v1/sponsors', sponsorRoutes);
app.use('/api/v1/animals', animalRoutes);


const startServer = async () => {
    try {
        DBConnection();    
        app.listen(8080, () => console.log('sever has started on port https://localhost:8080'));    
    } catch (error) {
        console.error(error);
    }
}

startServer();