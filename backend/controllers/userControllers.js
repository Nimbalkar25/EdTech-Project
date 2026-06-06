const e = require("express");
const User = require("../models/userModel")
const bcrypt = require("bcryptjs");


// Register User
exports.registerUser = async (req, res) => {
    try {
        const { firstName, lastName, email, countrycode, phoneNumber, password, confirmPassword, role } = req.body;

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: `User already exists with the email ${email}.`
            })
        }

        if (!password || !confirmPassword) {
            return res.status(400).json({
                success: false,
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
            countrycode,
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

// Login User

exports.loginUser = async (req, res) => {
    try {

        const { role, email, password } = req.body;

        if (!email || !password) {
            return res.status(404).json({
                success: false,
                message: "Please enter Email and Password"
            })
        }

        const existingUser = await User.findOne({ email }).select("+password"); 
        // as in schema we select false so it will not give password we need to .select('+password') to get the password this tells mongodb to explicitly give password

        if (!existingUser) {
            return res.status(400).json({
                success: false,
                message: `User not exists with the email ${email}. Please register..`
            })
        }
        const passwordMatch = await bcrypt.compare(password, existingUser.password);

        if (!passwordMatch) {
            return res.status(400).json({
                success: false,
                message: `Wrong Password. Please enter correct password.`
            })
        }

        if (role !== existingUser.role) {
            return res.status(400).json({
                success: false,
                message: `Role is mismatched Select correct role.`
            })

        }

        existingUser.password = undefined; // to not give password to anyone 
        res.status(200).json({
            success: true,
            message: `Login Successfully. Welcome to StudyNotion...`,
            data: existingUser
        })

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            error: error.message,
            message: "Errror while Login..."
        })

    }

}