import React, { useEffect, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';

import { StudentAndAnswer, UserData } from '../../types';
import { BASE_URL } from '../../constants';

import './CSS/add-task.css';


const CheckAnswers: React.FC<{ userData: UserData }> = ({ userData }) => {
    const [data, setData] = useState<StudentAndAnswer[]>();
    const [message, setMessage] = useState<React.ReactNode>(null);
    const { schoolClass, taskListId } = useParams();
    const hasFetchedRef = useRef(false);

    useEffect(() => {
        const addTasks = async () => {

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
                    setMessage(<h2 className="success-message">Задача получена.</h2>);
                } else {
                    setMessage(<h2 className="error-message">Произошла ошибка при получении задачи.</h2>);
                }
            } catch (error) {
                setMessage(<h2 className="error-message">Произошла ошибка</h2>);
            }
        };

        addTasks();
    }, []);


    return (
        <div className="form-container">
            <Link to="/check-answers-hub" className="btn-primary" style={{alignSelf: "flex-start"}}>Вернутся</Link>
            {userData.is_staff ? (
                <div>
                    <h1>Ответы учеников {schoolClass} класса.</h1>

                    {data?.map((answer_and_student, index) => (
                        <div key={index} className="form-container">
                            <h3>{answer_and_student.student.first_name} {answer_and_student.student.last_name}</h3>
                            <div>
                                {answer_and_student.student.authorized ? (
                                    answer_and_student.answers.length === 0 ? (
                                        <h2 className="normal-message">Ученик еще не дал ответа.</h2>
                                    ) : (
                                        answer_and_student.answers.map((answer, index) => (
                                            <div key={index} >
                                                <h3>Ответ: {answer.answer}</h3>
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