import React, { useState } from 'react';
import { auth, db } from '../firebase'; // Import Firebase auth & Firestore
import { createUserWithEmailAndPassword, sendEmailVerification } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import styles from './RegisterAccount.module.css';
import google from './google.png';

function RegisterAccount({ onCreateAccount }) {
    const [formData, setFormData] = useState({
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      password: '',
      confirmPassword: ''
    });
  
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
  
    const handleChange = (e) => {
      const { name, value } = e.target;
      setFormData((prevData) => ({
        ...prevData,
        [name]: value,
      }));
    };
  
    const handleSubmit = async (e) => {
      e.preventDefault();
      setError('');
      
      if (formData.password !== formData.confirmPassword) {
        setError("Passwords do not match!");
        return;
      }
  
      try {
        setLoading(true);
        // Create user in Firebase Authentication
        const userCredential = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
        const user = userCredential.user;
  
        // Determine admin status
        const status = formData.email === "asereopeyemimichael@gmail.com" ? "admin" : "not admin";
  
        // Save user info in Firestore (excluding password)
        await setDoc(doc(db, "users", user.uid), {
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          phone: formData.phone,
          verified: false,
          status: status // Add status field
        });
  
        // Send verification email
        await sendEmailVerification(user);
  
        // Call the onCreateAccount callback to move to step 3
        onCreateAccount();
  
        // Redirect to verification page
        navigate('/verification');
  
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };
  
    return (
      <div className={styles.registeraccount}>
        <div className={styles.registeraccount1}>
          <form onSubmit={handleSubmit} className={styles.frameParent}>
            <div className={styles.inputfieldParent}>
              <div className={styles.inputfield}>
                <div className={styles.firstName}>First Name</div>
                <input type="text" name="firstName" value={formData.firstName} onChange={handleChange} className={styles.inputclass} placeholder="Enter your first name" required />
              </div>
              <div className={styles.inputfield}>
                <div className={styles.firstName}>Last Name</div>
                <input type="text" name="lastName" value={formData.lastName} onChange={handleChange} className={styles.inputclass} placeholder="Enter your last name" required />
              </div>
            </div>
            <div className={styles.frameGroup}>
              <div className={styles.inputfield}>
                <div className={styles.firstName}>Email Address</div>
                <input type="email" name="email" value={formData.email} onChange={handleChange} className={styles.inputclass} placeholder="Enter your email" required />
              </div>
              <div className={styles.inputfield}>
                <div className={styles.firstName}>Phone Number</div>
                <input type="tel" name="phone" value={formData.phone} onChange={handleChange} className={styles.inputclass} placeholder="Enter your phone number" required />
              </div>
            </div>
            <div className={styles.frameDiv}>
              <div className={styles.inputfield}>
                <div className={styles.firstName}>Password (at least 8 characters)</div>
                <input type="password" name="password" value={formData.password} onChange={handleChange} className={styles.inputclass} placeholder="Enter your password" required />
              </div>
              <div className={styles.inputfield}>
                <div className={styles.firstName}>Confirm Password</div>
                <input type="password" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} className={styles.inputclass} placeholder="Confirm your password" required />
              </div>
            </div>
  
            {error && <p style={{ color: 'red' }}>{error}</p>}
            
            <div className={styles.registeraccountInner}>
              <button type="submit" className={styles.createAccountWrapper} disabled={loading}>
                {loading ? 'Creating Account...' : 'Create Account'}
              </button>
              <div className={styles.dashParent}>
                <img className={styles.dashIcon} alt="" src="dash.svg" />
                <div className={styles.michael}>or</div>
                <img className={styles.dashIcon} alt="" src="Vector 3.svg" />
              </div>
              <div className={styles.googleParent}>
                <img className={styles.googleIcon} alt="" src={google} />
                <div className={styles.michael}>Continue with Google</div>
              </div>
              <div className={styles.alreadyHaveAnContainer}>
                <span>Already have an account?</span>
                <span className={styles.signIn}> Sign in</span>
              </div>
            </div>
          </form>
        </div>
      </div>
    );
  }

export default RegisterAccount;
