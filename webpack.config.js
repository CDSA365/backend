// Generated using webpack-cli https://github.com/webpack/webpack-cli

const path = require("path");
const NodePolyfillPlugin = require("node-polyfill-webpack-plugin");
const WorkboxWebpackPlugin = require("workbox-webpack-plugin");
const nodeExternals = require("webpack-node-externals");
const { DotenvCmdWebpack } = require("dotenv-cmd-webpack");
const CopyWebpackPlugin = require("copy-webpack-plugin");

const isProduction = process.env.NODE_ENV == "production";
const dstPath = path.join(__dirname, "dist");

const config = {
    entry: "./src/server.ts",
    target: "node",
    externals: [nodeExternals()],
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
            env: isProduction ? "production" : "development",
        }),
        new CopyWebpackPlugin({
            patterns: [
                {
                    from: path.join(__dirname, "package.json"),
                    to: `${dstPath}/package.json`,
                },
                {
                    from: path.join(__dirname, "README.md"),
                    to: `${dstPath}/README.md`,
                },
                {
                    from: path.join(__dirname, "/src/email-templates"),
                    to: `${dstPath}/email-templates`,
                },
            ],
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
            {
                test: /\.mjml$/,
                use: [
                    {
                        loader: "webpack-mjml-loader",
                        options: { minify: true },
                    },
                ],
            },
        ],
    },
    resolve: {
        extensions: [".tsx", ".ts", ".js"],
        fallback: {
            util: require.resolve("util/"),
            // fs: false,
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
