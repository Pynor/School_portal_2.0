import { Link } from 'react-router-dom';
import './CSS/profile.css';

import { UserData } from '../../types';


const Profile = (props: { userData: UserData }) => {
    return (
        <div>
            {props.userData.is_staff ? (
                <div className="form-container">
                    <Link to="/register-student" className="btn-primary">Зарегистрировать учеников</Link>
                    <Link to="/add-tasks" className="btn-primary">Создать тест</Link>
                </div>
            ) : (
                <div className="form-container">
                    <Link to="/add-answers" className="btn-primary">Задание</Link>
                </div>
            )}
        </div>
    );
};

export default Profile;