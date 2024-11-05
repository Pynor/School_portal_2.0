import { Link } from 'react-router-dom';


import { getCookie } from '../../functions';
import { TaskList } from '../../types';

import './CSS/profile.css';


const ProfileStudent = ({ tasksListData }: { tasksListData: TaskList }) => {
    return (
        <div>
            <div className="form-container">
                {tasksListData && tasksListData.task_list.length > 0 ? (
                    tasksListData.task_list.map((option, index) => (
                        getCookie(`completedTask(${index})`) !== `${index}` ? (
                            <Link key={index} to={`/add-answers/${index}`} className="btn-primary" style={{ width: '300px'}}> Задание {option.title} </Link>
                        ) : (
                        <h3 className="success-message" style={{ width: '300px'}}> Задание {option.title} сделано.</h3>
                    )
                    ))
                ) : (
                    <h2 className="success-message">Задач для вас пока нет.</h2>
                )}
            </div>
        </div>
    );
};

export default ProfileStudent;