import { Link } from 'react-router-dom';
import './CSS/profile.css';

const Profile = () => {
    return (
        <div className="form-container">
            <Link to="/register-student" className="btn-primary">Зарегистрировать учеников</Link>
            <Link to="/add-tasks" className="btn-primary">Создать тест</Link>
        </div>
    );
};

export default Profile;