import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth, db, setDoc } from "../firebase";
import styles from "./RegisterP.module.css";
import google from "./google.png";
import line from "./Vector 3.png";

function RegisterP() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const generateVerificationCode = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
  };

  const handleCreateAccount = async () => {
    if (formData.password !== formData.confirmPassword) {
      alert("Passwords do not match");
      return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        formData.email,
        formData.password
      );
      const user = userCredential.user;
      const verificationCode = generateVerificationCode();

      await setDoc(doc(db, "users", user.uid), {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        verificationCode,
      });

      // Navigate to verification page with user ID
      navigate("/verification", { state: { userId: user.uid } });
    } catch (error) {
      alert(error.message);
    }
  };

  return (
    <div className={styles.registerpage}>
      <div className={styles.stepcountParent}>
        <div className={styles.stepcount}>
          <div className={styles.step2Of3Wrapper}>
            <div className={styles.step2Of}>Step 2 of 3</div>
          </div>
          <div className={styles.registerConnectWithTasksParent}>
            <div className={styles.registerConnect}>
              {`Register & Connect with tasks, jobs, and opportunities that match your skills.`}
            </div>
          </div>
        </div>

        <div className={styles.frameParent}>
          <div className={styles.frameGroup}>
            <div className={styles.inputfieldParent}>
              <div className={styles.inputfield}>
                <label className={styles.firstName}>First Name</label>
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  className={styles.inputContainer}
                  placeholder="Michael"
                />
              </div>
              <div className={styles.inputfield}>
                <label className={styles.firstName}>Last Name</label>
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  className={styles.inputContainer}
                  placeholder="Last Name"
                />
              </div>
            </div>

            <div className={styles.frameContainer}>
              <div className={styles.inputfield}>
                <label className={styles.firstName}>Email Address</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={styles.inputContainer}
                  placeholder="michaeltasks@gmail.com"
                />
              </div>
              <div className={styles.inputfield}>
                <label className={styles.firstName}>Phone Number</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className={styles.inputContainer}
                  placeholder="Enter phone number"
                />
              </div>
            </div>

            <div className={styles.frameParent1}>
              <div className={styles.inputfield}>
                <label className={styles.firstName}>Password</label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className={styles.inputContainer}
                  placeholder="********"
                />
              </div>
              <div className={styles.inputfield}>
                <label className={styles.firstName}>Confirm Password</label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className={styles.inputContainer}
                  placeholder="********"
                />
              </div>
            </div>
          </div>

          <div className={styles.groupParent}>
            <div className={styles.groupDiv}>
              <button className={styles.createAccountWrapper} onClick={handleCreateAccount}>
                <div className={styles.Button}>Create Account</div>
              </button>
            </div>

            
          </div>
        </div>
      </div>
    </div>
  );
}

export default RegisterP;
