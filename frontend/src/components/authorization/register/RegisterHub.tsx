import { Link } from "react-router-dom";
import React from 'react';

import '../CSS/form-signin.css'


const RegisterHub = () => {
    return (
        <div className="form-container">
            <ul className="hub-container">
                <li className="hub">
                    <Link to="/register-teacher" className="hub-link">Зарегистрироваться учителю</Link>
                </li>
                <li className="nav-item active">
                    <Link to="/register-student" className="hub-link">Зарегистрировать учеников</Link>
                </li>
            </ul>
        </div>
    );
};

export default RegisterHub;