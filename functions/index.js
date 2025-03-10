const functions = require("firebase-functions");
const nodemailer = require("nodemailer");

// Configure email transport (replace with your credentials)
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "your-email@gmail.com",
    pass: "your-password",
  },
});

// Cloud Function to send verification email
exports.sendVerificationEmail = functions.https.onCall(async (data, context) => {
  const { email, code } = data;

  const mailOptions = {
    from: "your-email@gmail.com",
    to: email,
    subject: "TaskLinkers Verification Code",
    text: `Your verification code is: ${code}`,
  };

  try {
    await transporter.sendMail(mailOptions);
    return { success: true };
  } catch (error) {
    console.error("Error sending email:", error);
    return { success: false, error: error.message };
  }
});

