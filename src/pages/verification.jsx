import React from "react";
import { useNavigate } from "react-router-dom"; // Import useNavigate
import styles from "./verification.module.css";
import back from "./backarrow.png";

function Verification() {
  const navigate = useNavigate(); // Initialize navigate function

  // Function to go back to the Register page
  const handleBackClick = () => {
    navigate("/register"); // Change "/register" to your actual route
  };

  return (
    <div className={styles.frameParent}>
      <div className={styles.groupParent}>
        {/* Back Arrow */}
        <div className={styles.evaarrowBackFillParent} onClick={handleBackClick} style={{ cursor: "pointer" }}>
          <img className={styles.evaarrowBackFillIcon} alt="Back" src={back} />
          <div className={styles.back}>Back</div>
        </div>

        <div className={styles.frameGroup}>
          <div className={styles.step3Of3Wrapper}>
            <div className={styles.step3Of}>Step 3 of 3</div>
          </div>
          <div className={styles.enterVerificationCodeParent}>
            <div className={styles.enterVerificationCode}>{`Enter Verification Code `}</div>
            <div className={styles.rectangleParent}>
              <div className={styles.frameChild} />
              <div className={styles.frameChild} />
              <div className={styles.frameChild} />
            </div>
          </div>
        </div>
        <i className={styles.weveSentA}>
          We've sent a verification code to your email. Please enter the code below to confirm your account and proceed.
        </i>
        <div className={styles.frameContainer}>
          <div className={styles.frameDiv}>
            <div className={styles.rectangleGroup}>
              <div className={styles.rectangleDiv} />
              <div className={styles.rectangleDiv} />
              <div className={styles.rectangleDiv} />
              <div className={styles.rectangleDiv} />
              <div className={styles.rectangleDiv} />
              <div className={styles.rectangleDiv} />
            </div>
            <i className={styles.codeExpiresIn}>Code expires in 30s</i>
          </div>
          <div className={styles.sendViaSmsParent}>
            <i className={styles.sendViaSms}>{`Send via SMS `}</i>
            <i className={styles.resendCode}>Resend code</i>
          </div>
        </div>
        <div className={styles.frameWrapper}>
          <div className={styles.confirmFinishWrapper}>
            <div className={styles.confirmFinish}>{`Confirm & Finish`}</div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Verification;
