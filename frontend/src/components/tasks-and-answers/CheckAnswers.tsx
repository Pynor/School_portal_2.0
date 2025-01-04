import React, { useEffect, useState, useRef } from 'react';
import { Link, useParams } from 'react-router-dom';

import { StudentAndAnswerForCheckAnswers, UserData } from '../../types';
import { BASE_URL } from '../../constants';

import Modal from './ModalWindows';

import './CSS/check-answers.css';
import '../../App.css';


const CheckAnswers: React.FC<{ userData: UserData }> = ({ userData }) => {
    // ### Assigning variables/Назначение переменных ###
    const [sortCriteria, setSortCriteria] = useState<'correct' | 'alphabet' | 'time' | 'photo'>('correct');
    const [data, setData] = useState<StudentAndAnswerForCheckAnswers[]>();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
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


    // ### Function for sorting data/Функция для сортировки данных ###
    const filteredData = () => {
        if (!data) return [];

        // Filtering data by search bar/Фильтрация данных по строке поиска
        const filtered = data.filter(student_answer_and_task => {
            const fullName = `${student_answer_and_task.student.first_name} ${student_answer_and_task.student.last_name}`;
            return fullName.toLowerCase().includes(searchTerm.toLowerCase());
        });

        // Sorting filtered data/Cортировка отфильтрованных данных 
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
                // The first on the list are the answers with less time/Первые в списке идут ответы с меньшим временем 
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

                // The answers with photos are at the top of the list/Первые в списке идут ответы с фотографиями
                case 'photo':
                    if (!a.student.authorized && !b.student.authorized) return 0;
                    if (!a.student.authorized) return 1;
                    if (!b.student.authorized) return -1;

                    if (!aHasAnswered && !bHasAnswered) return 0;
                    if (!aHasAnswered) return 1;
                    if (!bHasAnswered) return -1;

                    return (aHasPhoto === bHasPhoto) ? 0 : aHasPhoto ? -1 : 1;

                // The correct answers are at the top of the list/Первые в списке идут верные ответы
                case 'correct':
                    if (aCorrectCount === bCorrectCount) {
                        return aName.localeCompare(bName);
                    }
                    return bCorrectCount - aCorrectCount;

                // Alphabetically sorted/Сортировка по алфавиту
                case 'alphabet':
                    return aName.localeCompare(bName);

                default:
                    return 0;
            }
        });
    };


    // ### Rendering HTMLElement/Отрисовка HTMLElement ###
    return (
        <div className='form-container check'>
            {userData.is_staff ? ( // Checking rights/Проверка прав.
                <>
                    <Link to="/check-answers-hub" className="btn-primary check-answers-hub-link">Вернуться</Link>
                    <h1>Ответы учеников {schoolClass} класса.</h1>

                    <div className="form-tasks-and-answers form-check-answers">

                        {/* Контейнер для элементов управления сортировкой */}
                        <div className='sort-list'>

                            <input
                                type="text"
                                placeholder="Поиск ученика..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="search-input form-control"
                            />

                            <h2>Сортировать по:</h2>
                            <button className="btn-primary sort-button" onClick={() => setSortCriteria('photo')}>наличию фотографии</button>
                            <button className="btn-primary sort-button" onClick={() => setSortCriteria('correct')}>правильности</button>
                            <button className="btn-primary sort-button" onClick={() => setSortCriteria('alphabet')}>алфавиту</button>
                            <button className="btn-primary sort-button" onClick={() => setSortCriteria('time')}>времени</button>
                        </div>

                        {/* Основное содержимое */}
                        <div className="form-container check-container">


                            {/* Displaying message/Отображение сообщения */}
                            {errorMessage && <h2 className="error-message">{errorMessage}</h2>}

                            <div>
                                {filteredData().length === 0 ? (
                                    <h2 style={{marginLeft: '170px', marginRight: '70px'}}>Таких учеников нет</h2>
                                ) : (
                                    filteredData().map((student_answer_and_task, index) => (
                                        <div key={index} className="student-container">
                                            <h1>{student_answer_and_task.student.first_name} {student_answer_and_task.student.last_name}</h1>

                                            {/* Displaying the time taken to answer/Отображение времени затраченного на ответ */}
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

                                                                {/* Checking for photo/Проверка наличия фото */}
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
                                                                    answer_and_task.task.additional_condition === "Photo" ? (
                                                                        <h3 className="error-message">Ученик не прикрепил фотографию</h3>
                                                                    ) : null
                                                                )}

                                                                {/* Checking the student answer/Проверка ответа ученика */}
                                                                {answer_and_task.answer.answer ? (
                                                                    answer_and_task.answer.answer === answer_and_task.task.answer_to_the_task ? (
                                                                        <h3>
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
                                    )
                                    ))}
                            </div>
                        </div>
                    </div>
                </>
            ) : (
                <h2 className="error-message">У вас нет на это прав.</h2>
            )}
        </div>
    );
}


export default CheckAnswers;