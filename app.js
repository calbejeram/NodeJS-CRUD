const express = require('express');
const path = require('path');
const app = express();
const port = 15000;
const env = require('dotenv');
const cookie_parser = require('cookie-parser');

env.config(
    {
        path: "./.env",

    }
);
app.set("view engine", "hbs")


// app.use(express.static(path.join(__dirname, "./public")));
app.use(express.urlencoded(
    {
        extended: true
    }
)); // Parse body url
app.use(express.json()); // Parse request
app.use(cookie_parser()); // Cookie parser


// app.get("/", (request, response) => {
//     response.send("<html><body><h1>Hello Express JS<h1/><body/><html/>")
// });

// Define routes, imported from another file using the app.use() method
app.use("/", require("./routes/registerRoutes"));
app.use("/auth", require("./routes/auth"))

app.listen(port, () => {
    console.log("Server has started");
});