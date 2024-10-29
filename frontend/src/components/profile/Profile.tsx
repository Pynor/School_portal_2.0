import { Link } from 'react-router-dom';
import './CSS/profile.css';

import { UserData, TaskListForAnswers } from '../../types';


const Profile = (props: { userData: UserData, tasksListData: TaskListForAnswers }) => {
    return (
        <div>
            {props.userData.is_staff ? (
                <div className="form-container">
                    <Link to="/register-student" className="btn-primary">Зарегистрировать учеников</Link>
                    <Link to="/add-tasks" className="btn-primary">Создать тест</Link>
                </div>
            ) : (
                <div className="form-container">
                    {props.tasksListData && props.tasksListData.task_list.title !== "" ? (
                        <Link to="/add-answers" className="btn-primary">Задание</Link>
                    ) : (
                        <h2 className="success-message">Задач для вас пока нет.</h2>
                    )}
                </div>
            )}
        </div>
    );
};

export default Profile;