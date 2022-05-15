import express, { Application } from "express";
import cluster from "cluster";
import os from "os";
import { pid } from "process";
import Routes from "./routes/routes";

const { API_VERSION, API_STAGE } = process.env;

export default class App {
    protected app: Application;
    protected port: number;
    protected middlewares: any[];
    protected routes: Routes;
    protected path: string;
    protected numCPU: number;

    constructor(port: number, middlewares: any[]) {
        this.app = express();
        this.middlewares = middlewares;
        this.routes = new Routes();
        this.path = `/${API_VERSION}`;
        this.port = port;
        this.numCPU = os.cpus().length;
    }

    initApp = () => {
        this.useMiddlewares();
        this.useRoutes();
        this.listen();
    };

    useMiddlewares = () => {
        this.middlewares.map((middleware) => {
            this.app.use(middleware);
        });
    };

    useRoutes = () => {
        this.app.use("/", this.routes.router);
        this.app.use(this.path, this.routes.router);
    };

    listen = () => {
        if (cluster.isMaster && API_STAGE === "prod") {
            for (let index = 0; index < this.numCPU; index++) cluster.fork();
            cluster.on("exit", (worker) => {
                console.log(`worker ${worker.process.pid} died`);
                cluster.fork();
            });
        } else {
            this.app.listen(this.port, () => {
                const message = `Server ${pid} listening on port: ${this.port}`;
                console.log(message);
            });
        }
    };
}
