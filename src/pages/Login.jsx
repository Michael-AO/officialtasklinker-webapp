import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebase';
import styles from './Login.module.css';

function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null); // Stores errors silently

  const handleLogin = async () => {
    if (!email || !password) return; // Prevents empty submission

    setLoading(true);
    setError(null); // Reset previous errors

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      if (!user.emailVerified) {
        setLoading(false);
        return; // Silently prevents access for unverified users
      }

      navigate('/'); // Redirect to homepage
    } catch (error) {
      setError(error.message); // Stores error quietly (for debugging if needed)
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.signIn}>
      <div className={styles.background} />
      <div className={styles.farmerWrapper}>
        <div className={styles.farmer}>Farmer</div>
      </div>
      <div className={styles.total}>
        <div className={styles.contentlgn}>
          <div className={styles.upper}>
            <div className={styles.headersub}>
              <div className={styles.loginToAccess}>Login to access your account</div>
            </div>
            <div className={styles.welcomeBackContinue}>Welcome back! Continue where you left off.</div>
            <div className={styles.frameParent}>
              {/* Email Input Field */}
              <div className={styles.emailAddressPhoneNumberParent}>
                <label className={styles.emailAddress}>Email Address / Phone Number</label>
                <div className={styles.michaeltasksgmailcomWrapper}>
                  <input
                    type="text"
                    className={styles.michaeltasksgmailcom}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="michaeltasks@gmail.com"
                  />
                </div>
              </div>

              {/* Password Input Field */}
              <div className={styles.passwordParent}>
                <label className={styles.emailAddress}>Password</label>
                <div className={styles.michaeltasksgmailcomWrapper}>
                  <input
                    type="password"
                    className={styles.michaeltasksgmailcom}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="xxxxxxxxxxxxx"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className={styles.lower}>
            {/* Login Button */}
            <div className={styles.loginbtn} onClick={handleLogin} style={{ cursor: "pointer" }}>
              <div className={styles.login}>{loading ? 'Logging in...' : 'Login'}</div>
            </div>

            {/* OR Section */}
            <div className={styles.or}>
              <img className={styles.orChild} alt="" src="Vector 3.svg" />
              <div className={styles.michaeltasksgmailcom}>or</div>
              <img className={styles.orChild} alt="" src="Vector 3.svg" />
            </div>

            {/* Google Login (Placeholder) */}
            <div className={styles.googlecont}>
              <img className={styles.vectorIcon} alt="" src="Vector.svg" />
              <div className={styles.michaeltasksgmailcom}>Continue with Google</div>
            </div>

            {/* Sign Up Link */}
            <div className={styles.dontHaveAnAccountParent}>
              <div className={styles.michaeltasksgmailcom}>Don’t have an account?</div>
              <div className={styles.createAccount} onClick={() => navigate('/register')}>
                Create Account
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;
