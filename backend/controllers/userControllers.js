
const User = require("../models/userModel")
const bcrypt = require("bcryptjs");
const transporter = require("../config/mailSender") // for sending mail
const otpService = require("../utils/otpService");
const { generateToken } = require("../utils/tokenService");


// Register User
exports.registerUser = async (req, res) => {
    try {
        const { firstName, lastName, gender, email, countrycode, phoneNumber, password, confirmPassword, role } = req.body;

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

        // Validate plain password with regex BEFORE hashing
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
        if (!passwordRegex.test(password)) {
            return res.status(400).json({
                success: false,
                message: "Password must contain at least 1 uppercase letter, 1 lowercase letter, 1 number, and be at least 8 characters long."
            });
        }

        const hashPassword = await bcrypt.hash(password, 10);

        // otp verification to know its verified used if register and if they login tomorrow if verified then only need to give them login
        //created otp service to generate and send mail and return otp so we can use anywhere
        const otp = await otpService.generateOtp(email);

        // user created temp will store otp and expiry
        const userSaved = await User.create({
            firstName,
            lastName,
            gender,
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

// exports.loginUser
exports.loginUser = async (req, res) => {
    try {
        const { role, email, password } = req.body;

        // 1. Basic validation
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: "Please provide both email and password.",
            });
        }

        // 2. Sanitize email input
        const sanitizedEmail = email.toLowerCase().trim();

        // 3. Fetch user with sensitive security fields explicitly included
        const existingUser = await User.findOne({ email: sanitizedEmail }).select(
            "+password +failedLoginAttempts +lockUntil"
        );

        if (!existingUser) {
            return res.status(404).json({
                success: false,
                message: `No account found with ${email}. Please register first.`,
            });
        }
        if (!existingUser.emailVerified) {

            // Generate and send a fresh OTP so they aren't stuck with an expired one
            const newOtp = await otpService.generateOtp(existingUser.email);

            existingUser.otp = newOtp;
            existingUser.otpExpires = Date.now() + 10 * 60 * 1000; // 10 mins
            await existingUser.save();

            return res.status(403).json({
                success: false,
                emailVerified: false,   
                email: existingUser.email,
                message: "Your email is not verified. A new verification OTP has been sent to your email.",
            });
        }


        // 4. Check if account is currently locked out
        if (existingUser.lockUntil && existingUser.lockUntil > Date.now()) {
            const remainingMinutes = Math.ceil(
                (existingUser.lockUntil - Date.now()) / (60 * 1000)
            );
            return res.status(423).json({
                success: false,
                message: `Account is temporarily locked. Please try again in ${remainingMinutes} minute(s).`,
            });
        }

        // 5. Role validation (Checked before bcrypt to save expensive CPU hashing cycles)
        if (role && role.toLowerCase() !== existingUser.role.toLowerCase()) {
            return res.status(400).json({
                success: false,
                message: `Account role mismatch. Please select the correct role (${existingUser.role}).`,
            });
        }

        // 6. Email verification check (includes flag for frontend redirection)
        if (!existingUser.emailVerified) {
            return res.status(403).json({
                success: false,
                isUnverified: true,
                email: existingUser.email,
                message: "Your email is not verified. Please verify your email before logging in.",
            });
        }

        // 7. Validate password
        const isPasswordMatch = await bcrypt.compare(password, existingUser.password);

        if (!isPasswordMatch) {
            const attempts = (existingUser.failedLoginAttempts || 0) + 1;
            const updates = { failedLoginAttempts: attempts };

            // Lock account for 15 minutes after 5 failed attempts
            if (attempts >= 5) {
                updates.lockUntil = new Date(Date.now() + 15 * 60 * 1000);
                updates.failedLoginAttempts = 0; // Reset counter for next lock cycle
            }

            await User.findByIdAndUpdate(existingUser._id, updates);

            const attemptsLeft = Math.max(0, 5 - attempts);
            return res.status(401).json({
                success: false,
                message:
                    attemptsLeft > 0
                        ? `Incorrect password. You have ${attemptsLeft} attempt(s) remaining.`
                        : "Too many failed attempts. Your account has been locked for 15 minutes.",
            });
        }

        // 8. Clear lockout states upon successful password validation
        if (existingUser.failedLoginAttempts > 0 || existingUser.lockUntil) {
            await User.findByIdAndUpdate(existingUser._id, {
                failedLoginAttempts: 0,
                lockUntil: null,
            });
        }

        // 9. Generate JWT authentication token
        const token = await generateToken(existingUser, "7d");

        // 10. Clean user object before sending (convert from Mongoose doc to plain object)
        const userData = existingUser.toObject();
        delete userData.password;
        delete userData.failedLoginAttempts;
        delete userData.lockUntil;

        // 11. Optional HttpOnly cookie setup for enhanced production security
        const cookieOptions = {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        };

        return res
            .cookie("token", token, cookieOptions)
            .status(200)
            .json({
                success: true,
                message: "Login successful! Welcome to StudyNotion.",
                token,
                data: userData,
            });
    } catch (error) {
        console.error("Login Error:", error);
        return res.status(500).json({
            success: false,
            message: "An error occurred during login. Please try again later.",
            error: error.message,
        });
    }
};



// verify Otp Controller 

// exports.verifyEmail
exports.verifyEmail = async (req, res) => {
    try {
        const { email, otp } = req.body;

        // 1. Validate required fields
        if (!email || !otp) {
            return res.status(400).json({
                success: false,
                message: "Email and OTP are both required.",
            });
        }

        // 2. Normalize email format to match registration logic
        const sanitizedEmail = email.toLowerCase().trim();

        // 3. Find user and explicitly select hidden sensitive fields (+otp, +otpExpires)
        const existingUser = await User.findOne({ email: sanitizedEmail }).select(
            "+otp +otpExpires +password"
        );

        if (!existingUser) {
            return res.status(404).json({
                success: false,
                message: "User not found. Please register first.",
            });
        }

        // 4. Guard against re-verification if account is already verified
        if (existingUser.emailVerified) {
            return res.status(400).json({
                success: false,
                message: "This account has already been verified. Please log in.",
            });
        }

        // 5. Verify OTP expiration before checking equality
        if (!existingUser.otpExpires || existingUser.otpExpires < Date.now()) {
            return res.status(400).json({
                success: false,
                message: "OTP has expired. Please request a new verification code.",
            });
        }

        // 6. Validate OTP value (cast to String and trim to avoid type-mismatch bugs)
        if (String(existingUser.otp).trim() !== String(otp).trim()) {
            return res.status(400).json({
                success: false,
                message: "Invalid OTP. Please check the code and try again.",
            });
        }

        // 7. Update verification status and wipe temporary OTP credentials
        existingUser.emailVerified = true;
        existingUser.otp = undefined;
        existingUser.otpExpires = undefined;

        // Persist verified state to database first
        await existingUser.save();

        // 8. Generate auth token for auto-login / immediate session
        const token = await generateToken(existingUser, "7d");

        // 9. Sanitize user data before sending in the response payload
        const userData = existingUser.toObject();
        delete userData.password;
        delete userData.otp;
        delete userData.otpExpires;

        // 10. (Optional) Set HttpOnly cookie for production cookie-based auth
        const cookieOptions = {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in milliseconds
        };

        return res
            .cookie("token", token, cookieOptions)
            .status(200)
            .json({
                success: true,
                message: "Email verified successfully! Welcome to StudyNotion.",
                token,
                data: userData,
            });
    } catch (error) {
        console.error("Verify Email Error:", error);
        return res.status(500).json({
            success: false,
            message: "An error occurred while verifying the email. Please try again.",
            error: error.message,
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

exports.getUsers = async (req, res) => {
    try {

        const users = await User.find();

        if (!users) {
            return res.status(404).json({
                success: false,
                message: `User not Found.`
            })
        }

        return res.status(200).json({
            success: true,
            message: `Users Fetched Sucessfully...`,
            data: users
        })



    } catch (error) {
        return res.status(500).json({
            success: false,
            error: error.message,
            message: `Something went Wrong while fetching data`
        })

    }
}

exports.getUserById = async (req, res) => {
    try {
        const userId = req.user.id;

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: `User not Found.`
            })
        }

        return res.status(200).json({
            success: true,
            message: `User Fetched Sucessfully...`,
            data: user
        })

    } catch (error) {
        return res.status(500).json({
            success: false,
            error: error.message,
            message: `Something went Wrong while fetching data for ${user.firstName} ${user.lastName}`
        })
    }
}

const cloudinary = require("cloudinary").v2
const { uploadToCloudinary, deleteFromCloudinary } = require("../utils/uploadToCloudinary");
const sharp = require("sharp");
// edit avatar Of user

exports.editAvatar = async (req, res) => {
    try {

        const userId = req.user.id;

        if (!userId) {
            return res.status(400).json({
                success: false,
                message: `Please Login first not valid token`
            })
        }

        const user = await User.findById(userId);
        if (!user) {
            return res.status(400).json({
                success: false,
                message: `User not found`
            })
        }

        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: "Please upload an avatar."
            });
        }


        if (user.avatar?.public_id) {
            await cloudinary.uploader.destroy(user.avatar.public_id);
        }

        const allowedTypes = [
            "image/jpeg",
            "image/png",
            "image/webp",
            "image/avif"
        ];

        if (!allowedTypes.includes(req.file.mimetype)) {
            return res.status(400).json({
                success: false,
                message: "Only JPG, PNG and WEBP are allowed."
            });
        }

        const fileSizeMB = req.file.size / (1024 * 1024);

        if (fileSizeMB > 2) {
            return res.status(400).json({
                success: false,
                message: "Avatar size must not exceed 2 MB."
            });
        }

        const metadata = await sharp(req.file.buffer).metadata();

        if (metadata.width < 200 || metadata.height < 200) {
            return res.status(400).json({
                success: false,
                message: "Minimum resolution is 200 x 200."
            });
        }

        const uploadedAvatar = await await uploadToCloudinary(
            req.file,
            `${process.env.FOLDER_NAME}/${process.env.USER_AVATAR}/${userId}`
        );

        user.avatar = {
            url: uploadedAvatar.secure_url,
            public_id: uploadedAvatar.public_id
        }

        await user.save();




        return res.status(200).json({
            success: true,
            message: "Avatar updated successfully.",
            data: user
        });


    } catch (error) {
        return res.status(500).json({
            success: false,
            message: `Something went wrong while changing Avatar.`,
            error: error.message
        })
    }
}


