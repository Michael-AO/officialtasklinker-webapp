import React, { useState, useRef, useEffect } from "react";
import styles from "./verification.module.css";
import verivector from "./verivector.png";
import { useNavigate, useLocation } from "react-router-dom";
import { doc, getDoc, deleteDoc } from "firebase/firestore";
import { db } from "../firebase.js"; // Ensure Firestore is imported

function Verification() {
  const length = 6; // Number of OTP input fields
  const [otp, setOtp] = useState(new Array(length).fill(""));
  const [actualCode, setActualCode] = useState(null);
  const [error, setError] = useState(null);
  const [timeLeft, setTimeLeft] = useState(30);
  const inputRefs = useRef([]);
  const navigate = useNavigate();
  const location = useLocation();
  const userId = location.state?.userId;

  useEffect(() => {
    if (!userId) {
      navigate("/"); 
      return;
    }

    const fetchCode = async () => {
      try {
        const docRef = doc(db, "verificationCodes", userId);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setActualCode(docSnap.data().code);
        } else {
          setError("No verification code found. Please request a new one.");
        }
      } catch (err) {
        setError("An error occurred while fetching the verification code.");
      }
    };

    fetchCode();
  }, [userId, navigate]);

  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [timeLeft]);

  useEffect(() => {
    inputRefs.current[0]?.focus(); // Auto-focus first input
  }, []);

  const handleChange = (index, event) => {
    const value = event.target.value.replace(/\D/, ""); // Allow only numbers
    if (!value) return;

    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);

    if (index < length - 1 && value) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleBackspace = (index, event) => {
    if (event.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerify = async () => {
    const enteredCode = otp.join("");
    if (enteredCode.length < length) {
      setError("Please enter the full verification code.");
      return;
    }

    if (!actualCode) {
      setError("Verification code is missing. Please request a new one.");
      return;
    }

    if (enteredCode === actualCode) {
      await deleteDoc(doc(db, "verificationCodes", userId));
      navigate("/userHomepage");
    } else {
      setError("Invalid verification code. Please try again.");
    }
  };

  const handleResend = () => {
    setTimeLeft(30);
    setError(null);
    setOtp(new Array(length).fill("")); 
    inputRefs.current[0]?.focus();
  };

  return (
    <div className={styles.verification}>
      <div className={styles.background} />
      <div className={styles.background1} />

      <div className={styles.wrapper}>
        <div className={styles.goBack} onClick={() => navigate(-1)}>
          <img className={styles.vectorIcon} alt="" src={verivector} />
          <div className={styles.back}>Back</div>
        </div>

        <div className={styles.pagheader}>
          <div className={styles.step3Of3Wrapper}>
            <div className={styles.step3Of}>Step 3 of 3</div>
          </div>
          <div className={styles.enterVerificationCodeParent}>
            <div className={styles.enterVerificationCode}>Enter Verification Code</div>
          </div>
        </div>

        <p className={styles.description}>
          We've sent a verification code to your email. Please enter the code below to confirm your account.
        </p>

        {error && <div className={styles.errorMessage}>{error}</div>}

        <div className={styles.otpinputParent}>
          <div className={styles.otpinput}>
            {otp.map((digit, index) => (
              <input
                key={index}
                ref={(el) => (inputRefs.current[index] = el)}
                type="text"
                value={digit}
                maxLength="1"
                autoComplete="one-time-code"
                onChange={(e) => handleChange(index, e)}
                onKeyDown={(e) => handleBackspace(index, e)}
                className={styles.otpinputChild}
              />
            ))}
          </div>
          <i className={styles.codeExpiresIn}>
            Code expires in {timeLeft}s
          </i>
        </div>

        <div className={styles.sendViaSmsParent}>
          <i className={styles.privacyPolicy}>Send via SMS</i>
          <i 
            className={timeLeft === 0 ? styles.resendCode : styles.disabledResend} 
            onClick={timeLeft === 0 ? handleResend : null}
          >
            Resend code
          </i>
        </div>

        <div className={styles.confirmverification}>
          <button
            className={styles.confirmFinish}
            onClick={handleVerify}
            disabled={otp.join("").length < length}
          >
            Confirm and Finish
          </button>
        </div>
      </div>
    </div>
  );
}

export default Verification;
