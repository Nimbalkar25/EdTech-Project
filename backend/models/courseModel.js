const mongoose = require("mongoose");

const courseSchema = new mongoose.Schema({

    courseTitle: {
        type: String,
        required: [true, "Please enter course name"],
        trim: true
    },

    courseShortDescription: {
        type: String,
        required: [true, "Please enter course description"]
    },

    price: {
        type: Number,
        required: true,
        min: 0
    },

    category: {
        type:String,
        required: true
    },

    tags: [
        {
            type: String,
            required:true
        }
    ],

    courseThumbnail: {
        type: String,
    },


    benefitsOfCourse:
    {
        type: String,
        required:true
    },

    requirements: [
        {
            type: String,
            required:true

        }
    ],


    courseSection: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "SECTION"
        }
    ],


    language: {
        type: String,
        default: "English"
    },

    averageRating: {
        type: Number,
        default: 0
    },

    totalRatings: {
        type: Number,
        default: 0
    },
    ratingAndReviews: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "RATINGANDREVIEW"
        }
    ],
    studentsEnrolled: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "USER"
        }
    ],
    relatedCourses: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "COURSE"
        }
    ],
    instructor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "USER",
        required: true
    },


    status: {
        type: String,
        enum: ["Draft", "Published"],
        default: "Draft"
    }

},
    {
        timestamps: true
    });

module.exports = mongoose.model("COURSE", courseSchema);