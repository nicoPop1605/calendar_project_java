import React from "react";
import styles from "./Modal.module.css";

const Modal = ({ isOpen, onClose, title, children }) => {
    // Dacă modalul nu este deschis, nu randăm nimic
    if (!isOpen) return null;

    return (
        <div className={styles.overlay} onClick={onClose}>
            <div className={styles.content} onClick={(e) => e.stopPropagation()}>
                <div className={styles.header}>
                    <h2 style={{ margin: 0 }}>{title}</h2>
                    <button className={styles.closeBtn} onClick={onClose}>&times;</button>
                </div>
                <div className={styles.body}>
                    {children}
                </div>
            </div>
        </div>
    );
};

export default Modal;