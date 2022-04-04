let express = require("express");
let cors = require("cors");

let port = process.env.PORT || 80;

const app = express();

app.use(cors());

app.use((req, res, next) => {
    console.log(`${new Date()} - ${req.method} request for ${req.url}`);
    next();
});

app.use(express.static("./static"));

app.listen(port, () => {
    console.log("Serving");
});