const transporter = require("../config/mailSender");

exports.sendEnrollmentEmail = async ({
    email,
    studentName,
    courses
}) => {

    const courseList = courses.map(course => `
        <div style="
            background-color: #f5f5f5;
            border: 1px solid #e5e5e5;
            border-radius: 8px;
            padding: 15px;
            margin-bottom: 12px;
        ">
            <h3 style="
                margin: 0 0 8px 0;
                color: #222;
            ">
                ${course.courseTitle}
            </h3>

            <p style="
                margin: 0;
                color: #666;
                font-size: 14px;
            ">
                ${course.courseShortDescription}
            </p>
        </div>
    `).join("");


    await transporter.sendMail({
        to: email,
        subject: "Course Registration Confirmation",

        html: `
        <div style="
            font-family: Arial, sans-serif;
            max-width: 700px;
            margin: auto;
            padding: 30px;
            border: 1px solid #e5e5e5;
            border-radius: 10px;
            background-color: #ffffff;
        ">

            <div style="
                text-align: center;
                margin-bottom: 30px;
            ">
                <div style="
                    display: inline-block;
                    background-color: #FFD21C;
                    padding: 12px 25px;
                    border-radius: 8px;
                    font-size: 24px;
                    font-weight: bold;
                ">
                    <span style="
                        display: inline-block;
                        background-color: #000;
                        color: #FFD21C;
                        border-radius: 50%;
                        width: 32px;
                        height: 32px;
                        line-height: 32px;
                        margin-right: 5px;
                    ">
                        S
                    </span>

                    StudyNotion
                </div>
            </div>


            <h2 style="
                text-align: center;
                color: #333;
            ">
                Course Registration Confirmation
            </h2>


            <p style="font-size: 16px;">
                Dear <strong>${studentName}</strong>,
            </p>


            <p style="
                font-size: 16px;
                line-height: 1.6;
            ">
                You have successfully registered for the following course(s).
                We are excited to have you as a participant!
            </p>


            <div style="margin-top: 25px;">
                ${courseList}
            </div>


            <p style="
                font-size: 16px;
                line-height: 1.6;
            ">
                Please log in to your learning dashboard to access
                the course materials and start your learning journey.
            </p>


            <div style="text-align: center; margin: 30px 0;">
                <a href="${process.env.FRONTEND_URL}/dashboard"
                   style="
                       display: inline-block;
                       background-color: #FFD21C;
                       color: #0057D9;
                       padding: 14px 25px;
                       text-decoration: none;
                       font-weight: bold;
                       border-radius: 6px;
                   ">
                    Go to Dashboard
                </a>
            </div>


            <hr style="
                border: none;
                border-top: 1px solid #e5e5e5;
                margin-top: 30px;
            "/>


            <p style="
                color: #888;
                font-size: 13px;
                text-align: center;
            ">
                If you have any questions or need assistance,
                please feel free to reach out to us.
            </p>


            <p style="
                color: #888;
                font-size: 12px;
                text-align: center;
            ">
                © ${new Date().getFullYear()} StudyNotion.
                All rights reserved.
            </p>

        </div>
        `
    });
};