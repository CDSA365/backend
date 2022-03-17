import * as dotenv from "dotenv-flow";

if (!process.env.APP_ENV) process.env.APP_ENV = "default";

const envConfig: dotenv.DotenvConfigOptions = {
    default_node_env: "default",
    node_env: process.env.APP_ENV,
};

dotenv.config(envConfig);
