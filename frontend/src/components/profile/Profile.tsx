import { Link } from "react-router-dom";
import React from 'react';


const Profile = () => {
    return (
        <div className="form-container">
            <Link to="/add-tasks" className="btn-primary">Создать тест</Link>
        </div>
    );
};

export default Profile;