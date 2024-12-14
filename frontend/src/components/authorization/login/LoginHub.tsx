import { Link } from "react-router-dom";
import React from 'react';

import '../CSS/form-signing.css';
import './../../../App.css';



const LoginHub = () => {
    return (
        <div className="form-login-and-register">
            <div className="form-container">
                <ul className="hub-container">
                    <li className="hub">
                        <Link to="/login-student" className="hub-link">Авторизоваться ученику</Link>
                    </li>
                    <li className="nav-item active">
                        <Link to="/login-teacher" className="hub-link">Авторизоваться учителю</Link>
                    </li>
                </ul>
            </div>
        </div>
    );
};

export default LoginHub;