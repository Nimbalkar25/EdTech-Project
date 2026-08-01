const mongoose = require("mongoose");

const lectureProgressSchema = new mongoose.Schema({
    subSection: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "SUBSECTION",
        required: true
    },

    currentTime: {
        type: Number,
        default: 0
    },

    completed: {
        type: Boolean,
        default: false
    }

});

const courseProgressSchema = new mongoose.Schema({

    course: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "COURSE",
        required: true
    },

    student: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "USER",
        required: true
    },

    lectureProgress: [lectureProgressSchema]

}, {
    timestamps: true
});

module.exports = mongoose.model("COURSEPROGRESS", courseProgressSchema);