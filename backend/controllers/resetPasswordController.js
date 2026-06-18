const User = require("../models/userModel")
const { sendResetPasswordLink } = require("../services/resetPasswordLink");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");


// Reset password link and resend reset password link
exports.resetPasswordLink = async (req, res) => {
    try {

        const { email } = req.body;

        const existingUser =
            await User.findOne({ email });

        if (!existingUser) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        await sendResetPasswordLink(existingUser);

        return res.status(200).json({
            success: true,
            message: "Reset link sent"
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            error: error.message,
            message: "Error while sending reset password link.."
        });

    }


}

// reset password page
exports.resetPassword = async (req, res) => {
    try {
        const { token } = req.params;

        const { newPassword, confirmPassword } = req.body;


        const existingUser = await User.findOne({
            resetPasswordToken: token
        }).select("+resetPasswordToken +resetPasswordExpires");

        if (!existingUser) {
            return res.status(400).json({
                success: false,
                message: "Invalid reset link"
            });
        }

        if (existingUser.resetPasswordExpires < Date.now()) {
            return res.status(400).json({
                success: false,
                message: "Reset link has expired"
            });
        }



        // Verify JWT token
        try {
            jwt.verify(token, process.env.JWT_SECRET);
        } catch (error) {
            return res.status(400).json({
                success: false,
                message: "Invalid or expired token"
            });
        }

        if (!newPassword || !confirmPassword) {
            return res.status(400).json({
                success: false,
                message: "Please enter password and confirm password"
            });
        }


        if (newPassword !== confirmPassword) {
            return res.status(400).json({
                success: false,
                message: "Password and Confirm Password do not match"
            });
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);

        existingUser.password = hashedPassword;

        // Invalidate link after successful reset
        existingUser.resetPasswordToken = undefined;
        existingUser.resetPasswordExpires = undefined;

        await existingUser.save();

        return res.status(200).json({
            success: true,
            message: "Password reset successfully"
        });


    } catch (error) {
        return res.status(500).json({
            success: false,
            error: error.message,
            message: "Error while resetting password."
        })

    }
}