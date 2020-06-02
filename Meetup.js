const mongoose = require("mongoose");

const schema = new mongoose.Schema({
    title: {
        type: String,
        min: 1,
        max: 100,
        required: true,
        unique: true
    },
    location: {
        type: String,
        min: 1,
        max: 100,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    startTime: {
        type: Date,
        required: true
    },
    endTime: {
        type: Date,
        required: true
    },
    attendees: [String]
});

module.exports = mongoose.model("Meetup", schema);