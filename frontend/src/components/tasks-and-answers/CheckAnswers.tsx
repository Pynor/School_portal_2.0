import React, { useEffect, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';

import { StudentAndAnswerForCheckAnswers, UserData } from '../../types';
import { BASE_URL } from '../../constants';

import './CSS/add-task.css';


const CheckAnswers: React.FC<{ userData: UserData }> = ({ userData }) => {

    const [data, setData] = useState<StudentAndAnswerForCheckAnswers[]>();
    const [errorMessage, setErrorMessage] = useState('');
    const { schoolClass, taskListId } = useParams();
    const hasFetchedRef = useRef(false);

    useEffect(() => {
        const getAnswerLists = async () => {

            if (hasFetchedRef.current) return;
            hasFetchedRef.current = true;

            try {
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
                } else {
                    setErrorMessage('Произошла ошибка при получении задачи.');
                }
            } catch (error) {
                setErrorMessage('Произошла ошибка.');
            }
        };

        getAnswerLists();
    }, []);


    return (
        <div className="form-container">
            <Link to="/check-answers-hub" className="btn-primary" style={{alignSelf: "flex-start"}}>Вернутся</Link>
            {errorMessage && <h2 className="error-message">{errorMessage}</h2>}
            {userData.is_staff ? (
                <div>
                    <h1>Ответы учеников {schoolClass} класса.</h1>

                    {data?.map((student_answer_and_task, index) => (
                        <div key={index} className="form-container">
                            <h2>{student_answer_and_task.student.first_name} {student_answer_and_task.student.last_name}</h2>
                            <div>
                                {student_answer_and_task.student.authorized ? (
                                    student_answer_and_task.tasks_and_answers.length === 0 ? (
                                        <h2 className="normal-message">Ученик еще не дал ответа.</h2>
                                    ) : (
                                        student_answer_and_task.tasks_and_answers.map((answer_and_task, index) => (
                                            <div key={index} className="form-container">
                                                <h2>Задача: {answer_and_task.task.answer_to_the_task}</h2>
                                                <h3>Ответ Ученика: {answer_and_task.answer.answer}</h3>
                                            </div>
                                        ))
                                    )
                                ) : (<h2 className="error-message">Ученик еще не зарегестрировался.</h2>)
                                }
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <h2 className="error-message">У вас нет на это прав.</h2>
            )}
        </div>
    );
}

export default CheckAnswers;