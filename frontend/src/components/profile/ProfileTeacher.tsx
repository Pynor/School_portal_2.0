import { Link } from 'react-router-dom';
import React from "react";

import { UserData } from '../../types';

import './CSS/profile.css';
import './../../App.css';


const ProfileTeacher = (props: { userData: UserData }) => {
    return (
        <div className="profile">
            {props.userData.is_staff ? (
                <div className="form-container">
                    <Link to="/register-students" className="btn-primary" style={{ width: '250px', textAlign: 'center' }}>Зарегистрировать учеников</Link>
                    <Link to="/check-answers-hub" className="btn-primary" style={{ width: '250px', textAlign: 'center' }}>Проверить ответы учеников</Link>
                    <Link to="/add-tasks" className="btn-primary" style={{ width: '250px', textAlign: 'center' }}>Создать тест</Link>
                </div>
            ) : (
                <div className="form-container">
                    <h2 className="error-message">У вас нет на это прав.</h2>
                </div>
            )
            }
        </div>
    );
};

export default ProfileTeacher;