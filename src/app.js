import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import routes from "./routes/index.js"

const app = express();

dotenv.config();
app.use(express.json());
app.use(cors());

// init routes
console.log('init routes');
app.use("/", routes)

export default app
