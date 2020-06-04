// user-defined constants
const LOGIN_ENDPOINT = "https://register.hackumbc.org/auth/login";
const DATABASE_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/meetups";
const PORT = process.env.PORT || 3000;

// import to be able to send requests
const request = require("request");

// express imports to create server
const express = require("express");
const app = express();
const http = require("http");
const server = http.createServer(app);

// set static asset folder and user JSON + URL body parsers
app.use(express.static("public"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// import mongoose and meetup model and connect to database
const mongoose = require("mongoose");
const Meetup = require("./Meetup.js");
mongoose.connect(DATABASE_URI, { useNewUrlParser: true, useUnifiedTopology: true });

/**
 * Start the server listening at PORT number.
 */
server.listen(PORT, () => {
    console.log("Server running on port: " + PORT);
});

/**
 * Serve the Angular web application.
 */
app.get('/', (req, res) => {
    res.sendFile(__dirname + "/index.html");
});

/**
 * Meetups API Endpoint
 */
app.get("/meetups", (req, res) => {
    Meetup.find({}, (err, meetups) => {
        if (err) console.error(err);

        res.send(meetups);
    });
})

/**
 * Login API Endpoint
 */
app.post("/login", (req, res) => {
    const clientServerOptions = {
        method: "POST",
        uri: LOGIN_ENDPOINT,
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            email: req.body["email"],
            password: req.body["password"]
        })
    };

    request(clientServerOptions, (error, response) => {
        if (error) console.error(error);

        const user = JSON.parse(response.body)["user"];

        res.send(user);
    });
});

/**
 * Meetup Create Endpoint
 */
app.post("/create", (req, res) => {
    Meetup.create({
        title: req.body["title"],
        location: req.body["location"],
        description: req.body["description"],
        startTime: req.body["startTime"],
        endTime: req.body["endTime"]
    }, 
    (err, meetup) => {
        if (err) console.error(err);

        res.send(meetup);
    });
});

/**
* Meetup Add Attendee Endpoint
*/
app.post("/add-attendee", (req, res) => {
    const id = req.body["id"];
    const name = req.body["name"];

    Meetup.findById(id, (err, meetup) => {
        if (err) console.error(err);

        meetup.attendees.push(name);

        meetup.save();

        res.send(meetup);
    });
});