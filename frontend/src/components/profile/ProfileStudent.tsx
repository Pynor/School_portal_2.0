import { Link } from 'react-router-dom';

import { TaskList, UserData } from '../../types';
import { getCookie } from '../../functions';

import './CSS/profile.css';
import './../../App.css';


const ComponentTaskList = ({ task_list }: { task_list: TaskList }) => {
    return (
        <>
            {task_list.task_list.map((option, index) => {
                const isCompleted = getCookie(`completedTask(${index})`) === `${index}`;
                return isCompleted ? (
                    <h3 key={index} className="success-message" style={{ width: '300px' }}>
                        Задание {option.title} сделано.
                    </h3>
                ) : (
                    <Link key={index} to={`/add-answers/${index}`} className="btn-primary" style={{ width: '300px', maxWidth: '100%' }}>
                        Задание {option.title}
                    </Link>
                );
            })}
        </>
    );
};

const NoTasksMessage = () => (
    <h2 className="success-message">Задач для вас пока нет.</h2>
);

const NotRegisteredMessage = () => (
    <h2 className="error-message">Вы не авторизованы.</h2>
);

const ProfileStudent = ({ tasksListData, userData }: { tasksListData: TaskList; userData: UserData }) => {
    const hasTasks = tasksListData && tasksListData.task_list.length > 0;
    console.log(tasksListData.task_list.length)

    return (
        <div className="profile">
            <div className="form-container">
                {!userData || !userData.username ? (
                    <NotRegisteredMessage />
                ) : hasTasks ? (
                    <ComponentTaskList task_list={tasksListData} />
                ) : (
                    <NoTasksMessage />
                )}
            </div>
        </div>
    );
};

export default ProfileStudent;