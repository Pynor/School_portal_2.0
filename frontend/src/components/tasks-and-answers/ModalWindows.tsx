import React from 'react';

import { ModalProps } from "../../types";

import './CSS/modal.css';
import '../../App.css';


const Modal: React.FC<ModalProps> = ({ isOpen, onClose, imageSrc }) => {
    if (!isOpen) return null;

    return (
        <div className="form-tasks-and-answers">
            <div className="modal-overlay" onClick={onClose}>
                <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                    <span className="close-button" onClick={onClose}>&times;</span>
                    <img src={imageSrc} alt="Всплывающее" className="modal-image" />
                </div>
            </div>
        </div>
    );
};

export default Modal;