import { useState } from 'react';
import styles from './Postatask.module.css';
import React from 'react';
import pvector from './postatastvectorelg.png';
import line from './dividerpat.png';
import { getFirestore, collection, addDoc, Timestamp } from 'firebase/firestore';

function PostATask() {
  const [roleName, setRoleName] = useState('');
  const [compensation, setCompensation] = useState('');
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');
  const [jobType, setJobType] = useState('Onsite Full Time');
  const [tag, setTag] = useState('Design');
  const [employerName, setEmployerName] = useState('');
  const [errors, setErrors] = useState({});

  const db = getFirestore();

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
    if (!validateInputs()) return;

    try {
      const docRef = await addDoc(collection(db, 'Jobs'), {
        roleName,
        compensation,
        location,
        description,
        jobType,
        tag,
        employerName,
        createdAt: Timestamp.fromDate(new Date()),
      });

      console.log('Job posted with ID: ', docRef.id);
      alert('Job posted successfully!');

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
      alert('Failed to post job. Please try again.');
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
                <option value="Onsite Full Time">Onsite Full Time</option>
                <option value="Onsite Contract">Onsite Contract</option>
                <option value="Remote Full Time">Remote Full Time</option>
                <option value="Remote Contract">Remote Contract</option>
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

        {/* Task Description spanning full width */}
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

      {/* Post Button Inside Form */}
      <div className={styles.buttonnext} onClick={postJobToFirestore}>
        <div className={styles.next}>Post</div>
      </div>
      <img className={styles.lineIcon} alt="" src={line} />
    </div>
  );
}

export default PostATask;
