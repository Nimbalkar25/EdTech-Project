const RatingAndReview = require("../models/ratingAndReviewsModel");

exports.addReview = async (req, res) => {
    try {

        const studentId = req.user.id;

        if (!studentId) {
            res.status(400).json({
                success: false,
                message: `Student not found`
            })
        }
        const { courseId, rating, review } = req.body;

        if (!courseId || !rating || !review) {
            res.status(400).json({
                success: false,
                message: `Please enter courseId,rating,review. `
            })
        }


        const newReview = await RatingAndReview.create({
            course: courseId,
            user: studentId,
            rating: rating,
            review: review

        })

        res.status(201).json({
            success: true,
            message: `Review Added Successfully.`,
            data: newReview
        })



    } catch (error) {
        return res.status(500).json({
            success: false,
            message: `Something went wrong while adding review..`,
            error: error.message
        })
    }
}

exports.fetchReviews = async (req, res) => {
    try {
        const { reviewId } = req.body;

        if (!reviewId) {
            return res.status(400).json({
                success: false,
                message: `Review Id not found`
            })
        }

        const review = await RatingAndReview.findById(reviewId).populate("course").populate("user");

        if (!review) {
            return res.status(404).json({
                success: false,
                message: `Review Not Found`
            })
        }

        return res.status(200).json({
            siccess: true,
            message: `Review Fetched Successfully`,
            data:review
        })

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: `Something went wrong while fetching review`,
            error: error.message
        })
    }
}