// Profile Edit 

exports.editProfile = async (req, res) => {
    try {
        const {
            displayName,
            profession,
            gender,
            dateOfBirth,
            phoneNumber,
            about,
            currentPassword,
            changePassword
        } = req.body

        const userId = req.user.id;

        if (!userId) {
            return res.status(400).json({
                success: false,
                message: `Please Login first not valid token`
            })
        }

        const user = await User.findById(userId).select("+password");

        if (!user) {
            return res.status(404).json({
                success: false,
                message: `User not found`
            })
        }

        if (currentPassword || changePassword) {


            if (!currentPassword || !changePassword) {
                return res.status(400).json({
                    success: false,
                    message: `Please enter currentPassword and changePassword.`
                })
            }

            const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;

            if (!passwordRegex.test(changePassword)) {
                return res.status(400).json({
                    success: false,
                    message: `Changed Password must contain at least 1 uppercase letter, 1 lowercase letter and 1 number and length atleast 8`
                })
            }

            const passwordMatched = await bcrypt.compare(
                currentPassword,
                user.password
            );


            if (!passwordMatched) {
                return res.status(400).json({
                    success: false,
                    message: `Please enter correct Current Password`
                })
            }

            if (currentPassword === changePassword) {
                return res.status(400).json({
                    success: false,
                    message: "New password cannot be the same as the current password."
                });
            }

            const hashNewPassword = await bcrypt.hash(changePassword, 10);

            user.password = hashNewPassword;
        }





        if (displayName !== undefined) user.displayName = displayName;
        if (dateOfBirth !== undefined) user.dateOfBirth = dateOfBirth;
        if (about !== undefined) user.about = about;
        if (profession !== undefined) user.profession = profession;
        if (phoneNumber !== undefined) user.phoneNumber = phoneNumber;
        if (gender !== undefined) user.gender = gender;


        await user.save();

        // Remove password before sending response
        user.password = undefined;

        return res.status(200).json({
            success: true,
            message: `Profile Updated Successfully.`,
            data: user
        })



    } catch (error) {
        return res.status(500).json({
            success: false,
            message: `Something went wrong while Updating profile.`,
            error: error.message
        })
    }
}

exports.deleteAccount = async (req, res) => {
    try {

        const userId = req.user.id;
        const { enteredPassword } = req.body;

        if (!userId) {
            return res.status(400).json({
                success: false,
                message: `Please Login first not valid token`
            })
        };

        const user = await User.findById(userId).select("+password");
        if (!user) {
            return res.status(400).json({
                success: false,
                message: `User not Found..`
            })
        }

        const passwordMatch = await bcrypt.compare(enteredPassword, user.password);

        if (!passwordMatch) {
            return res.status(400).json({
                success: false,
                message: `Password is Incorrect`
            })
        }

        await User.findByIdAndDelete(userId);

        return res.status(200).json({
            success: true,
            message: `Account deleted successfully..`
        })







    } catch (error) {
        return res.status(500).json({
            success: false,
            message: `Something went wrong while Deleting profile.`,
            error: error.message
        });
    }
}