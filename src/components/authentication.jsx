import React from "react";
import { Link } from "react-router-dom"; // Import Link from React Router
import authimg from "./authimg.png";
import styles from "./authentication.module.css";

function Authentication() {
  return (
    <div className={styles.register}>
      <div className={styles.buttonWrapper}>
        <Link to="/register"> {/* Link to the Register page */}
          <button className={styles.button}>
            <div className={styles.textWrapper}>Create Account</div>
          </button>
        </Link>
      </div>
      <div className={styles.frame}>
        <img className={styles.img} alt="Frame" src={authimg} />
      </div>
    </div>
  );
}

export default Authentication;
