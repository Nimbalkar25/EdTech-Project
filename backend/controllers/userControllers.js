
const User = require("../models/userModel")
const bcrypt = require("bcryptjs");
const transporter = require("../config/mailSender") // for sending mail
const otpService = require("../utils/otpService");
const { generateToken } = require("../utils/tokenService");


// Register User
exports.registerUser = async (req, res) => {
    try {
        const { firstName, lastName,gender, email, countrycode, phoneNumber, password, confirmPassword, role } = req.body;

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

        const token = await generateToken(existingUser, "7d");

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
        if(!user){
            return res.status(400).json({
                success:false,
                message:`User not Found..`
            })
        }

        const passwordMatch = await bcrypt.compare(enteredPassword, user.password);

        if(!passwordMatch){
            return res.status(400).json({
                success:false,
                message:`Password is Incorrect`
            })
        }

        await User.findByIdAndDelete(userId);

        return res.status(200).json({
            success:true,
            message:`Account deleted successfully..`
        })







    } catch (error) {
        return res.status(500).json({
            success: false,
            message: `Something went wrong while Deleting profile.`,
            error: error.message
        });
    }
}