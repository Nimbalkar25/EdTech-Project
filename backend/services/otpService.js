const transporter = require("../config/mailSender")
exports.generateOtp = async (email) => {

    const otp = Math.floor(
        100000 + Math.random() * 900000
    ).toString();



    await transporter.sendMail({
        to: email,
        subject: "Email Verification OTP",
        html: `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e5e5e5; border-radius: 10px;">
    
        <h2 style="color: #2563eb; text-align: center;">
            Welcome to EdTech
        </h2>
    
        <p>Hello,</p>
    
        <p>
            Thank you for registering with <strong>EdTech</strong>.
            Please use the following One-Time Password (OTP) to verify your email address.
        </p>
    
        <div style="
            text-align: center;
            margin: 30px 0;
        ">
            <span style="
                display: inline-block;
                background-color: #2563eb;
                color: white;
                padding: 15px 30px;
                font-size: 28px;
                font-weight: bold;
                letter-spacing: 5px;
                border-radius: 8px;
            ">
                ${otp}
            </span>
        </div>
    
        <p>
            This OTP is valid for <strong>10 minutes</strong>.
        </p>
    
        <p>
            If you did not create an account, please ignore this email.
        </p>
    
        <hr style="margin-top: 30px;" />
    
        <p style="color: #666; font-size: 12px; text-align: center;">
            © ${new Date().getFullYear()} EdTech. All rights reserved.
        </p>
    
    </div>
    `
    });


    return otp;
}