import React, { useEffect, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';

import { StudentAndAnswerForCheckAnswers, UserData } from '../../types';
import { BASE_URL } from '../../constants';

import Modal from './ModalWindows';

import './CSS/check-answers.css'
import '../../App.css';


const CheckAnswers: React.FC<{ userData: UserData }> = ({ userData }) => {
    // ### Assigning variables/Назначение переменных ###
    const [data, setData] = useState<StudentAndAnswerForCheckAnswers[]>();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const { schoolClass, taskListId } = useParams();
    const hasFetchedRef = useRef(false);


    // ### Sending a GET request/Отправка GET запроса ###
    useEffect(() => {
        const getAnswerLists = async () => {

            if (hasFetchedRef.current) return;
            hasFetchedRef.current = true;

            try {

                // Send request/Отправка запроса:
                const getResponse = await fetch(`${BASE_URL}/task_app/api/v1/api-answer-list-get/${schoolClass}/${taskListId}`, {
                    headers: {
                        'Access-Control-Request-Headers': 'Content-Type',
                        'Content-Type': 'application/json',
                    },
                    credentials: 'include',
                    method: 'GET'
                });

                // Response processing/Обработка ответа:
                if (getResponse.ok) {
                    const responseData = await getResponse.json();
                    setData(responseData);
                } else {
                    setErrorMessage('Произошла ошибка при получении задачи.');
                }

            } catch (error) {
                setErrorMessage('Произошла ошибка.');
            }
        };

        getAnswerLists();
    }, []);


    // ### Rendering HTMLElement/Отрисовка HTMLElement ###
    return (
        <div className="form-tasks-and-answers">
            <div className="form-container" style={{ boxShadow: 'none' }}>
                <Link to="/check-answers-hub" className="btn-primary" style={{ alignSelf: "flex-start" }}>Вернуться</Link>
                {errorMessage && <h2 className="error-message">{errorMessage}</h2>}

                {userData.is_staff ? (
                    <div>
                        <h1>Ответы учеников {schoolClass} класса.</h1>

                        {data?.map((student_answer_and_task, index) => (
                            <div key={index} className="student-container">
                                <h1>{student_answer_and_task.student.first_name} {student_answer_and_task.student.last_name}</h1>
                                {student_answer_and_task.tasks_and_answers.length > 0 && (
                                    <h1>
                                        {new Date(student_answer_and_task.tasks_and_answers[0].execution_time_answer * 1000)
                                            .toISOString()
                                            .substr(11, 8)}
                                    </h1>
                                )}
                                <hr className="divider" />
                                <div>
                                    {student_answer_and_task.student.authorized ? (
                                        student_answer_and_task.tasks_and_answers.length === 0 ? (
                                            <h2 className="normal-message">Ученик еще не дал ответа.</h2>
                                        ) : (
                                            student_answer_and_task.tasks_and_answers.map((answer_and_task, index) => (
                                                <div key={index} className="answer-container">
                                                    <h2>Задача: {answer_and_task.task.title}</h2>

                                                    {answer_and_task.answer.photo_to_the_answer ? (
                                                        <div>
                                                            <img
                                                                alt="Загруженное"
                                                                onClick={() => setIsModalOpen(true)}
                                                                src={`${BASE_URL}${answer_and_task.answer.photo_to_the_answer}`}
                                                                style={{ maxWidth: '100%', height: 'auto', objectFit: 'cover' }}
                                                            />
                                                            <Modal
                                                                isOpen={isModalOpen}
                                                                onClose={() => setIsModalOpen(false)}
                                                                imageSrc={`${BASE_URL}${answer_and_task.answer.photo_to_the_answer}`}
                                                            />
                                                        </div>
                                                    ) : (
                                                        answer_and_task.task.additional_condition == "Photo" ? (
                                                            <h3 className="error-message">Ученик не прикрепил фотографию</h3>
                                                        ) : (null)
                                                    )}

                                                    {answer_and_task.answer.answer ? (
                                                        answer_and_task.answer.answer === answer_and_task.task.answer_to_the_task ? (
                                                            <h3 className="success-message">
                                                                Ответ: {answer_and_task.answer.answer}
                                                                <span className="success-message"> верно.</span>
                                                            </h3>
                                                        ) : (
                                                            <h3>
                                                                Ответ: {answer_and_task.answer.answer}
                                                                <span className="error-message"> неверно.</span>
                                                            </h3>
                                                        )
                                                    ) : (
                                                        <h3>Ответ: <span className="error-message"> отсутствует.</span></h3>
                                                    )}

                                                    <hr className="divider" />
                                                </div>
                                            ))
                                        )
                                    ) : (
                                        <h2 className="error-message">Ученик еще не зарегистрировался.</h2>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <h2 className="error-message">У вас нет на это прав.</h2>
                )}
            </div>
        </div>
    );
}

export default CheckAnswers;