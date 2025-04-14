import React from 'react';
import { db } from '../firebase';
import { doc, updateDoc } from 'firebase/firestore';
import styles from './ApplicantData.module.css';

function Applicantdata({ applicant, onSelect, jobId }) { // Added jobId prop
  const [isUpdating, setIsUpdating] = React.useState(false);

  const handleSelectApplicant = async () => {
    if (!applicant?.id || !jobId) {
      console.error("Missing applicant ID or job ID");
      return;
    }

    console.log("Selecting applicant:", applicant.id);
    setIsUpdating(true);

    try {
      // Update the job document in Firestore
      const jobRef = doc(db, 'Jobs', jobId);
      await updateDoc(jobRef, {
        selectedApplicant: applicant.id,
        status: 'hired'
      });
      console.log("Applicant selected successfully");
      
      // Call the onSelect callback to go back
      onSelect();
    } catch (error) {
      console.error("Error selecting applicant:", error);
      alert("Failed to select applicant. Please try again.");
    } finally {
      setIsUpdating(false);
    }
  };

  const onFrameContainerClick = () => {
    console.log("Resume clicked");
    // Handle resume viewing logic here
  };

  return (
    <div className={styles.applicantdata}>
      <div className={styles.reuseableselectapplicant}>
        <div className={styles.groupParent}>
          <div className={styles.evaarrowBackFillParent}>
            <img className={styles.evaarrowBackFillIcon} alt="" src="eva:arrow-back-fill.svg" />
            <div className={styles.back} onClick={onSelect}>Back</div>
          </div>
          <div className={styles.selectApplicantWrapper}>
            <div className={styles.selectApplicant}>Select Applicant</div>
          </div>
        </div>
        <div className={styles.frameParent}>
          <div className={styles.profilepicParent}>
            <img className={styles.profilepicIcon} alt="" src="profilepic.png" />
            <div className={styles.bio}>
              <div className={styles.iBelieveIContainer}>
                <p className={styles.iBelieveI}>{applicant.coverLetter || `I believe I am an excellent fit...`}</p>
              </div>
            </div>
          </div>
          <div className={styles.frameGroup}>
            <div className={styles.frameContainer}>
              <div className={styles.frameDiv}>
                <div className={styles.fullNameParent}>
                  <div className={styles.fullName}>Full name</div>
                  <div className={styles.opeyemiAsereWrapper}>
                    <div className={styles.selectApplicant}>{applicant.name}</div>
                  </div>
                </div>
                <div className={styles.fullNameParent}>
                  <div className={styles.fullName}>Email address</div>
                  <div className={styles.opeyemiAsereWrapper}>
                    <div className={styles.selectApplicant}>{applicant.email}</div>
                  </div>
                </div>
              </div>
              <div className={styles.frameParent1}>
                <div className={styles.fullNameParent}>
                  <div className={styles.fullName}>Any Certifications</div>
                  <div className={styles.opeyemiAsereWrapper}>
                    <div className={styles.selectApplicant}>{applicant.certifications || 'None listed'}</div>
                  </div>
                </div>
                <div className={styles.fullNameParent}>
                  <div className={styles.fullName}>Years of Experience</div>
                  <div className={styles.opeyemiAsereWrapper}>
                    <div className={styles.selectApplicant}>{applicant.experience || 'Not specified'}</div>
                  </div>
                </div>
              </div>
            </div>
            <div className={styles.resumeParent}>
              <div className={styles.resume}>Resume</div>
              <div className={styles.resumepdfWrapper} onClick={onFrameContainerClick}>
                <div className={styles.selectApplicant}>{applicant.resumeFileName || 'Resume.PDF'}</div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Add Select Applicant Button */}
        <div 
          className={styles.selectButton} 
          onClick={handleSelectApplicant}
          style={{ 
            cursor: isUpdating ? 'not-allowed' : 'pointer',
            opacity: isUpdating ? 0.7 : 1
          }}
        >
          <div className={styles.selectApplicant}>
            {isUpdating ? 'Selecting...' : 'Select Applicant'}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Applicantdata;