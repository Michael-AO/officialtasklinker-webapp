import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { createUserWithEmailAndPassword, sendEmailVerification, onAuthStateChanged } from "firebase/auth";
import { auth, db } from "../firebase";
import { doc, setDoc } from "firebase/firestore";
import styles from "./RegisterP.module.css";

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
  const [loading, setLoading] = useState(false);

  // Redirect logged-in users to login page
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        navigate("/login");
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const validateForm = () => {
    const { firstName, lastName, email, phone, password, confirmPassword } = formData;

    if (!firstName || !lastName || !email || !phone || !password || !confirmPassword) {
      alert("All fields must be filled before submitting.");
      return false;
    }

    if (!/^\+234\d{10}$/.test(phone)) {
      alert("Phone number must be in the correct format: +234XXXXXXXXXX");
      return false;
    }

    if (password !== confirmPassword) {
      alert("Passwords do not match.");
      return false;
    }

    return true;
  };

  const handleCreateAccount = async () => {
    if (!validateForm()) return;

    setLoading(true);
    
    try {
      // Create user with email and password
      const userCredential = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
      const user = userCredential.user;

      // Send Firebase email verification
      await sendEmailVerification(user);

      // Store user details in Firestore
      await setDoc(doc(db, "users", user.uid), {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        isVerified: false, // Email verification handled by Firebase
        createdAt: new Date(),
      });

      alert("Account created successfully! Please check your email to verify your account.");
      navigate("/login"); // Redirect to login page

    } catch (error) {
      alert(error.message);
    } finally {
      setLoading(false);
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
                  placeholder="+234XXXXXXXXXX"
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
              <button
                className={styles.createAccountWrapper}
                onClick={handleCreateAccount}
                disabled={loading}
              >
                {loading ? "Creating..." : "Create Account"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default RegisterP;
