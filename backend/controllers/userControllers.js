const User = require("../models/userModel")
const bcrypt = require("bcryptjs");

exports.registerUser = async (req, res) => {
    try {
        const { firstName, lastName, email, phoneNumber, password, confirmPassword, role } = req.body;

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: `User already exists with the email ${email}.`
            })
        }

        if (!password || !confirmPassword) {
            return res.status(400).json({
                success:false,
                message: "Please enter password and confirm password"
            });
        }

        if (password !== confirmPassword) {
            return res.status(400).json({
                success: false,
                message: "Please check confirm password do not match the password."
            })
        }

        const hashPassword = await bcrypt.hash(password, 10);
        const userSaved = await User.create({
            firstName,
            lastName,
            email,
            password: hashPassword,
            phoneNumber,
            role
        })

        res.status(201).json({
            success: true,
            message: `Signed Up successfully and user Created.`,
            user: userSaved
        })
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            error: error.message,
            message: "Please fill all the details something required remaining"
        })

    }


}