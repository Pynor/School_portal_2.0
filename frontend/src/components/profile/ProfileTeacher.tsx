import { Link } from 'react-router-dom';
import React from "react";

import { UserData } from '../../types';


import './CSS/profile.css';


const ProfileTeacher = (props: { userData: UserData }) => {
    return (
        <div>
            {props.userData.is_staff ? (
                <div className="form-container">
                    <Link to="/register-students" className="btn-primary">Зарегистрировать учеников</Link>
                    <Link to="/add-tasks" className="btn-primary">Создать тест</Link>
                </div>
            ) : (
                <h2 className="error-message">У вас нет на это прав.</h2>
            )
            }
        </div>
    );
};

export default ProfileTeacher;