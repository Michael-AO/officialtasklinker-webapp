import { useState, useEffect } from 'react';
import styles from './Postatask.module.css';
import React from 'react';
import pvector from './postatastvectorelg.png';
import line from './dividerpat.png';
import { getFirestore, collection, addDoc, setDoc, Timestamp } from 'firebase/firestore';
import { getAuth, onAuthStateChanged } from 'firebase/auth';

function PostATask() {
  const [roleName, setRoleName] = useState('');
  const [compensation, setCompensation] = useState('');
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');
  const [jobType, setJobType] = useState('Onsite Full Time');
  const [tag, setTag] = useState('Design');
  const [employerName, setEmployerName] = useState('');
  const [errors, setErrors] = useState({});
  const [userId, setUserId] = useState(null); // Store logged-in user ID
  const [userEmail, setUserEmail] = useState(''); // Store logged-in user's email

  const db = getFirestore();
  const auth = getAuth();

  // List of verified user IDs
  const verifiedUserIds = ["1OSOjuGz0GZneXImiO4WGiexAq32", "I4tx1lI88tb0luNonvD7AjaYWuv2"]; // Replace with actual IDs

  // Check user authentication state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUserId(user.uid);
        setUserEmail(user.email); // Set the logged-in user's email
      } else {
        setUserId(null);
        setUserEmail(''); // Clear email if user is not logged in
      }
    });
    return () => unsubscribe();
  }, [auth]);

  const validateInputs = () => {
    let newErrors = {};

    if (!employerName.trim()) newErrors.employerName = 'Employer name is required.';
    if (!roleName.trim()) newErrors.roleName = 'Role name is required.';
    if (!compensation.trim()) newErrors.compensation = 'Compensation is required.';
    if (!location.trim()) newErrors.location = 'Location is required.';

    const wordCount = description.trim().split(/\s+/).length;
    if (!description.trim()) {
      newErrors.description = 'Job description is required.';
    } else if (wordCount < 50) {
      newErrors.description = 'Job description must be at least 50 words.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const postJobToFirestore = async () => {
    if (!userId) {
      alert('You must be logged in to post a task.');
      return;
    }

    if (!validateInputs()) return;

    try {
      const isVerified = verifiedUserIds.includes(userId); // Check if user is in the verified list

      const docRef = await addDoc(collection(db, 'Tasks'), {
        userId, 
        roleName,
        compensation,
        location,
        description,
        jobType,
        tag,
        employerName,
        employerEmail: userEmail, // Include the logged-in user's email
        createdAt: Timestamp.fromDate(new Date()),
        verified: isVerified, // Add verified status
      });

      await setDoc(docRef, { taskId: docRef.id }, { merge: true });

      console.log('Task posted with ID: ', docRef.id);
      alert('Task posted successfully!');

      setRoleName('');
      setCompensation('');
      setLocation('');
      setDescription('');
      setJobType('Onsite Full Time');
      setTag('Design');
      setEmployerName('');
      setErrors({});
    } catch (e) {
      console.error('Error adding document: ', e);
      alert('Failed to post task. Please try again.');
    }
  };

  return (
    <div className={styles.postATask}>
      <div className={styles.overlay} />
      <div className={styles.background} />
      <div className={styles.pageheader}>
        <img className={styles.vectorIcon} alt="" src={pvector} />
        <div className={styles.postATask1}>Post a Task</div>
      </div>
      <div className={styles.frameParent}>
        <div className={styles.step1Of2Wrapper}>
          <div className={styles.step1Of}>Quick Step</div>
        </div>
        <div className={styles.fillInJobDescriptionParent}>
          <div className={styles.fillInJob}>Fill in Job Description</div>
          <div className={styles.rectangleParent}>
            <div className={styles.frameChild} />
            <div className={styles.frameItem} />
          </div>
        </div>
      </div>

      {/* Input Fields */}
      <div className={styles.inputwrapper}>
        {[
          { label: 'Employer Name', value: employerName, setter: setEmployerName, error: errors.employerName, placeholder: 'E.g Michael Asere' },
          { label: 'Name of the Role', value: roleName, setter: setRoleName, error: errors.roleName, placeholder: 'E.g Graphic Designer' },
          { label: 'Compensation NGN', value: compensation, setter: setCompensation, error: errors.compensation, placeholder: 'E.g 200,000', type: 'number' },
          { label: 'Location', value: location, setter: setLocation, error: errors.location, placeholder: 'E.g Lekki' },
        ].map(({ label, value, setter, error, placeholder, type = 'text' }, index) => (
          <div key={index} className={styles.name}>
            <div className={styles.next}>{label}</div>
            <input
              className={`${styles.inputField} ${error ? styles.errorField : ''}`}
              type={type}
              value={value}
              onChange={(e) => setter(e.target.value)}
              placeholder={placeholder}
            />
            {error && <span className={styles.error}>{error}</span>}
          </div>
        ))}

        {/* Job Type & Tag Dropdowns */}
        <div className={styles.flexContainer}>
          <div className={styles.jobTypeTagWrapper}>
            <div className={styles.name}>
              <div className={styles.next}>Job Type</div>
              <select className={styles.inputField} value={jobType} onChange={(e) => setJobType(e.target.value)}>
                <option value="Onsite">Onsite</option>
                <option value="Remote">Remote</option>
               
              </select>
            </div>
            <div className={styles.name}>
              <div className={styles.next}>Tag</div>
              <select className={styles.inputField} value={tag} onChange={(e) => setTag(e.target.value)}>
                <option value="Design">Design</option>
                <option value="Development">Development</option>
                <option value="Marketing">Marketing</option>
                <option value="Sales">Sales</option>
                <option value="Physical">Physical</option>
                <option value="Virtual Assistant">Virtual Assistant</option>
              </select>
            </div>
          </div>
        </div>

        {/* Task Description */}
        <div className={styles.fullWidth}>
          <div className={styles.next}>Task Description</div>
          <textarea
            className={`${styles.inputField} ${errors.description ? styles.errorField : ''}`}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows="6"
            placeholder="Write a detailed job description (at least 50 words)"
          />
          {errors.description && <span className={styles.error}>{errors.description}</span>}
        </div>
      </div>

      {/* Post Button */}
      <div className={`${styles.buttonWrapper} ${Object.keys(errors).length > 0 ? styles.hasErrors : ''}`}>
        <div className={styles.buttonnext} onClick={postJobToFirestore}>
          <div className={styles.next}>Post</div>
        </div>
      </div>
      <img className={styles.lineIcon} alt="" src={line} />
    </div>
  );
}

export default PostATask;