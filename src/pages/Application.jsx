import { useLocation, useNavigate } from 'react-router-dom';
import { db, storage } from '../firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { getAuth } from 'firebase/auth';
import styles from './Application.module.css';
import React, { useState, useEffect } from 'react';

function Application() {
  const navigate = useNavigate();
  const location = useLocation();
  const { job } = location.state || {};
  const auth = getAuth();
  
  // User data from auth
  const [userData, setUserData] = useState({
    email: '',
    displayName: ''
  });
  
  // Form states
  const [experience, setExperience] = useState('3');
  const [coverLetter, setCoverLetter] = useState(
    'I believe I am an excellent fit for this role because...'
  );
  const [resumeFile, setResumeFile] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (auth.currentUser) {
      setUserData({
        email: auth.currentUser.email || '',
        displayName: auth.currentUser.displayName || ''
      });
    }
  }, [auth]);

  if (!job) {
    return <div className={styles.application}>No job data found.</div>;
  }

  const handleFileChange = (e) => {
    if (e.target.files[0]) {
      setResumeFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    console.log("Submit button clicked");
    if (isSubmitting) return;
    setIsSubmitting(true);

    try {
      let resumeUrl = '';
      
      // Upload resume if file exists
      if (resumeFile) {
        console.log("Uploading resume file...");
        const storageRef = ref(
          storage, 
          `resumes/${auth.currentUser.uid}/${Date.now()}_${resumeFile.name}`
        );
        const snapshot = await uploadBytes(storageRef, resumeFile);
        resumeUrl = await getDownloadURL(snapshot.ref);
        console.log("Resume uploaded successfully");
      }

      // Application data
      const applicationData = {
        jobId: job.id,
        jobTitle: job.roleName,
        company: job.employerName,
        jobType: job.jobType,
        compensation: job.compensation,
        location: job.location,
        userId: auth.currentUser.uid,
        fullName: userData.displayName,
        email: userData.email,
        appliedAt: serverTimestamp(),
        experience,
        coverLetter,
        resumeUrl,
        resumeFileName: resumeFile?.name || '',
        status: 'pending',
      };

      console.log("Saving application to Firestore...");
      await addDoc(collection(db, 'Applications'), applicationData);
      console.log("Application saved successfully");
      
      // Navigate to home page after successful submission
      navigate('/');

    } catch (error) {
      console.error('Error submitting application:', error);
      alert('Error submitting application. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBackClick = (e) => {
    e.preventDefault();
    navigate(-1);
  };

  return (
    <div className={styles.application}>
      <div className={styles.overlay} />
      <div className={styles.applyForTask}>
        <div className={styles.bg} />
        <div className={styles.buttonParent}>
          <div 
            className={styles.button} 
            onClick={handleBackClick}
            style={{ cursor: 'pointer' }}
          >
            <div className={styles.back}>Back</div>
          </div>
          <div 
            className={styles.button} 
            onClick={handleSubmit}
            style={{ cursor: 'pointer' }}
          >
            <div className={styles.back}>
              {isSubmitting ? 'Submitting...' : 'Finish and Apply'}
            </div>
          </div>
        </div>
        <div className={styles.frameParent}>
          <div className={styles.frameGroup}>
            <div className={styles.frameContainer}>
              <div className={styles.frameDiv}>
                <div className={styles.uxDesignerWrapper}>
                  <div className={styles.uxDesigner}>{job.roleName}</div>
                </div>
                <div className={styles.onsiteWrapper}>
                  <div className={styles.onsite}>{job.jobType}</div>
                </div>
              </div>
              <div className={styles.frameWrapper}>
                <div className={styles.uxDesignerWrapper}>
                  <div className={styles.uxDesigner}>{job.employerName}</div>
                </div>
              </div>
              <i className={styles.badiruStrLagos}>{job.location}</i>
            </div>
            <div className={styles.compensationmonthParent}>
              <div className={styles.compensationmonth}>Compensation/month</div>
              <div className={styles.ngn10000}>NGN {job.compensation}</div>
            </div>
          </div>
          
          <div className={styles.rightBar}>
            <div className={styles.rightContent} />
            <div className={styles.buttonGroup}>
              <div 
                className={styles.button} 
                onClick={handleBackClick}
                style={{ cursor: 'pointer' }}
              >
                <div className={styles.back}>Back</div>
              </div>
              <div 
                className={styles.button}
                onClick={handleSubmit}
                style={{ cursor: 'pointer' }}
              >
                <div className={styles.back}>
                  {isSubmitting ? 'Submitting...' : 'Finish and Apply'}
                </div>
              </div>
            </div>
            
            <div className={styles.resume}>
              <div className={styles.uploadResume}>Upload Resume</div>
              <div className={styles.uploadinputresume}>
                <img 
                  className={styles.upload24dp5f6368Fill0Wght4Icon} 
                  alt="" 
                  src="upload_24dp_5F6368_FILL0_wght400_GRAD0_opsz24 1.svg" 
                />
                <input
                  type="file"
                  id="resume-upload"
                  onChange={handleFileChange}
                  accept=".pdf,.doc,.docx"
                  style={{ display: 'none' }}
                />
                <label htmlFor="resume-upload" className={styles.back}>
                  {resumeFile ? resumeFile.name : 'Upload New File'}
                </label>
              </div>
            </div>

            <div className={styles.reuseapplication}>
              <div className={styles.frameParent1}>
                <div className={styles.haveExpereinceWithPlumbingParent}>
                  <div className={styles.haveExpereinceWith}>
                    {`Have experience with ${job.roleName}`}
                  </div>
                  <div className={styles.yesParent}>
                    <div className={styles.back}>Yes</div>
                    <img className={styles.vectorIcon} alt="" src="Vector.svg" />
                  </div>
                </div>
                <div className={styles.haveExpereinceWithPlumbingParent}>
                  <div className={styles.haveExpereinceWith}>
                    Years of experience
                  </div>
                  <div className={styles.yesParent}>
                    <div className={styles.back}>{experience}</div>
                    <select
                      value={experience}
                      onChange={(e) => setExperience(e.target.value)}
                      className={styles.experienceSelect}
                    >
                      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(num => (
                        <option key={num} value={num}>{num}</option>
                      ))}
                    </select>
                    <img className={styles.vectorIcon} alt="" src="Vector.svg" />
                  </div>
                </div>
              </div>

              <div className={styles.whyYouShouldBePickedForTParent}>
                <div className={styles.haveExpereinceWith}>
                  Why you should be picked for this role
                </div>
                <div className={styles.iBelieveIAmAnExcellentFiWrapper}>
                  <div className={styles.iBelieveI}>
                    <textarea
                      value={coverLetter}
                      onChange={(e) => setCoverLetter(e.target.value)}
                      className={styles.coverLetterTextarea}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Application;