const e = require("express");
const User = require("../models/userModel")
const bcrypt = require("bcryptjs");
const transporter = require("../config/mailSender") // for sending mail
const otpService = require("../utils/otpService");
const {generateToken} = require("../utils/tokenService")


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

// otp verification to know its verified used if register and if they login tomorrow if verified then only need to give them login
//created otp service to generate and send mail and return otp so we can use anywhere
        const otp =await otpService.generateOtp(email);

        // user created temp will store otp and expiry
        const userSaved = await User.create({
            firstName,
            lastName,
            email,
            password: hashPassword,
            countrycode,
            phoneNumber,
            role,
            otp,
            otpExpires: Date.now() + 10 * 60 * 1000
        })


        // to not show otp and password in response
        userSaved.password = undefined;
        userSaved.otp = undefined;
        userSaved.otpExpires = undefined;

        res.status(201).json({
            success: true,
            message: `Please verify email with Otp Sent to registered email.`,
            data: userSaved
        })
    } catch (error) {
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

        if (!existingUser.emailVerified) {
            return res.status(401).json({
                success: false,
                message: "Please verify your email first"
            });
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

        const token =  await generateToken(existingUser,"7d");

        existingUser.password = undefined; // to not give password to anyone 
        res.status(200).json({
            success: true,
            message: `Login Successfully. Welcome to StudyNotion...`,
            token,
            data: existingUser
        })

    } catch (error) {
        return res.status(500).json({
            success: false,
            error: error.message,
            message: "Errror while Login..."
        })

    }

}



// verify Otp Controller 

exports.verifyEmail = async (req, res) => {

    try {
        const { email, otp } = req.body;
        
        const existingUser = await User.findOne({ email }).select("+otp +otpExpires");

        if (!existingUser) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        if (existingUser.otp !== otp) {
            return res.status(400).json({
                success: false,
                message: "Invalid OTP"
            });
        }
        if (existingUser.otpExpires < Date.now()) {
            return res.status(400).json({
                success: false,
                message: "OTP expired"
            });
        }

        existingUser.emailVerified = true;
        existingUser.otp = undefined;
        existingUser.otpExpires = undefined;

        await existingUser.save();

        return res.status(200).json({
            success: true,
            message: "Email verified successfully"
        });

    } catch (error) {

        return res.status(500).json({
            success: false,
            message: error.message
        });

    }
};

// Resend OTP 

exports.resendOTP = async (req, res) => {

    try {

        const { email } = req.body;

        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        if (user.emailVerified) {
            return res.status(400).json({
                success: false,
                message: "Email already verified"
            });
        }

        const otp = await otpService.generateOtp(email)

        user.otp = otp;
        user.otpExpires =
            Date.now() + 5 * 60 * 1000;

        await user.save();


        return res.status(200).json({
            success: true,
            message: "OTP sent successfully"
        });

    } catch (error) {

        return res.status(500).json({
            success: false,
            message: error.message
        });

    }
};



