import React from 'react';
import fonts from 'config/fonts.json';
import styles from './Preload.less';

export default function Preload() {
  return (
    <div className={styles.preload}>
      {fonts.map(font => (
        <span key={font} style={{ fontFamily: font }}>
          {font}
        </span>
      ))}
    </div>
  );
}
