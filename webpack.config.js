// Generated using webpack-cli https://github.com/webpack/webpack-cli

const path = require("path");
const NodePolyfillPlugin = require("node-polyfill-webpack-plugin");
const WorkboxWebpackPlugin = require("workbox-webpack-plugin");
const { DotenvCmdWebpack } = require("dotenv-cmd-webpack");

const isProduction = process.env.NODE_ENV == "production";

const config = {
    entry: "./src/server.ts",
    target: "node",
    node: {
        __dirname: false,
        __filename: false,
    },
    output: {
        path: path.resolve(__dirname, "dist"),
        filename: "server.js",
    },
    devServer: {
        open: true,
        host: "localhost",
    },
    plugins: [
        new NodePolyfillPlugin(),
        new DotenvCmdWebpack({
            filePath: ".env-cmdrc.json",
            env: "production",
        }),
    ],
    module: {
        rules: [
            {
                test: /\.(ts|tsx)$/i,
                loader: "ts-loader",
                exclude: ["/node_modules/"],
            },
            {
                test: /\.(eot|svg|ttf|woff|woff2|png|jpg|gif)$/i,
                type: "asset",
            },
        ],
    },
    resolve: {
        extensions: [".tsx", ".ts", ".js"],
        fallback: {
            util: require.resolve("util/"),
            fs: false,
            tls: false,
            net: false,
            dns: false,
            child_process: false,
        },
    },
};

module.exports = () => {
    if (isProduction) {
        config.mode = "production";
        config.plugins.push(new WorkboxWebpackPlugin.GenerateSW());
    } else {
        config.mode = "development";
    }
    return config;
};
