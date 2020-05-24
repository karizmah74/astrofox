import React from 'react';
import Setting from 'components/editing/Setting';
import classNames from 'classnames';
import { inputValueToProps, mapChildren } from 'utils/react';
import styles from './Settings.less';

export default function Settings({ label, labelWidth, className, children, onChange }) {
  function handleClone(child, props) {
    if (child.type === Setting) {
      return [child, props];
    }
    return [child];
  }

  return (
    <div className={classNames(styles.settings, className)}>
      {label && <div className={styles.label}>{label}</div>}
      {mapChildren(children, { labelWidth, onChange: inputValueToProps(onChange) }, handleClone)}
    </div>
  );
}
