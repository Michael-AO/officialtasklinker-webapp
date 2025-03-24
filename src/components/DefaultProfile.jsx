import React, { useState, useEffect } from "react";
import { auth, db } from "../firebase"; // Import Firestore database
import { doc, getDoc, setDoc } from "firebase/firestore";
import styles from "./DefaultProfile.module.css";
import defaultProfilePicture from "./profilepicture.png";

function DefaultProfile() {
  const [isEditing, setIsEditing] = useState(false);
  const [userData, setUserData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    bio: "This is my bio",
  });
  const [profilePicture, setProfilePicture] = useState(defaultProfilePicture);

  useEffect(() => {
    const fetchUserData = async () => {
      const user = auth.currentUser;
      if (user) {
        const userDocRef = doc(db, "users", user.uid);
        const userSnap = await getDoc(userDocRef);

        if (userSnap.exists()) {
          const userInfo = userSnap.data();
          setUserData({
            firstName: userInfo.firstName || "",
            lastName: userInfo.lastName || "",
            email: user.email || "",
            bio: userInfo.bio || "This is my bio",
          });

          if (userInfo.photoURL) {
            setProfilePicture(userInfo.photoURL);
          }
        } else {
          // If user data doesn't exist in Firestore, store it
          await setDoc(userDocRef, {
            firstName: "",
            lastName: "",
            email: user.email,
            bio: "This is my bio",
            photoURL: "",
          });
        }
      }
    };

    fetchUserData();
  }, []);

  const handleEditToggle = async () => {
    if (isEditing) {
      // Save only the bio
      const user = auth.currentUser;
      const userDocRef = doc(db, "users", user.uid);

      await setDoc(userDocRef, {
        bio: userData.bio, // Only updating bio
      }, { merge: true });
    }
    setIsEditing(!isEditing);
  };

  const handleChange = (e) => {
    setUserData({ ...userData, bio: e.target.value }); // Only allow bio editing
  };

  return (
    <div className={styles.reusuableSection}>
      {/* Edit Bio Button */}
      <div className={styles.editChanges} onClick={handleEditToggle} style={{ cursor: "pointer" }}>
        <div className={styles.updateProfilePhoto}>
          {isEditing ? "Save Changes" : "Edit Bio"}
        </div>
      </div>

      {/* Profile Picture */}
      <div className={styles.profilePictureContainer}>
        <img className={styles.profilepictureIcon} alt="Profile" src={profilePicture} />
      </div>

      {/* First Name (Read-Only & Disabled Style) */}
      <div className={styles.firstname}>
        <div className={styles.firstName}>First name</div>
        <input
          type="text"
          name="firstName"
          value={userData.firstName}
          disabled
          className={styles.updateProfilePhotoWrapper}
          style={{ cursor: "not-allowed", opacity: 0.6 }}
        />
      </div>

      {/* Last Name (Read-Only & Disabled Style) */}
      <div className={styles.lastname}>
        <div className={styles.firstName}>Last name</div>
        <input
          type="text"
          name="lastName"
          value={userData.lastName}
          disabled
          className={styles.updateProfilePhotoWrapper}
          style={{ cursor: "not-allowed", opacity: 0.6 }}
        />
      </div>

      {/* Email (Read-Only & Disabled Style) */}
      <div className={styles.emailaddress}>
        <div className={styles.firstName}>Email address</div>
        <input
          type="email"
          name="email"
          value={userData.email}
          disabled
          className={styles.updateProfilePhotoWrapper}
          style={{ cursor: "not-allowed", opacity: 0.6 }}
        />
      </div>

      {/* Bio (Editable) */}
      <div className={styles.bio}>
        <div className={styles.firstName}>Bio</div>
        <textarea
          name="bio"
          value={userData.bio}
          onChange={handleChange}
          disabled={!isEditing}
          className={styles.updateProfilePhotoFrame}
        />
      </div>
    </div>
  );
}

export default DefaultProfile;