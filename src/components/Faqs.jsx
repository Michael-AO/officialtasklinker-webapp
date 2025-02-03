import React, { useState } from "react";
import styles from './Faqs.module.css';

function Faqs() {
  // State to track the currently open FAQ (if any)
  const [openFaq, setOpenFaq] = useState(null);

  // Toggle the visibility of the answer
  const toggleAnswer = (index) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  return (
    <div className={styles.faqs}>
      <div className={styles.sectionHeaderFaqs}>
        <div className={styles.sectionLabelFaqs}>
          <div className={styles.frequentlyAskedQuestions}>FAQS</div>
        </div>
        <div className={styles.frequentlyAskedQuestions1}>Frequently Asked Questions</div>
      </div>

      <div className={styles.faqsWrapper}>
        <div className={styles.openFaqs}>
          {/* FAQ 1 */}
          <div className={styles.questionAndBtn} onClick={() => toggleAnswer(0)}>
            <div className={styles.questionWrapper}>
              <div className={styles.whatIsTasklinkers}>What is TaskLinkers?</div>
            </div>
          </div>
          {/* Answer to FAQ 1 */}
          <div className={`${styles.answerWrapper} ${openFaq === 0 ? styles.openFaq : ''}`}>
            <div className={styles.theCompanyIs}>
              The company is an organization or business that posts tasks or projects needing completion. Companies use our platform to find skilled professionals to handle various jobs, ranging from short-term tasks to ongoing projects. By posting tasks, companies can quickly connect with qualified experts who can deliver the results they need.
            </div>
          </div>

          {/* FAQ 2 */}
          <div className={styles.questionAndBtn} onClick={() => toggleAnswer(1)}>
            <div className={styles.questionWrapper}>
              <div className={styles.whatIsTasklinkers}>Is there a fee to use TaskLinkers?</div>
            </div>
          </div>
          {/* Answer to FAQ 2 */}
          <div className={`${styles.answerWrapper} ${openFaq === 1 ? styles.openFaq : ''}`}>
            <div className={styles.theCompanyIs}>
              There is no fee to use TaskLinkers. You can post tasks and hire talent for free.
            </div>
          </div>

          {/* More FAQs can be added in the same way */}
        </div>
      </div>
    </div>
  );
}

export default Faqs;
