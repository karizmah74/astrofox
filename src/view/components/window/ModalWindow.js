import React, { Children, cloneElement } from 'react';
import classNames from 'classnames';
import Button from 'components/interface/Button';
import Icon from 'components/interface/Icon';
import { Times } from 'view/icons';
import styles from './ModalWindow.less';

const ModalWindow = ({ children, className, title, buttons, showCloseButton, onClose }) => (
  <div className={styles.overlay}>
    <div className={classNames(styles.modal, className)}>
      {showCloseButton !== false && (
        <div className={styles.closeButton} onClick={onClose}>
          <Icon className={styles.closeIcon} glyph={Times} />
        </div>
      )}
      {title && <div className={styles.header}>{title}</div>}
      <div className={styles.body}>
        {Children.map(children, child => cloneElement(child, { onClose }))}
      </div>
      {buttons && (
        <div className={styles.buttons}>
          {buttons.map((text, index) => (
            <Button key={index} text={text} onClick={() => onClose(text)} />
          ))}
        </div>
      )}
    </div>
  </div>
);

export default ModalWindow;
