import React, { useState, useRef, useEffect } from "react";
import styles from "./verification.module.css";
import verivector from "./verivector.png";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { doc, getDoc, deleteDoc } from "firebase/firestore";
import { db } from "./firebase.js"; // Ensure db is imported

function Verification() {
  const length = 6; // Number of OTP input fields
  const [otp, setOtp] = useState(new Array(length).fill(""));
  const [actualCode, setActualCode] = useState(null);
  const inputRefs = useRef([]);
  const navigate = useNavigate();
  const location = useLocation();
  const userId = location.state?.userId;

  useEffect(() => {
    // Fetch the verification code from Firestore
    const fetchCode = async () => {
      if (!userId) return;
      const docRef = doc(db, "verificationCodes", userId);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setActualCode(docSnap.data().code); // Get the stored verification code
      } else {
        console.error("No verification code found");
      }
    };

    fetchCode();
  }, [userId]);

  const handleChange = (index, event) => {
    const value = event.target.value;
    if (isNaN(value)) return; // Allow only numbers

    const newOtp = [...otp];
    newOtp[index] = value.substring(value.length - 1); // Store only the last typed digit
    setOtp(newOtp);

    // Move focus to the next input field
    if (value && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleBackspace = (index, event) => {
    if (event.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerify = async () => {
    if (otp.join("") === actualCode) {
      // Verification successful, remove the code from Firestore
      await deleteDoc(doc(db, "verificationCodes", userId));

      // Redirect to homepage after successful verification
      navigate("/");
    } else {
      console.error("Invalid verification code");
    }
  };

  return (
    <div className={styles.verification}>
      <div className={styles.background} />
      <div className={styles.background1} />
      <div className={styles.quietyTakeNotesInContainer}>
        <p className={styles.quietyTakeNotesIn}>Quiety take-notes in the back-</p>
        <p className={styles.quietyTakeNotesIn}>ground. Allowing to take fully</p>
        <p className={styles.quietyTakeNotesIn}>engaged in the conversation</p>
      </div>
      <div className={styles.termsAndConditions}>
        <div className={styles.privacyPolicy}>{`Terms and Conditions `}</div>
        <div className={styles.privacyPolicy}>Privacy Policy</div>
      </div>
      <div className={styles.wrapper}>
        <div className={styles.goBack}>
          <img className={styles.vectorIcon} alt="" src={verivector} />
          <div className={styles.back}>Back</div>
        </div>
        <div className={styles.pagheader}>
          <div className={styles.step3Of3Wrapper}>
            <div className={styles.step3Of}>Step 3 of 3</div>
          </div>
          <div className={styles.enterVerificationCodeParent}>
            <div className={styles.enterVerificationCode}>
              {`Enter Verification Code `}
            </div>
          </div>
        </div>
        <i className={styles.weveSentA}>
          We've sent a verification code to your email. Please enter the code below to confirm your account and proceed.
        </i>
        <div className={styles.otpinputParent}>
          <div className={styles.otpinput}>
            {otp.map((digit, index) => (
              <input
                key={index}
                ref={(el) => (inputRefs.current[index] = el)}
                type="text"
                value={digit}
                maxLength="1"
                onChange={(e) => handleChange(index, e)}
                onKeyDown={(e) => handleBackspace(index, e)}
                className={styles.otpinputChild}
              />
            ))}
          </div>
          <i className={styles.codeExpiresIn}>Code expires in 30s</i>
        </div>
        <div className={styles.sendViaSmsParent}>
          <i className={styles.privacyPolicy}>{`Send via SMS `}</i>
          <i className={styles.resendCode}>Resend code</i>
        </div>
      </div>
      <div className={styles.confirmverification}>
	  <Link to="/userHomepage" className={styles.confirmFinish} onClick={handleVerify}>Confirm and Finish</Link>
      </div>
    </div>
  );
}

export default Verification;
