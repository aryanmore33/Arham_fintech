require("dotenv").config();

const {
    runBseSync,
} = require("./bseSync.worker");

runBseSync()
    .then(() => {
        process.exit(0);
    })
    .catch((error) => {
        console.error(error);

        process.exit(1);
    });