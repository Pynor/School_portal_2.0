import React, { SyntheticEvent, useEffect, useRef, useState } from 'react';
import { Navigate } from "react-router-dom";

import { BASE_URL, CLASSES } from '../../../constants';
import { useMessageHandler, getCookie } from '../../../functions';

import '../CSS/form-signing.css';
import './../../../App.css';


const LoginStudent = () => {
    // ### Assigning variables/Назначение переменных ###
    const { showMessage, MessageComponent, clearMessage } = useMessageHandler();
    const messageRef = useRef<HTMLDivElement | null>(null);
    const [redirect, setRedirect] = useState(false);
    const csrftoken = getCookie('csrftoken');

    // ### Assignment login variables/Назначение переменных входа ###
    const [school_class, setSchoolClass] = useState('');
    const [first_name, setFirstName] = useState('');
    const [last_name, setLastName] = useState('');
    const [password, setPassword] = useState('');

    // ### Working with server/Работа с сервером ###
    const login = async (e: SyntheticEvent) => {
        e.preventDefault();
        clearMessage();

        // Send request/Отправка запроса:
        const postResponse = await fetch(`${BASE_URL}/user_app/v1/api-student-login/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': csrftoken
            },
            credentials: 'include',
            body: JSON.stringify({
                school_class,
                first_name,
                last_name,
                password,
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
                showMessage({
                    content: data.username[0],
                    type: 'error',
                    duration: 4000
                });
            } else {
                showMessage({
                    content: data.detail,
                    type: 'error',
                    duration: 4000
                });
            }

        }
    }


    // ### Rendering HTMLElement/Отрисовка HTMLElement ###
    if (redirect) {
        return <Navigate to="/" />;
    }

    return (
        <div className="form-login-and-register">
            <div className="form-container">
                {/* Displaying message/Отображение сообщения */}
                <div ref={messageRef}>
                    <MessageComponent />
                </div>

                {/* ### Filling forms/Формы для заполнения ### */}
                <form onSubmit={login}>
                    <h1 className="h1">Авторизация</h1>
                    {/* Displaying message/Отображение сообщения */}

                    {/* Input fields/Поля ввода */}
                    <div className="form-group">
                        <input type="text" className="form-control" id="first_name" placeholder="Имя" required
                            onChange={e => setFirstName(e.target.value)}
                            style={{ width: '100%' }}
                        />
                    </div>
                    <div className="form-group">
                        <input type="text" className="form-control" id="last_name" placeholder="Фамилия" required
                            onChange={e => setLastName(e.target.value)}
                            style={{ width: '100%' }}
                        />
                    </div>
                    <div className="form-group">
                        <select className="form-control" id="school_class" name="school_class" required
                            onChange={e => setSchoolClass(e.target.value)}
                            style={{ width: '100%' }}>

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
                            style={{ width: '100%' }}
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