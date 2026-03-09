import React, { SyntheticEvent, useRef, useState } from 'react';
import { Navigate } from "react-router-dom";

import { useMessageHandler, getCookie } from '../../../functions';
import { BASE_URL } from '../../../constants';

import '../CSS/form-signing.css';
import './../../../App.css';

const LoginTeacher = () => {
    // ### Assigning variables/Назначение переменных ###
    const { showMessage, MessageComponent, clearMessage } = useMessageHandler();
    const messageRef = useRef<HTMLDivElement | null>(null);
    const [redirect, setRedirect] = useState(false);
    const csrftoken = getCookie('csrftoken');

    // ### Assignment login variables/Назначение переменных входа ###
    const [password, setPassword] = useState('');
    const [username, setUsername] = useState('');

    // ### Working with server/Работа с сервером ###
    const login = async (e: SyntheticEvent) => {
        e.preventDefault();
        clearMessage();

        const postResponse = await fetch(`${BASE_URL}/user_app/v1/api-teacher-login/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': csrftoken
            },
            credentials: 'include',
            body: JSON.stringify({ password, username })
        });

        if (postResponse.ok) {
            setRedirect(true);
            setTimeout(() => window.location.reload(), 500);
        } else {
            const data = await postResponse.json();
            let errorMessage = 'Неизвестная ошибка';

            if (data.detail) {
                errorMessage = data.detail;
            } else if (data.non_field_errors) {
                errorMessage = Array.isArray(data.non_field_errors)
                    ? data.non_field_errors.join(', ')
                    : data.non_field_errors;
            } else if (data.username) {
                errorMessage = Array.isArray(data.username)
                    ? data.username.join(', ')
                    : data.username;
            } else if (data.password) {
                errorMessage = Array.isArray(data.password)
                    ? data.password.join(', ')
                    : data.password;
            } else if (typeof data === 'object') {
                const messages = Object.entries(data).map(([field, errors]) =>
                    Array.isArray(errors) ? `${field}: ${errors.join(', ')}` : `${field}: ${errors}`
                );
                if (messages.length) errorMessage = messages.join('; ');
            }

            showMessage({ content: errorMessage, type: 'error', duration: 4000 });
            messageRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
    };

    if (redirect) return <Navigate to="/" />;

    return (
        <div className="form-login-and-register">
            <div className="form-container">
                <div ref={messageRef}>
                    <MessageComponent />
                </div>

                <form onSubmit={login}>
                    <h1 className="h1">Авторизация</h1>
                    <div className="form-group">
                        <input
                            type="text"
                            className="form-control"
                            id="username"
                            placeholder="Имя пользователя"
                            required
                            onChange={e => setUsername(e.target.value)}
                            style={{ width: '100%' }}
                        />
                    </div>
                    <div className="form-group">
                        <input
                            type="password"
                            className="form-control"
                            id="password"
                            placeholder="Пароль"
                            required
                            onChange={e => setPassword(e.target.value)}
                            style={{ width: '100%' }}
                        />
                    </div>
                    <button className="btn-primary" type="submit">Авторизоваться</button>
                </form>
            </div>
        </div>
    );
};

export default LoginTeacher;