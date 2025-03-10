import React, { useState, useEffect } from "react";
import { auth, db, storage } from "../firebase"; // Firebase imports
import { doc, setDoc, getDoc, onSnapshot } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import styles from "./Resume.module.css";
import upload from "./upload.png";

function ReuseableResume() {
  const [isEditing, setIsEditing] = useState(false);
  const [role, setRole] = useState("");
  const [experience, setExperience] = useState("");
  const [fileError, setFileError] = useState("");
  const [fileName, setFileName] = useState(localStorage.getItem("resumeName") || "No file selected");
  const [uploading, setUploading] = useState(false);

  // ✅ Fetch resume info & listen for Firestore updates
  useEffect(() => {
    const fetchResume = async () => {
      const user = auth.currentUser;
      if (!user) return;

      const userDocRef = doc(db, "users", user.uid);

      // 🔥 Firestore real-time listener (auto-updates UI when resume changes)
      const unsubscribe = onSnapshot(userDocRef, (docSnap) => {
        if (docSnap.exists()) {
          const userData = docSnap.data();
          if (userData.resumeName) {
            setFileName(userData.resumeName);
            localStorage.setItem("resumeName", userData.resumeName); // ✅ Store in local storage
          }
        }
      });

      return () => unsubscribe(); // Clean up listener on unmount
    };

    fetchResume();
  }, []);

  const handleEditClick = () => {
    setIsEditing(!isEditing);
  };

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Validate file type and size
    const fileSizeMB = file.size / (1024 * 1024);
    if (file.type !== "application/pdf") {
      setFileError("Only PDF files are allowed.");
      return;
    }
    if (fileSizeMB > 10) {
      setFileError("File must be 10MB or less.");
      return;
    }

    setFileError("");
    setUploading(true);
    setFileName("Uploading...");

    const user = auth.currentUser;
    if (!user) {
      alert("User not authenticated!");
      setUploading(false);
      return;
    }

    const storageRef = ref(storage, `resumes/${user.uid}/${file.name}`);

    try {
      await uploadBytes(storageRef, file);
      const fileURL = await getDownloadURL(storageRef);

      const userDocRef = doc(db, "users", user.uid);
      await setDoc(
        userDocRef,
        {
          resumeName: file.name,
          resumeURL: fileURL,
        },
        { merge: true }
      );

      setFileName(file.name.length > 50 ? file.name.slice(0, 47) + "..." : file.name);
      localStorage.setItem("resumeName", file.name); // ✅ Save to local storage
      alert("File uploaded successfully!");
    } catch (error) {
      console.error("Upload error:", error);
      setFileError("Failed to upload file.");
      setFileName("No file selected");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className={styles.reuseableResume}>
      <div className={styles.resumereuse}>
        <div className={styles.contentwrp}>
          <div className={styles.headerwrp}>
            <div className={styles.uploadResumeParent}>
              <div className={styles.uploadResume}>
                Upload Resume: <span className={styles.fileName}>{fileName}</span>
              </div>
              <label className={styles.upload24dp5f6368Fill0Wght4Parent}>
                <img className={styles.upload24dp5f6368Fill0Wght4Icon} alt="" src={upload} />
                <div className={styles.uploadNewFile}>
                  {uploading ? "Uploading..." : "Upload New File"}
                </div>
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
