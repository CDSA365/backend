let dotenv = require("dotenv");

const nodeEnv = process.env.NODE_ENV || "dev";
const result = dotenv.config({
    path: `${nodeEnv}.env`,
});

if (result.error) {
    throw result.error;
}
