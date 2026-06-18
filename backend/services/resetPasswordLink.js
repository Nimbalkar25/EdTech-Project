const {generateToken} = require("./tokenService");
const transporter = require("../config/mailSender");

exports.sendResetPasswordLink = async (user) => {

    const token = await generateToken(user);

    user.resetPasswordToken = token;

    user.resetPasswordExpires =
        Date.now() + 5 * 60 * 1000;

    await user.save();

    const resetLink =
        `http://localhost:5173/reset-password/${token}`;

    await transporter.sendMail({
        to: user.email,
        subject: "Reset Password Link",
        html: `
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e5e5e5; border-radius: 10px;">

    <h2 style="color: #dc2626; text-align: center;">
        Reset Your Password
    </h2>

    <p>Hello,</p>

    <p>
        We received a request to reset the password for your
        <strong>EdTech</strong> account.
    </p>

    <p>
        Click the button below to create a new password:
    </p>

    <div style="text-align: center; margin: 30px 0;">
        <a
            href="${resetLink}"
            style="
                background-color: #2563eb;
                color: white;
                text-decoration: none;
                padding: 14px 30px;
                border-radius: 8px;
                font-size: 16px;
                font-weight: bold;
                display: inline-block;
            "
        >
            Reset Password
        </a>
    </div>

    <p>
        If the button doesn't work, copy and paste the following link into your browser:
    </p>

    <p style="word-break: break-all;">
        <a href="${resetLink}">
            ${resetLink}
        </a>
    </p>

    <p>
        This link will expire in <strong>5 minutes</strong>.
    </p>

    <p>
        If you did not request a password reset, please ignore this email.
        Your password will remain unchanged.
    </p>

    <hr style="margin-top: 30px;" />

    <p style="color: #666; font-size: 12px; text-align: center;">
        © ${new Date().getFullYear()} EdTech. All rights reserved.
    </p>

</div>

`
    });

    return token;
}