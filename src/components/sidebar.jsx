import React from "react";
import { NavLink } from "react-router-dom";
import styles from "./sidebar.module.css";
import profile from './profiledash.png';
import resume from './resumedash.png';
import application from './applicationdash.png';
import postdash from './postdash.png';
import getpaid from './getpaid.png';
import signout from './signout.png';

function Sidebar() {
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
          <NavLink 
            to="/dashboard/signout" 
            className={({ isActive }) => 
              isActive ? `${styles.inactiveTab} ${styles.active}` : styles.inactiveTab
            }
          >
            <img className={styles.signoutIcon} alt="" src={signout} />
            <div className={styles.applications}>Sign Out</div>
          </NavLink>
        </div>
      </div>
    </>
  );
}

export default Sidebar;