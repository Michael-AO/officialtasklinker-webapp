import { useState } from 'react';
import styles from './PostATask.module.css';
import React from 'react';
import pvector from './postatastvectorelg.png';
import line from './dividerpat.png';
import { getFirestore, collection, addDoc, Timestamp } from 'firebase/firestore';

function PostATask() {
  const [roleName, setRoleName] = useState('Social media manager');
  const [compensation, setCompensation] = useState('30000');
  const [location, setLocation] = useState('Lagos Island, Lagos, Nigeria');
  const [description, setDescription] = useState(
    'We are looking for a creative and strategic Social Media Specialist to join our team. In this role, you will be responsible for developing and executing social media strategies that enhance our brand presence, engage our audience, and drive growth. You will manage social media channels, create compelling content, and analyze performance metrics to optimize campaigns.'
  );
  const [jobType, setJobType] = useState('Full time');
  const [employerName, setEmployerName] = useState('ABC Corp');

  const handleFocus = (setValue) => {
    setValue('');
  };

  // Firebase Firestore configuration
  const db = getFirestore(); // Get Firestore instance

  // Post task to Firestore
  const postJobToFirestore = async () => {
    try {
      // Add job data to Firestore (updated to 'Jobs' collection)
      const docRef = await addDoc(collection(db, 'Jobs'), {
        roleName,
        compensation,
        location,
        description,
        jobType,
        employerName,
        createdAt: Timestamp.fromDate(new Date()), // Timestamp for when the job is posted
      });

      console.log("Job posted with ID: ", docRef.id);
      alert('Job posted successfully!'); // Show a success message
    } catch (e) {
      console.error("Error adding document: ", e);
      alert('Failed to post job. Please try again.');
    }
  };

  return (
    <div className={styles.postATask}>
      <div className={styles.overlay} />
      <div className={styles.background} />
      <div className={styles.pageheader}>
        <img className={styles.vectorIcon} alt="" src={pvector} />
        <div className={styles.postATask1}>Post a task</div>
      </div>
      <div className={styles.frameParent}>
        <div className={styles.step1Of2Wrapper}>
          <div className={styles.step1Of}>Quick Step</div>
        </div>
        <div className={styles.fillInJobDescriptionParent}>
          <div className={styles.fillInJob}>Fill in Job description</div>
          <div className={styles.rectangleParent}>
            <div className={styles.frameChild} />
            <div className={styles.frameItem} />
          </div>
        </div>
      </div>
      <div className={styles.buttonnext} onClick={postJobToFirestore}>
        <div className={styles.next}>Post</div>
      </div>

      {/* Employer Name */}
      <div className={styles.inputwrapper}>
        <div className={styles.name}>
          <div className={styles.next}>Employer Name</div>
          <input
            className={styles.inputField}
            type="text"
            value={employerName}
            onChange={(e) => setEmployerName(e.target.value)} // Update state on change
            placeholder="Enter Employer Name"
            onFocus={() => handleFocus(setEmployerName)} // Empty the field on focus
          />
        </div>

        {/* Name of the Role */}
        <div className={styles.name}>
          <div className={styles.next}>Name of the Role</div>
          <input
            className={styles.inputField}
            type="text"
            value={roleName}
            onChange={(e) => setRoleName(e.target.value)} // Update state on change
            placeholder="Enter Role Name"
            onFocus={() => handleFocus(setRoleName)} // Empty the field on focus
          />
        </div>

        {/* Job Type */}
        <div className={styles.name}>
          <div className={styles.next}>Job Type</div>
          <input
            className={styles.inputField}
            type="text"
            value={jobType}
            onChange={(e) => setJobType(e.target.value)} // Update state on change
            placeholder="Enter Job Type"
            onFocus={() => handleFocus(setJobType)} // Empty the field on focus
          />
        </div>

        {/* Compensation */}
        <div className={styles.name}>
          <div className={styles.next}>Compensation NGN</div>
          <input
            className={styles.inputField}
            type="number"
            value={compensation}
            onChange={(e) => setCompensation(e.target.value)} // Update state on change
            placeholder="Enter compensation in Naira"
            onFocus={() => handleFocus(setCompensation)} // Empty the field on focus
          />
        </div>

        {/* Location */}
        <div className={styles.name}>
          <div className={styles.next}>Location</div>
          <input
            className={styles.inputField}
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)} // Update state on change
            placeholder="Enter Location"
            onFocus={() => handleFocus(setLocation)} // Empty the field on focus
          />
        </div>
      </div>

      {/* Task Description */}
      <div className={styles.textwrapper}>
        <div className={styles.tastDesciption}>Task Description</div>
        <div className={styles.descrinput}>
          <textarea
            className={styles.inputField}
            value={description}
            onChange={(e) => setDescription(e.target.value)} // Update state on change
            rows="6"
            onFocus={() => setDescription('')} // Empty the description field on focus
          />
        </div>
      </div>

      <img className={styles.lineIcon} alt="" src={line} />
    </div>
  );
}

export default PostATask;
