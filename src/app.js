import 'dotenv/config'
import * as path from 'path';
import * as fs from 'fs';
import * as http from 'http';
import * as https from 'https';
import express from "express";
import cors from "cors";
import winston from 'winston';
import helmet from 'helmet';
import mongoose from 'mongoose';
import mainRoutes from './routes/webRoutes.js';

const { format, transports, } = winston;
const { combine, timestamp, json } = format;
const __dirname = path.resolve();

const app = express();

let logger = winston.createLogger({
    level: 'http',
    format: combine(
        timestamp({
            format: 'YYYY-MM-DD HH:mm:ss'
        }),
        json()
    ),
    transports: [
        new transports.Console(),
    ]
});

// enables cross-origin resource sharing
app.use(cors());

// parse requests of content-type: application/x-www-form-urlencoded
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// set default port
app.set('port', process.env.API_PORT || 3001);

// configure security middleware 
app.use(helmet());

// const mainRoutes = require("./routes/webRoutes");

app.use("/api/", mainRoutes);

// test route
app.get("/", (req, res) => {
    return res.status(404).json({ status_code: 200, message: "Everthing is OKAY" });
});

// invalid route
app.all("*", (req, res) => {
    return res.status(404).json({ status_code: 404, message: "Invalid Route" });
});

// connect MongoDB
const dbOptions = {
    useNewUrlParser: true,
    useUnifiedTopology: true
};

await mongoose.connect(process.env.MONGODB_URI, dbOptions).then(() => { console.log("MongoDB is connected") },
    (err) => {
        logger.error("Cannot connect to the mongodb" + err);
    }
);

// create server
let server = http.createServer(app);

// configure SSL
if (process.env.SSL === "1") {
    // load ssl certificates
    let privateKey = fs.readFileSync("");
    let certificate = fs.readFileSync("");
    let ca = fs.readFileSync("");
    const sslOptions = {
        key: privateKey,
        cert: certificate,
        ca: ca
    };
    server = https.createServer(sslOptions, app);
}

server.listen(app.get('port'), () => console.log(`Server is running on: ${app.get('port')}`));
