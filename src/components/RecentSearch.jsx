import React from 'react';
import styles from './RecentSearch.module.css';

function RecentSearch() {
  return (
    <div className={styles.recentSearch}>
      <div className={styles.searchOvalWindow}>
        <div className={styles.searchWindow} />
        <div className={styles.background} />
        <div className={styles.recentSearches}>Recent searches</div>
        <div className={styles.frameParent}>
          <div className={styles.uiDesignerParent}>
            <div className={styles.uiDesigner}>UI Designer</div>
            <img className={styles.materialSymbolscancelIcon} alt="" src="material-symbols:cancel.svg" />
          </div>
          <div className={styles.uiDesignerParent}>
            <div className={styles.uiDesigner}>Financial Manager</div>
            <img className={styles.materialSymbolscancelIcon} alt="" src="material-symbols:cancel.svg" />
          </div>
          <div className={styles.uiDesignerParent}>
            <div className={styles.uiDesigner}>Social Media Manager</div>
            <img className={styles.materialSymbolscancelIcon} alt="" src="material-symbols:cancel.svg" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default RecentSearch;
