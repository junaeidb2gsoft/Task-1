require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const taskRoute = require("./route/task-route");

const app = express();
app.use(bodyParser.json());

app.use("/", taskRoute);

mongoose.connect(
    process.env.dbUrl,
    { useNewUrlParser: true, useUnifiedTopology: true },
    (err) => {
        if (!err) {
            console.log("Connected to database");
            app.listen(4000);
        } else console.log("Connection Error : ", err);
    }
);
