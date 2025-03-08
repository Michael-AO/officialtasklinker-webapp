import axios from "axios";

const sendVerificationEmail = async (email, verificationCode) => {
  try {
    await axios.post("https://your-cloud-function-url/send-email", {
      email,
      verificationCode,
    });
  } catch (error) {
    console.error("Error sending email:", error);
  }
};

export default sendVerificationEmail;