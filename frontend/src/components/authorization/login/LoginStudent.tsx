import React, { SyntheticEvent, useEffect, useRef, useState } from 'react';
import { Navigate } from "react-router-dom";

import { BASE_URL, CLASSES } from '../../../constants';
import { getCookie } from '../../../functions';

import '../CSS/form-signing.css';
import './../../../App.css';


const LoginStudent = () => {
    // ### Assigning variables/Назначение переменных ###
    const errorTimeoutRef = useRef<NodeJS.Timeout>();
    const [redirect, setRedirect] = useState(false);
    const csrftoken = getCookie('csrftoken');
    const [error, setError] = useState('');

    // ### Assignment login variables/Назначение переменных входа ###
    const [school_class, setSchoolClass] = useState('');
    const [first_name, setFirstName] = useState('');
    const [last_name, setLastName] = useState('');
    const [password, setPassword] = useState('');

    // ### Working with server/Работа с сервером ###
    const login = async (e: SyntheticEvent) => {
        e.preventDefault();

        // Clear previous timeout if exists/Очистка предыдущего таймера
        if (errorTimeoutRef.current) {
            clearTimeout(errorTimeoutRef.current);
        }

        // Send request/Отправка запроса:
        const postResponse = await fetch(`${BASE_URL}/user_app/v1/api-student-login/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': csrftoken
            },
            credentials: 'include',
            body: JSON.stringify({
                password,
                last_name,
                first_name,
                school_class
            })
        });

        // Response processing/Обработка ответа:
        if (postResponse.ok) {
            setRedirect(true);
            setTimeout(() => {
                window.location.reload();
            }, 500);
        } else {
            const data = await postResponse.json();
            if (data && data.username) {
                setError(data.username[0]);
            } else {
                setError(data.detail);
            }

            // Hide error after 5 seconds/Скрытие ошибки через 5 секунд
            errorTimeoutRef.current = setTimeout(() => {
                setError('');
            }, 5000);
        }
    }

    // Cleanup effect/Очистка эффектов
    useEffect(() => {
        return () => {
            if (errorTimeoutRef.current) {
                clearTimeout(errorTimeoutRef.current);
            }
        };
    }, []);

    // ### Rendering HTMLElement/Отрисовка HTMLElement ###
    if (redirect) {
        return <Navigate to="/" />;
    }

    return (
        <div className="form-login-and-register">
            <div className="form-container">
                {/* ### Filling forms/Формы для заполнения ### */}
                <form onSubmit={login}>
                    <h1 className="h1">Авторизация</h1>

                    {/* Displaying message/Отображение сообщения */}
                    {error && <h3 style={{ marginBottom: "30px" }} className="error-message">{error}</h3>}

                    {/* Input fields/Поля ввода */}
                    <div className="form-group">
                        <input type="text" className="form-control" id="first_name" placeholder="Имя" required
                            onChange={e => setFirstName(e.target.value)}
                        />
                    </div>
                    <div className="form-group">
                        <input type="text" className="form-control" id="last_name" placeholder="Фамилия" required
                            onChange={e => setLastName(e.target.value)}
                        />
                    </div>
                    <div className="form-group">
                        <select className="form-control" id="school_class" name="school_class" onChange={e => setSchoolClass(e.target.value)} required>
                            <option value="">Выберите свой класс</option>
                            {CLASSES.map((option) => (
                                <option key={option} value={option}>
                                    {option}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className="form-group">
                        <input type="password" className="form-control" id="password" placeholder="Пароль" required
                            onChange={e => setPassword(e.target.value)}
                        />
                    </div>

                    {/* Send button/Кнопка отправки */}
                    <button className="btn-primary" type="submit">Авторизоваться</button>
                </form>
            </div>
        </div>
    );
};

export default LoginStudent;