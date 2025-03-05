import React, { useState } from 'react';
import styles from './DefaultProfile.module.css';
import defaultProfilePicture from "./profilepicture.png";

function DefaultProfile() {
  const [isEditing, setIsEditing] = useState(false);
  const [userData, setUserData] = useState({
    firstName: "John",
    lastName: "Doe",
    email: "johndoe@example.com",
    bio: "This is my bio",
    password: "********"
  });
  const [profilePicture, setProfilePicture] = useState(defaultProfilePicture);

  const handleEditToggle = () => {
    setIsEditing(!isEditing);
  };

  const handleChange = (e) => {
    setUserData({
      ...userData,
      [e.target.name]: e.target.value
    });
  };

  const handleImageChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setProfilePicture(imageUrl);
    }
  };

  return (
    <div className={styles.reusuableSection}>
      {/* Edit Changes Button */}
      <div 
        className={styles.editChanges} 
        onClick={handleEditToggle} 
        style={{ cursor: "pointer" }} // Change cursor to pointer
      >
        <div className={styles.updateProfilePhoto}>
          {isEditing ? "Save Changes" : "Edit Changes"}
        </div>
      </div>

      {/* First Name */}
      <div className={styles.firstname}>
        <div className={styles.firstName}>First name</div>
        <input
          type="text"
          name="firstName"
          value={userData.firstName}
          onChange={handleChange}
          disabled={!isEditing}
          className={styles.updateProfilePhotoWrapper}
        />
      </div>

      {/* Last Name */}
      <div className={styles.lastname}>
        <div className={styles.firstName}>Last name</div>
        <input
          type="text"
          name="lastName"
          value={userData.lastName}
          onChange={handleChange}
          disabled={!isEditing}
          className={styles.updateProfilePhotoWrapper}
        />
      </div>

      {/* Email */}
      <div className={styles.emailaddress}>
        <div className={styles.firstName}>Email address</div>
        <input
          type="email"
          name="email"
          value={userData.email}
          onChange={handleChange}
          disabled={!isEditing}
          className={styles.updateProfilePhotoWrapper}
        />
      </div>

      {/* Bio */}
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

      {/* Password (Not Editable) */}
      <div className={styles.password}>
        <div className={styles.firstName}>Password</div>
        <input
          type="password"
          name="password"
          value={userData.password}
          disabled // Password remains uneditable
          className={styles.frameDiv}
        />
      </div>

      {/* Profile Picture Upload */}
      <div className={styles.profilePictureContainer}>
        <input
          type="file"
          accept="image/*"
          onChange={handleImageChange}
          style={{ display: "none" }}
          id="profilePictureInput"
        />
        <label htmlFor="profilePictureInput">
          <img 
            className={styles.profilepictureIcon} 
            alt="Profile" 
            src={profilePicture} 
            style={{ cursor: "pointer" }} 
          />
        </label>
      </div>
    </div>
  );
}

export default DefaultProfile;
