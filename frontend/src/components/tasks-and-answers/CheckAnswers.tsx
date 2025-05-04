import { useParams, Navigate, Link, useLocation } from 'react-router-dom';
import React, { useEffect, useState, useRef } from 'react';

import { StudentAndAnswerForCheckAnswers, SortCriteria, UserData, Task } from '../../types';
import { useMessageHandler, getCookie } from '../../functions';
import { MEDIA_URL, BASE_URL, SUBJECTS } from '../../constants';

import Modal from './ModalWindows';

import './CSS/check-answers.css';
import '../../App.css';

const CheckAnswers: React.FC<{ userData: UserData }> = ({ userData }) => {
    // ### Assigning variables/Назначение переменных ###
    const criteriaOptions: SortCriteria[] = ['correct', 'alphabet', 'time', 'photo'];
    const [redirectMessage, setRedirectMessage] = useState<React.ReactNode>(null);
    const { showMessage, MessageComponent, clearMessage } = useMessageHandler();
    const [sortCriteria, setSortCriteria] = useState<SortCriteria>('correct');
    const [data, setData] = useState<StudentAndAnswerForCheckAnswers[]>();
    const [isTaskInfoModalOpen, setIsTaskInfoModalOpen] = useState(false);
    const { schoolClass, taskListId, status } = useParams();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [redirect, setRedirect] = useState(false);
    const taskData = useLocation().state?.taskData;
    const csrftoken = getCookie('csrftoken');
    const isArchived = status === 'archive';
    const hasFetchedRef = useRef(false);


    // ### Sending a GET request/Отправка GET запроса ###
    useEffect(() => {
        const getAnswerLists = async () => {
            if (hasFetchedRef.current) return;
            hasFetchedRef.current = true;

            try {
                const getResponse = await fetch(`${BASE_URL}/task_app/v1/api-answer-list-get/${schoolClass}/${taskListId}`, {
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
                } else {
                    showMessage({
                        content: 'Произошла ошибка при получении задачи.',
                        type: 'error',
                        duration: 3000
                    });
                }

            } catch (error) {
                showMessage({
                    content: 'Произошла ошибка.',
                    type: 'error',
                    duration: 3000
                });
            }
        };

        getAnswerLists();
    }, []);

    console.log(taskData)

    // ### Sending a DELETE request/Отправка DELETE запроса ###
    const deleteTaskList = async () => {
        clearMessage();
        try {
            const postResponse = await fetch(`${BASE_URL}/task_app/v1/api-task-list-delete/${taskListId}`, {
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': csrftoken
                },
                credentials: 'include',
                method: 'DELETE'
            });

            if (postResponse.ok) {
                setRedirectMessage(
                    <div className="success-message-container">
                        <h2 className="success-message">Тест завершен</h2>
                        <div className="success-icon">✓</div>
                    </div>
                );
                setTimeout(() => setRedirect(true), 1500);
            } else {
                showMessage({
                    content: 'Произошла ошибка при удалении теста.',
                    type: 'error',
                    duration: 3000
                });
            }

        } catch (error) {
            showMessage({
                content: 'Произошла ошибка.',
                type: 'error',
                duration: 3000
            });
        }
    };

    // ### Sending a DELETE request/Отправка DELETE запроса ###
    const archiveTaskList = async () => {
        clearMessage();
        try {
            const postResponse = await fetch(`${BASE_URL}/task_app/v1/api-task-list-change-status/${taskListId}`, {
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': csrftoken
                },
                credentials: 'include',
                method: 'PUT'
            });

            if (postResponse.ok) {
                setRedirectMessage(
                    <div className="success-message-container">
                        <h2 className="success-message">
                            {isArchived ? 'Тест разархивирован' : 'Тест заархивирован'}
                        </h2>
                    </div>
                );
                setTimeout(() => setRedirect(true), 1500);
            } else {
                showMessage({
                    content: `Произошла ошибка при ${isArchived ? 'раз' : ''}архивации теста.`,
                    type: 'error',
                    duration: 3000
                });
            }

        } catch (error) {
            showMessage({
                content: 'Произошла ошибка.',
                type: 'error',
                duration: 3000
            });
        }
    };

    // ### Function for sorting data/Функция для сортировки данных ###
    const filteredData = () => {
        if (!data) return [];

        const filtered = data.filter(student_answer_and_task => {
            const fullName = `${student_answer_and_task.student.first_name} ${student_answer_and_task.student.last_name}`;
            return fullName.toLowerCase().includes(searchTerm.toLowerCase());
        });

        return filtered.sort((a, b) => {
            const aHasPhoto = a.tasks_and_answers.some(answer => answer.answer.photo_to_the_answer);
            const bHasPhoto = b.tasks_and_answers.some(answer => answer.answer.photo_to_the_answer);

            const aHasAnswered = a.student.authorized && a.tasks_and_answers.length > 0;
            const bHasAnswered = b.student.authorized && b.tasks_and_answers.length > 0;

            const aCorrectCount = a.tasks_and_answers.filter(answer =>
                answer.answer.answer === answer.task.answer_to_the_task).length;
            const bCorrectCount = b.tasks_and_answers.filter(answer =>
                answer.answer.answer === answer.task.answer_to_the_task).length;

            const aName = `${a.student.first_name} ${a.student.last_name}`;
            const bName = `${b.student.first_name} ${b.student.last_name}`;

            switch (sortCriteria) {
                case 'time':
                    if (!a.student.authorized && !b.student.authorized) return 0;
                    if (!a.student.authorized) return 1;
                    if (!b.student.authorized) return -1;

                    if (!aHasAnswered && !bHasAnswered) return 0;
                    if (!aHasAnswered) return 1;
                    if (!bHasAnswered) return -1;

                    const timeA = a.tasks_and_answers[0]?.execution_time_answer || 0;
                    const timeB = b.tasks_and_answers[0]?.execution_time_answer || 0;

                    return timeA - timeB;

                case 'photo':
                    if (!a.student.authorized && !b.student.authorized) return 0;
                    if (!a.student.authorized) return 1;
                    if (!b.student.authorized) return -1;

                    if (!aHasAnswered && !bHasAnswered) return 0;
                    if (!aHasAnswered) return 1;
                    if (!bHasAnswered) return -1;

                    return (aHasPhoto === bHasPhoto) ? 0 : aHasPhoto ? -1 : 1;

                case 'correct':
                    if (aCorrectCount === bCorrectCount) {
                        return aName.localeCompare(bName);
                    }
                    return bCorrectCount - aCorrectCount;

                case 'alphabet':
                    return aName.localeCompare(bName);

                default:
                    return 0;
            }
        });
    };

    // ### Rendering HTMLElement/Отрисовка HTMLElement ###
    if (redirect) return <Navigate to='/check-answers-hub' />;

    return (
        <div className="check-answers-page">
            {!redirectMessage ? (
                <div className='check-answers-container'>
                    {userData.is_staff ? (
                        <>
                            <div className="header-section">
                                <Link to='/check-answers-hub' className='back-button'>
                                    <span className="arrow-icon">←</span> Вернуться
                                </Link>
                                <h1 className="page-title">
                                    Ответы учеников {schoolClass} класса {isArchived && "(архив)"}
                                </h1>
                            </div>

                            {isTaskInfoModalOpen && taskData && (
                                <div className="modal-overlay" onClick={() => setIsTaskInfoModalOpen(false)}>
                                    <div className="task-info-modal" onClick={e => e.stopPropagation()}>
                                        <button
                                            className="close-modal-button"
                                            onClick={() => setIsTaskInfoModalOpen(false)}
                                        >
                                            ×
                                        </button>
                                        <h2>Информация о списке задач</h2>
                                        <div className="task-info-content">
                                            <div className="task-info-row">
                                                <span className="task-info-label">Название:</span>
                                                <span className="task-info-value">{taskData.title}</span>
                                            </div>
                                            <div className="task-info-row">
                                                <span className="task-info-label">Описание:</span>
                                                <span className="task-info-value">{taskData.description || "Нет описания"}</span>
                                            </div>
                                            <div className="task-info-row">
                                                <span className="task-info-label">Предмет:</span>
                                                <span className="task-info-value">
                                                    {SUBJECTS.find(s => s.id === taskData.subject_id)?.name || "Не указан"}
                                                </span>
                                            </div>
                                            <div className="task-info-row">
                                                <span className="task-info-label">Класс:</span>
                                                <span className="task-info-value">{taskData.task_for}</span>
                                            </div>
                                            <div className="task-info-row">
                                                <span className="task-info-label">Дата создания:</span>
                                                <span className="task-info-value">
                                                    {new Date(taskData.created_at).toLocaleString()}
                                                </span>
                                            </div>
                                            <div className="task-info-row">
                                                <span className="task-info-label">Статус:</span>
                                                <span className="task-info-value">
                                                    {status === 'archive' ? 'Архив' : 'Активен'}
                                                </span>
                                            </div>
                                            <div className="task-info-tasks">
                                                <h3>Задачи в списке:</h3>
                                                {taskData.tasks && taskData.tasks.length > 0 ? (
                                                    <ul className="tasks-list">
                                                        {taskData.tasks.map((task: Task, index: number) => (
                                                            <li key={index} className="task-item">
                                                                <div className="task-item-title">{task.title}</div>
                                                                <div className="task-item-details">
                                                                    <div className="task-item-row">
                                                                        <span className="detail-label">Задача:</span>
                                                                        <span className="detail-value">{task.description}</span>
                                                                    </div>
                                                                    <div className="task-item-row">
                                                                        <span className="detail-label">Ответ:</span>
                                                                        <span className="detail-value">{task.answer_to_the_task}</span>
                                                                    </div>
                                                                </div>
                                                            </li>
                                                        ))}
                                                    </ul>
                                                ) : (
                                                    <p>Нет задач в этом списке</p>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div className='content-wrapper'>
                                {/* Панель управления */}
                                <div className='control-panel'>
                                    <div className="search-wrapper">
                                        <input
                                            type='text'
                                            placeholder='Поиск ученика...'
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                            className='search-input'
                                        />
                                        <span className="search-icon">🔍</span>
                                    </div>

                                    <div className="sort-section">
                                        <h2 className="sort-title">Сортировать по:</h2>
                                        <div className="sort-buttons">
                                            {criteriaOptions.map((criteria) => (
                                                <button
                                                    key={criteria}
                                                    className={`sort-button ${sortCriteria === criteria ? 'active' : ''}`}
                                                    onClick={() => setSortCriteria(criteria)}>
                                                    {criteria === 'photo' ? 'Фото' :
                                                        criteria === 'correct' ? 'Правильности' :
                                                            criteria === 'alphabet' ? 'Алфавиту' : 'Времени'}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {taskData && (
                                        <button
                                            className='task-info-button'
                                            onClick={() => setIsTaskInfoModalOpen(true)}
                                        >
                                            Информация о задании
                                        </button>
                                    )}

                                    {isArchived ? (
                                        <button className='archive-test-button' onClick={archiveTaskList}>
                                            Разархивировать тест
                                        </button>
                                    ) : (
                                        <button className='archive-test-button' onClick={archiveTaskList}>
                                            Архивировать тест
                                        </button>
                                    )}

                                    <button className='finish-test-button' onClick={deleteTaskList}>
                                        Удалить тест
                                    </button>
                                </div>

                                {/* Основное содержимое */}
                                <div className="main-content">
                                    <MessageComponent />
                                    <div className='students-list'>
                                        {filteredData().length === 0 ? (
                                            <div className='no-students-message'>
                                                <h2>Ученики не найдены</h2>
                                                <p>Попробуйте изменить параметры поиска</p>
                                            </div>
                                        ) : (
                                            filteredData().map((student_answer_and_task, index) => (
                                                <div key={index} className='student-card'>
                                                    <div className="student-header">
                                                        <h2 className="student-name">
                                                            {student_answer_and_task.student.first_name} {student_answer_and_task.student.last_name}
                                                        </h2>
                                                        {student_answer_and_task.tasks_and_answers.length > 0 && (
                                                            <div className="time-badge">
                                                                {new Date(student_answer_and_task.tasks_and_answers[0].execution_time_answer * 1000)
                                                                    .toISOString()
                                                                    .substr(11, 8)}
                                                            </div>
                                                        )}
                                                    </div>

                                                    <div className="student-content">
                                                        {student_answer_and_task.student.authorized ? (
                                                            student_answer_and_task.tasks_and_answers.length === 0 ? (
                                                                <div className="no-answer-message">
                                                                    <span className="icon">⏳</span>
                                                                    <span>Ученик еще не дал ответа</span>
                                                                </div>
                                                            ) : (
                                                                student_answer_and_task.tasks_and_answers.map((answer_and_task, index) => (
                                                                    <div key={index} className='answer-item'>
                                                                        <h3 className="task-title">{answer_and_task.task.title}</h3>

                                                                        {answer_and_task.answer.photo_to_the_answer ? (
                                                                            <div className="photo-section">
                                                                                <img
                                                                                    alt='Решение ученика'
                                                                                    className='answer-photo'
                                                                                    onClick={() => setIsModalOpen(true)}
                                                                                    src={`${MEDIA_URL}${answer_and_task.answer.photo_to_the_answer}`}
                                                                                />
                                                                                <Modal
                                                                                    isOpen={isModalOpen}
                                                                                    onClose={() => setIsModalOpen(false)}
                                                                                    imageSrc={`${MEDIA_URL}${answer_and_task.answer.photo_to_the_answer}`}
                                                                                />
                                                                            </div>
                                                                        ) : (
                                                                            answer_and_task.task.additional_condition === 'Photo' ? (
                                                                                <div className="photo-missing">
                                                                                    <span className="icon">📷</span>
                                                                                    <span>Фото не прикреплено</span>
                                                                                </div>
                                                                            ) : null
                                                                        )}

                                                                        <div className="answer-section">
                                                                            {answer_and_task.answer.answer ? (
                                                                                <div className={`answer-text ${answer_and_task.answer.answer === answer_and_task.task.answer_to_the_task ? 'correct' : 'incorrect'}`}>
                                                                                    <span>Ответ: {answer_and_task.answer.answer}</span>
                                                                                    <span className="verdict">
                                                                                        {answer_and_task.answer.answer === answer_and_task.task.answer_to_the_task ?
                                                                                            '✓ Верно' : '✗ Неверно'}
                                                                                    </span>
                                                                                </div>
                                                                            ) : (
                                                                                <div className="answer-missing">
                                                                                    <span className="icon">❌</span>
                                                                                    <span>Ответ отсутствует</span>
                                                                                </div>
                                                                            )}
                                                                        </div>
                                                                    </div>
                                                                ))
                                                            )
                                                        ) : (
                                                            <div className="not-registered-message">
                                                                <span className="icon">👤</span>
                                                                <span>Ученик не зарегистрирован</span>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="access-denied">
                            <h2>У вас нет доступа к этой странице</h2>
                            <p>Обратитесь к администратору для получения прав</p>
                        </div>
                    )}
                </div>
            ) : (
                <div className='redirect-message-container'>
                    {redirectMessage}
                </div>
            )}
        </div>
    );
}

export default CheckAnswers;