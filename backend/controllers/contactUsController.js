const Contact = require("../models/contactUsModel");
const transporter = require("../config/mailSender"); // Ensure path matches where your transporter is defined

exports.contactUs = async (req, res) => {
  try {
    const { firstName, lastName, email, phoneNumber, countryCode, message } = req.body;

    // 1. Validation
    if (!firstName || !email || !message) {
      return res.status(400).json({
        success: false,
        message: "First name, email, and message are required fields.",
      });
    }

    const fullName = `${firstName} ${lastName || ""}`.trim();
    const phoneDisplay = phoneNumber ? `${countryCode || ""} ${phoneNumber}`.trim() : "Not provided";

    // 2. Save inquiry to MongoDB
    const contactEntry = await Contact.create({
      firstName,
      lastName,
      email,
      countryCode,
      phoneNumber,
      message,
    });

    // 3. Email sent to YOU (Admin/Support Inbox)
    const mailToAdmin = {
      from: `"StudyNotion Inquiries" <${process.env.MAIL_USER}>`,
      to: process.env.ADMIN_EMAIL || process.env.MAIL_USER, // your email address
      replyTo: email, // clicking "Reply" will reply directly to the student
      subject: `New Query / Issue from ${fullName}`,
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #222; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
          <h2 style="color: #000814; border-bottom: 2px solid #FFD60A; padding-bottom: 10px;">New User Inquiry</h2>
          <p><strong>Sender:</strong> ${fullName}</p>
          <p><strong>Email:</strong> <a href="mailto:${email}">${email}</a></p>
          <p><strong>Phone:</strong> ${phoneDisplay}</p>
          <p><strong>Inquiry ID:</strong> ${contactEntry._id}</p>
          <hr style="border: none; border-top: 1px solid #eee; margin: 15px 0;" />
          <p><strong>Message / Issue:</strong></p>
          <blockquote style="background: #f9f9f9; padding: 15px; border-left: 4px solid #FFD60A; margin: 0; font-size: 15px;">
            ${message}
          </blockquote>
        </div>
      `,
    };

    // 4. Auto-reply confirmation sent to the USER
    const mailToUser = {
      from: `"StudyNotion Support" <${process.env.MAIL_USER}>`,
      to: email,
      subject: "We have received your message | StudyNotion Support",
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
          <h2 style="color: #FFD60A; background: #000814; padding: 12px; text-align: center; border-radius: 4px;">StudyNotion</h2>
          <p>Hi <strong>${firstName}</strong>,</p>
          <p>Thank you for reaching out to us. We have logged your request under Reference ID <code>#${contactEntry._id}</code> and our support team will get back to you shortly.</p>
          <div style="background: #f8f8f8; padding: 12px; border-radius: 6px; margin: 15px 0;">
            <p style="margin: 0 0 8px 0;"><strong>Summary of your submission:</strong></p>
            <p style="margin: 0; font-style: italic; color: #555;">"${message}"</p>
          </div>
          <p style="font-size: 13px; color: #777;">If you have any further details to add, simply reply directly to this email.</p>
        </div>
      `,
    };

    // 5. Send both emails concurrently
    await Promise.all([
      transporter.sendMail(mailToAdmin),
      transporter.sendMail(mailToUser),
    ]);

    return res.status(200).json({
      success: true,
      message: "Your message has been sent and recorded successfully.",
      inquiryId: contactEntry._id,
    });
  } catch (error) {
    console.error("Contact Us Controller Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to submit inquiry. Please try again later.",
      error: error.message,
    });
  }
};