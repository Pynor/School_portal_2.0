import React, { useState } from 'react';
import './CSS/modal.css';

import { ModalProps } from "../../types";


const Modal: React.FC<ModalProps> = ({ isOpen, onClose, imageSrc }) => {
    if (!isOpen) return null;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <span className="close-button" onClick={onClose}>&times;</span>
                <img src={imageSrc} alt="Всплывающее" className="modal-image" />
            </div>
        </div>
    );
};

export default Modal;