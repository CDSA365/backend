let dotenv = require("dotenv");

// Set default to "development"
const nodeEnv = process.env.ENV_FILE || "dev";
const result = dotenv.config({
    path: `./env/${nodeEnv}.env`,
});

if (result.error) {
    throw result.error;
}
