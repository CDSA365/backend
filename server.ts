import "./src/constructs/env";
import bodyParser from "body-parser";
import cors from "cors";
import App from "./app";

const { PORT } = process.env;
const port = Number(PORT);

const bodyParserUrl = bodyParser.urlencoded({ extended: false });
const bodyParserJson = bodyParser.json();
const corsMiddleware = cors();
const middleware = [bodyParserUrl, bodyParserJson, corsMiddleware];

const server = new App(port, middleware);
server.initApp();
