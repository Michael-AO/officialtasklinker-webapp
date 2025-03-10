import { getFunctions, httpsCallable } from "firebase/functions";

const sendVerificationEmail = async (email, code) => {
  const functions = getFunctions();
  const sendEmail = httpsCallable(functions, "sendVerificationEmail");

  try {
    await sendEmail({ email, code });
  } catch (error) {
    console.error("Error sending email:", error);
  }
};

export default sendVerificationEmail;
