import styles from './UserNavbar.module.css';
import React from 'react';
import logor from './Logor.png';
import sicon from './searchicon.png';
import profile from './Profile.png';
import post from './postatask.png';
import { Link, useLocation } from "react-router-dom";


function UserNavbar() {
  	return (
    		<div className={styles.usernavbar}>
      			<div className={styles.navMenuWrapper}>
        				<img className={styles.logoIcon} alt="" src={logor} />
        				<div className={styles.frame}>
          					<div className={styles.seacrhb}>
            						<img className={styles.searchicon} alt="" src={sicon} />
                                    <input 
                                     type="text" 
                                    className={styles.searchInput} 
                                    placeholder="Search tasks..." 
                                     />
            						
          					</div>
          					<div className={styles.navmenuoff}>
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
                to="/userhomepage" 
                className={`${styles.navLink} ${location.pathname === "/" ? styles.active : ""}`}
              >
               Explore Tasks
              </Link>
                  				
                								</div>

												<Link 
                to="/dashboard" 
                className={`${styles.profile} ${location.pathname === "/" ? styles.active : ""}`}
              >
              <img className={styles.profileChild} alt="" src={profile} />
              </Link>

                								<div className={styles.posttask}>

												<Link 
                to="/postatask" 
                className={`${styles.posttask} ${location.pathname === "/" ? styles.active : ""}`}
              >
              <img className={styles.vectorIcon} alt="" src={post} />
			  <div className={styles.postATask}>Post a task</div>
              </Link>


                  									
                								</div>
              							</div>
            						</div>
          					</div>
        				</div>
      			</div>
    		</div>);
};

export default UserNavbar;
