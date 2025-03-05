import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { signOut } from "firebase/auth";
import { auth } from "../firebase"; // Ensure Firebase is configured
import styles from "./sidebar.module.css";
import profile from './profiledash.png';
import resume from './resumedash.png';
import application from './applicationdash.png';
import postdash from './postdash.png';
import getpaid from './getpaid.png';
import signout from './signout.png';

function Sidebar() {
  const navigate = useNavigate(); // Hook for redirection

  const handleSignOut = async () => {
    try {
      await signOut(auth); // Sign out the user
      navigate("/"); // Redirect to login page
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  return (
    <>
      <div className={styles.sidebarComponent}>
        <div className={styles.sidebarComponentChild} />
        <div className={styles.navMenuWrapper}>
          <NavLink 
            to="/dashboard/profile" 
            className={({ isActive }) => 
              isActive ? `${styles.inactiveTab} ${styles.active}` : styles.inactiveTab
            }
          >
            <img className={styles.profiledashIcon} alt="" src={profile} />
            <div className={styles.applications}>Profile</div>
          </NavLink>

          <NavLink 
            to="/dashboard/resume" 
            className={({ isActive }) => 
              isActive ? `${styles.inactiveTab} ${styles.active}` : styles.inactiveTab
            }
          >
            <img className={styles.resumedashIcon} alt="" src={resume} />
            <div className={styles.applications}>Resume</div>
          </NavLink>

          <NavLink 
            to="/dashboard/applications" 
            className={({ isActive }) => 
              isActive ? `${styles.inactiveTab} ${styles.active}` : styles.inactiveTab
            }
          >
            <img className={styles.applicationdashIcon} alt="" src={application} />
            <div className={styles.applications}>Applications</div>
          </NavLink>

          <NavLink 
            to="/dashboard/postedTasks" 
            className={({ isActive }) => 
              isActive ? `${styles.inactiveTab} ${styles.active}` : styles.inactiveTab
            }
          >
            <img className={styles.postdashIcon} alt="" src={postdash} />
            <div className={styles.applications}>Posted Tasks</div>
          </NavLink>

          <NavLink 
            to="/dashboard/getPaid" 
            className={({ isActive }) => 
              isActive ? `${styles.inactiveTab} ${styles.active}` : styles.inactiveTab
            }
          >
            <img className={styles.getpaidIcon} alt="" src={getpaid} />
            <div className={styles.applications}>Get Paid</div>
          </NavLink>
        </div>

        <div className={styles.navMenuWrapper1}>
          <div 
            onClick={handleSignOut} 
            className={styles.inactiveTab} 
            style={{ cursor: "pointer" }} // Makes it clickable while keeping styles
          >
            <img className={styles.signoutIcon} alt="" src={signout} />
            <div className={styles.applications}>Sign Out</div>
          </div>
        </div>
      </div>
    </>
  );
}

export default Sidebar;
