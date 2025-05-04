import React, { useState } from 'react';
import { Link } from 'react-router-dom';

import { BASE_URL, SUBJECTS, CLASSES } from '../../constants';
import { useMessageHandler } from '../../functions';
import { Task, UserData } from '../../types';

import './CSS/add-task.css';
import '../../App.css';

const CheckAnswersHub: React.FC<{ userData: UserData }> = ({ userData }) => {
    // ### Assigning variables/Назначение переменных ###
    const { showMessage, MessageComponent, clearMessage } = useMessageHandler();
    const [data, setData] = useState<{ task_list: Task[] }>({ task_list: [] });
    const [getTasksCompleted, setGetTasksCompleted] = useState(false);
    const [subjectId, setSubjectId] = useState<number | ''>('');
    const [school_class, setSchoolClass] = useState('');
    const [status, setStatus] = useState('active');


    // Statuses/Статусы
    const STATUS_OPTIONS = [
        { value: 'archive', label: 'Архивные задачи' },
        { value: 'active', label: 'Активные задачи' },
        { value: 'all', label: 'Все задачи' }
    ];

    // ### Sending a GET request/Отправка GET запроса ###
    const getTasks = async (e: React.FormEvent) => {
        e.preventDefault();
        clearMessage();

        if (!school_class) {
            showMessage({
                content: 'Пожалуйста, выберите класс',
                type: 'error',
                duration: 3000
            });
            return;
        }

        // Формируем URL/Forming the URL
        let url = `${BASE_URL}/task_app/v1/api-task-list-get/?class=${school_class}`;

        if (status) {
            url += `&status=${status}`;
        }
        if (subjectId) {
            url += `&subject_id=${subjectId}`;
        }

        try {
            const getResponse = await fetch(url, {
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
                setGetTasksCompleted(true);
            } else {
                throw new Error('Произошла ошибка при загрузке задач');
            }
        } catch (error) {
            showMessage({
                content: 'Произошла неизвестная ошибка',
                type: 'error',
                duration: 3000
            });
            setGetTasksCompleted(false);
        }
    };

    // ### Rendering HTMLElement/Отрисовка HTMLElement ###
    return (
        <div className='form-tasks-and-answers'>
            <div className='form-container'>
                {userData.is_staff ? (
                    <div className="check-answers-container">
                        <div className="message-container">
                            <MessageComponent />
                        </div>

                        <form onSubmit={getTasks} style={{ width: '100%' }} className="filter-form">
                            <div className="form-group select-container">
                                <label htmlFor="task_for" className="select-label">Класс:</label>
                                <select
                                    onChange={(e) => setSchoolClass(e.target.value)}
                                    className='form-control select-input'
                                    style={{ width: '100%' }}
                                    value={school_class}
                                    name='task_for'
                                    id='task_for'
                                    required
                                >
                                    <option value=''>Выберите класс</option>
                                    {CLASSES.map((option) => (
                                        <option key={option} value={option}>
                                            {option}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="form-group select-container">
                                <label htmlFor="subject" className="select-label">Предмет:</label>
                                <select
                                    onChange={(e) => setSubjectId(e.target.value ? parseInt(e.target.value) : '')}
                                    className='form-control select-input'
                                    style={{ width: '100%' }}
                                    value={subjectId}
                                    name='subject'
                                    id='subject'
                                >
                                    {SUBJECTS.map((subject) => (
                                        <option key={subject.id} value={subject.id}>
                                            {subject.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="form-group">
                            <label htmlFor="subject" className="select-label">Статус:</label>
                                <select
                                    onChange={(e) => setStatus(e.target.value)}
                                    className='form-control select-input'
                                    style={{ width: '100%' }}
                                    value={status}
                                    name='status'
                                    id='status'
                                >
                                    {STATUS_OPTIONS.map((option) => (
                                        <option key={option.value} value={option.value}>
                                            {option.label}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <button type='submit' className='btn-primary submit-btn'>
                                Получить задачи
                            </button>
                        </form>

                        {school_class && getTasksCompleted && (
                            <div className="tasks-list-container">
                                <h2 className="tasks-list-title">
                                    Задачи для {school_class} класса ({STATUS_OPTIONS.find(o => o.value === status)?.label})
                                </h2>

                                <div className="tasks-grid">
                                    {data.task_list.length > 0 ? (
                                        data.task_list.map((option: Task, index: number) => (
                                            <Link
                                                key={index}
                                                className='task-card'
                                                state={{ taskData: option }}
                                                to={`/check-answers/${school_class}/${option.id}/${status}`}
                                            >   
                                                <div className="task-card-content">
                                                    <h3 className="task-title">{option.title}</h3>
                                                </div>
                                            </Link>
                                        ))
                                    ) : (
                                        <div className="no-tasks-message">
                                            <h2>Нет задач для выбранных параметров</h2>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="access-denied">
                        <h2>У вас нет на это прав.</h2>
                    </div>
                )}
            </div>
        </div>
    );
}

export default CheckAnswersHub;