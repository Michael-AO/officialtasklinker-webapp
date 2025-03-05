import React from "react";
import styles from './GetPaid.module.css';
import Illus from './Illus.png'


function GetPaid() {
  	return (
      			<div className={styles.getpaidcs}>
        				<div className={styles.getPaidByClientsrightInTParent}>
          					<div className={styles.getPaidBy}>Get Paid by Clients—Right in the App!</div>
          					<div className={styles.comingSoonStayTuned}>Coming Soon! Stay tuned for updates.</div>
        				</div>
        				<img className={styles.undrawCreditCardT6qm1Icon} alt="" src={Illus} />
      			</div>
    		);
};

export default GetPaid;
