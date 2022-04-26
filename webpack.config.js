// Generated using webpack-cli https://github.com/webpack/webpack-cli

const path = require("path");
const NodePolyfillPlugin = require("node-polyfill-webpack-plugin");
const WorkboxWebpackPlugin = require("workbox-webpack-plugin");

const isProduction = process.env.NODE_ENV == "production";

const config = {
    entry: "./src/server.ts",
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
        // Add your plugins here
        // Learn more about plugins from https://webpack.js.org/configuration/plugins/
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

            // Add your rules for custom modules here
            // Learn more about loaders from https://webpack.js.org/loaders/
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
