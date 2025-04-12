import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';

import { BASE_URL, CLASSES } from '../../constants';
import { Task, UserData } from '../../types';

import './CSS/add-task.css';
import '../../App.css';

const CheckAnswersHub: React.FC<{ userData: UserData }> = ({ userData }) => {
    // ### Assigning variables/Назначение переменных ###
    const [data, setData] = useState<{ task_list: Task[] }>({ task_list: [] });
    const [getTasksCompleted, setGetTasksCompleted] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [school_class, setSchoolClass] = useState('');
    const messageTimeoutRef = useRef<NodeJS.Timeout>();
    const errorTimeoutRef = useRef<NodeJS.Timeout>();
    const [status, setStatus] = useState('active'); 

    // Statuses/Статусы
    const STATUS_OPTIONS = [
        { value: 'archive', label: 'Архивные задачи' },
        { value: 'active', label: 'Активные задачи' },
        { value: 'all', label: 'Все задачи' },
        // Добавьте другие статусы по необходимости
    ];

    // ### Sending a GET request/Отправка GET запроса ###
    const getTasks = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!school_class) {
            setErrorMessage('Пожалуйста, выберите класс');
            return;
        }

        // Формируем URL в зависимости от выбранного статуса
        let url = `${BASE_URL}/task_app/v1/api-task-list-get/${school_class}`;
        if (status) {
            url += `/${status}`;
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
                setErrorMessage('');
            } else {
                throw new Error('Произошла ошибка при загрузке задач');
            }
        } catch (error) {
            setErrorMessage('Произошла неизвестная ошибка');
            setGetTasksCompleted(false);
        }
    };

    // Cleanup effect/Очистка эффектов
    useEffect(() => {
        return () => {
            if (errorTimeoutRef.current) {
                clearTimeout(errorTimeoutRef.current);
            }
            if (messageTimeoutRef.current) {
                clearTimeout(messageTimeoutRef.current);
            }
        };
    }, []);

    // ### Rendering HTMLElement/Отрисовка HTMLElement ###
    return (
        <div className='form-tasks-and-answers'>
            <div className='form-container'>
                {userData.is_staff ? (
                    <>
                        {errorMessage && <h2 className='error-message'>{errorMessage}</h2>}

                        <form onSubmit={getTasks}>
                            <select
                                onChange={(e) => setSchoolClass(e.target.value)}
                                className='form-control'
                                style={{ width: "100%" }}
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

                            <select
                                onChange={(e) => setStatus(e.target.value)}
                                className='form-control'
                                style={{ width: "100%", marginTop: '10px' }}
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

                            <button type='submit' className='btn-primary' style={{ marginTop: '10px' }}>
                                Получить задачи
                            </button>
                        </form>

                        {school_class && getTasksCompleted && (
                            <div>
                                <h2 style={{ textAlign: 'center' }}>
                                    Задачи для {school_class} класса ({STATUS_OPTIONS.find(o => o.value === status)?.label})
                                </h2>
                                {data.task_list.length > 0 ? (
                                    data.task_list.map((option: Task, index: number) => (
                                        <Link
                                            key={index}
                                            className='btn-primary'
                                            style={{ width: '300px', marginBottom: '10px', display: 'block' }}
                                            to={`/check-answers/${school_class}/${option.id}`}
                                        >
                                            Проверить задачу {option.title}
                                        </Link>
                                    ))
                                ) : (
                                    <h2 className='error-message'>
                                        Нет задач для выбранных параметров
                                    </h2>
                                )}
                            </div>
                        )}
                    </>
                ) : (
                    <h2 className='error-message'>У вас нет на это прав.</h2>
                )}
            </div>
        </div>
    );
}

export default CheckAnswersHub;