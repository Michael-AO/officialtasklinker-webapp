import styles from './UserNavbar.module.css';
import React, { useState, useEffect } from 'react';
import logor from './tlogo.png';
import sicon from './searchicon.png';
import profile from './Profile.png';
import post from './postatask.png';
import { Link, useLocation, useNavigate } from "react-router-dom";

function UserNavbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchInput, setSearchInput] = useState("");

  // Ensure search query persists across pages
  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const searchQuery = queryParams.get("search") || "";
    setSearchInput(searchQuery);
  }, [location.search]);

  // Handle search dynamically after typing 3+ characters
  const handleSearchInput = (e) => {
    const value = e.target.value.toLowerCase();
    setSearchInput(value);

    if (value.length >= 3) {
      navigate(`/userhomepage?search=${encodeURIComponent(value)}`);
    } else if (value === "") {
      navigate(`/userhomepage`);
    }
  };

  const handleSearchKeyDown = (e) => {
    if (e.key === "Enter" && searchInput.trim() !== "") {
      e.preventDefault();
      navigate(`/userhomepage?search=${encodeURIComponent(searchInput)}`);
    }
  };

  return (
    <div className={styles.usernavbar}>
      <div className={styles.navMenuWrapper}>
        {/* ✅ Logo navigation restored */}
        <Link to="/">
          <img className={styles.logoIcon} alt="Logo" src={logor} />
        </Link>
        <div className={styles.frame}>
          <div className={styles.seacrhb}>
            <img className={styles.searchicon} alt="Search" src={sicon} />
            <input 
              type="text" 
              className={styles.searchInput} 
              placeholder="Search tasks..." 
              value={searchInput}
              onChange={handleSearchInput} // Updates dynamically
              onKeyDown={handleSearchKeyDown} // Enables Enter key search
            />
          </div>
          <div className={styles.navmenuoff}>
            <div className={styles.autoLayout}>
              <div className={styles.content}>
                <div className={styles.navLinks}>
                  <Link 
                    to="/" 
                    className={styles.navLink}
                  >
                    Home
                  </Link>
                  <Link 
                    to="/userhomepage" 
                    className={styles.navLink}
                  >
                    Explore Tasks
                  </Link>
                </div>

                <Link 
                  to="/dashboard" 
                  className={styles.profile}
                >
                  <img className={styles.profileChild} alt="Profile" src={profile} />
                </Link>

                <div className={styles.posttask}>
                  <Link 
                    to="/postatask" 
                    className={styles.posttask}
                  >
                    <img className={styles.vectorIcon} alt="Post a task" src={post} />
                    <div className={styles.postATask}>Post a task</div>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default UserNavbar;
