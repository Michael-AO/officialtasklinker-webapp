import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { getAuth, onAuthStateChanged, signOut } from "firebase/auth";
import styles from "./Navbar.module.css"; 
import Logo from "./Logo.png";
import User from "./User.png";

function NavBar() {
  const [user, setUser] = useState(null);
  const auth = getAuth();
  const location = useLocation();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });

    return () => unsubscribe();
  }, []);

  return (
    <div className={styles.navBar}>
      <div className={styles.navBarBg} />

      <div className={styles.navMenu}>
        <div className={styles.autoLayout}>
          <div className={styles.content}>
            <div className={styles.navLinks}>
              <Link 
                to="/" 
                className={`${styles.navLink} ${location.pathname === "/" ? styles.active : ""}`}
              >
                Home
              </Link>
              <Link 
                to="/tasks" 
                className={`${styles.navLink} ${location.pathname === "/tasks" ? styles.active : ""}`}
              >
                Explore tasks
              </Link>
            </div>

            {/* Show Sign in & Create Account only if user is NOT logged in */}
            {!user && (
              <>
                <Link 
                  to="/login" 
                  className={`${styles.navLink} ${location.pathname === "/Login" ? styles.active : ""}`}
                >
                  Sign in
                </Link>
                <div className={styles.button}>
                  <Link to="/register" className={styles.tlbutton}>Create Account</Link>
                </div>
              </>
            )}

            {/* Show user icon & logout button only when logged in */}
            {user && (
              <div className={styles.profileWrapper}>
                <Link to="/profile">
                  <img className={styles.vectorIcon} alt="User" src={User} />
                </Link>
                <button className={styles.logoutButton} onClick={() => signOut(auth)}>Logout</button>
              </div>
            )}
          </div>
        </div>

        <img className={styles.logoIcon} alt="Logo" src={Logo} />
      </div>
    </div>
  );
}

export default NavBar;
