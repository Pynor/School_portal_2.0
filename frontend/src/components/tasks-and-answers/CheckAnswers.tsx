import React, { useState } from 'react';
import { useParams } from 'react-router-dom';

import { Task, UserData } from '../../types';
import { BASE_URL } from '../../constants';

import './CSS/add-task.css';


const CheckAnswers: React.FC<{ userData: UserData }> = ({ userData }) => {
    const [data, setData] = useState<{ task_list: Task[] }>({ task_list: [] });
    const [message, setMessage] = useState<React.ReactNode>(null);
    const { schoolClass, taskListId } = useParams();

    const addTasks = async (e: React.FormEvent) => {
        e.preventDefault();

        const getResponse = await fetch(`${BASE_URL}/task_app/api/v1/api-answer-list-get/${schoolClass}/${taskListId}`, {
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
            setMessage(<h2 className="success-message">Задача получена.</h2>);
        } else {
            setMessage(<h2 className="error-message">Произошла ошибка при получении задачи.</h2>);
        }
    };

    return (
        <div className="form-container">
            {userData.is_staff ? (
                <div>
                </div>
            ) : (
                <h2 className="error-message">У вас нет на это прав.</h2>
            )}
        </div>
    );
}

export default CheckAnswers;