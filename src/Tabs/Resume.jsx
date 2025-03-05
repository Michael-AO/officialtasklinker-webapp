import React, { useState } from "react";
import styles from "./Resume.module.css";
import upload from "./upload.png";

function ReuseableResume() {
  const [isEditing, setIsEditing] = useState(false);
  const [role, setRole] = useState("");
  const [experience, setExperience] = useState("");
  const [fileError, setFileError] = useState("");

  const handleEditClick = () => {
    setIsEditing(!isEditing);
  };

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const fileSizeMB = file.size / (1024 * 1024); // Convert bytes to MB
      if (file.type !== "application/pdf") {
        setFileError("Only PDF files are allowed.");
        return;
      }
      if (fileSizeMB > 10) {
        setFileError("File must be 10MB or less.");
        return;
      }
      setFileError(""); // Clear error if valid
      alert("File uploaded successfully!");
    }
  };

  return (
    <div className={styles.reuseableResume}>
      <div className={styles.resumereuse}>
        <div className={styles.contentwrp}>
          <div className={styles.headerwrp}>
            <div className={styles.uploadResumeParent}>
              <div className={styles.uploadResume}>{`Upload Resume `}</div>
              <label className={styles.upload24dp5f6368Fill0Wght4Parent}>
                <img className={styles.upload24dp5f6368Fill0Wght4Icon} alt="" src={upload} />
                <div className={styles.uploadNewFile}>Upload New File</div>
                <input type="file" accept=".pdf" onChange={handleFileUpload} hidden />
              </label>
              {fileError && <p className={styles.errorMessage}>{fileError}</p>}
            </div>

            <div className={styles.frameParent}>
              <div className={styles.primaryRoleParent}>
                <div className={styles.primaryRole}>Primary Role</div>
                <div className={styles.socialMediaManagerWrapper}>
                  <input
                    className={styles.socialMediaManagerWrapper}
                    type="text"
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    disabled={!isEditing}
					placeholder="Non-Specific"
                  />
                </div>
              </div>

              <div className={styles.primaryRoleParent}>
                <div className={styles.primaryRole}>Years of Experience</div>
                <div className={styles.parent}>
                  <input
                    className={styles.socialMediaManagerWrapper}
                    type="number"
                    value={experience}
                    onChange={(e) => setExperience(e.target.value)}
                    disabled={!isEditing}
					placeholder="Non-Specific"
                    min="0"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className={styles.editchangedone} onClick={handleEditClick}>
            <div className={styles.uploadNewFile}>
              {isEditing ? "Save Changes" : "Edit Changes"}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ReuseableResume;
