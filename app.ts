import express, { Application } from "express";
import Routes from "./src/routes/routes";

const { API_VERSION } = process.env;

export default class App {
    protected app: Application;
    protected port: number;
    protected middlewares: any[];
    protected routes: Routes;
    protected path: string;

    constructor(port: number, middlewares: any[]) {
        this.app = express();
        this.middlewares = middlewares;
        this.routes = new Routes();
        this.path = `/${API_VERSION}`;
        this.port = port;
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
        this.app.listen(this.port, () => {
            console.log(`Listening on port: ${this.port}`);
        });
    };
}
