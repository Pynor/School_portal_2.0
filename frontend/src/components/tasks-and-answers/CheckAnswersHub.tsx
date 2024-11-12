import React, { useState } from 'react';
import { Link } from 'react-router-dom';

import { BASE_URL, CLASSES } from '../../constants';
import { Task, UserData } from '../../types';

import './CSS/add-task.css';


const CheckAnswersHub: React.FC<{ userData: UserData }> = ({ userData }) => {
    const [message, setMessage] = useState<React.ReactNode>(null);
    const [school_class, setSchoolClass] = useState('');
    const [getTasksCompleted, setGetTasksCompleted] = useState(false);
    const [data, setData] = useState<{ task_list: Task[] }>({ task_list: [] });

    const getTasks = async (e: React.FormEvent) => {
        e.preventDefault();

        const getResponse = await fetch(`${BASE_URL}/task_app/api/v1/api-task-list-get/${school_class}`, {
            headers: {
                'Access-Control-Request-Headers': 'Content-Type',
                'Content-Type': 'application/json',
            },
            credentials: 'include',
            method: 'GET'
        });

        if (getResponse.ok) {
            const responseData = await getResponse.json();
            setData(responseData);
            setGetTasksCompleted(true)
            setMessage(<h2 className="success-message">Задача получена.</h2>);
        } else {
            setMessage(<h2 className="error-message">Произошла ошибка при получении задачи.</h2>);
        }
    };

    return (
        <div className="form-container">
            {userData.is_staff ? (
                <>
                    <form onSubmit={getTasks}>
                        <select
                            className="form-control"
                            id="task_for"
                            name="task_for"
                            value={school_class}
                            onChange={(e) => setSchoolClass(e.target.value)}
                            required
                        >
                            <option value="">Выберите класс</option>
                            {CLASSES.map((option) => (
                                <option key={option} value={option}>
                                    {option}
                                </option>
                            ))}
                        </select>

                        <button type="submit" className="btn-primary" style={{ marginTop: '10px' }}>Получить задачи</button>
                    </form>

                    {school_class && getTasksCompleted ? (
                        <div>
                            <h2 style={{ textAlign: 'center' }}>Задачи для {school_class} класса:</h2>
                            {data.task_list.length > 0 ? (
                                data.task_list.map((option: Task, index: number) => (
                                    <Link key={index} to={`/check-answers/${school_class}/${option.id}`} className="btn-primary" style={{ width: '300px' }}>
                                        Проверить задачу {option.title}
                                    </Link>
                                ))
                            ) : (
                                <h2 className="error-message">У этого класса нет задач.</h2>
                            )}
                        </div>
                    ) : (
                        <div></div>
                    )
                    }

                </>
            ) : (
                <h2 className="error-message">У вас нет на это прав.</h2>
            )}
        </div>
    );
}

export default CheckAnswersHub;