import React, { SyntheticEvent, useEffect, useRef, useState } from 'react';
import { Navigate } from "react-router-dom";

import { useMessageHandler, getCookie } from '../../../functions';
import { BASE_URL } from '../../../constants';

import '../CSS/form-signing.css';
import './../../../App.css';

const RegisterTeacher = () => {
    // ### Assigning technical variables/Назначение технических переменных ###
    const { showMessage, MessageComponent, clearMessage } = useMessageHandler();
    const [redirect, setRedirect] = useState(false);
    const [loading, setLoading] = useState(false);
    const csrftoken = getCookie('csrftoken');
    const [error, setError] = useState('');

    // ### Assignment registration variables/Назначение переменных регистрации ###
    const [first_name, setFirstName] = useState('');
    const [secret_key, setSecretKey] = useState('');
    const [last_name, setLastName] = useState('');
    const [username, setUserName] = useState('');
    const [password, setPassword] = useState('');

    // ### Logging upon successful registration/Вход в систему после успешной регистрации ###
    const login = async () => {
        // Send request/Отправка запроса:
        const postResponse = await fetch(`${BASE_URL}/user_app/v1/api-teacher-login/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': csrftoken
            },
            credentials: 'include',
            body: JSON.stringify({ password, username })
        });

        // Response processing/Обработка ответа:
        if (postResponse.ok) {
            setRedirect(true);
            setTimeout(() => {
                window.location.reload();
            }, 500);
        } else {
            const data = await postResponse.json();
            setError(data.username ? data.username[0] : data.detail || 'Ошибка входа');
        }
    };

    // ### Sending a registration request/Отправка запроса на регистрацию ###
    const register = async (e: SyntheticEvent) => {
        e.preventDefault();
        setLoading(true);
        clearMessage();

        try {
            const postResponse = await fetch(`${BASE_URL}/user_app/v1/api-teacher-register/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': csrftoken
                },
                credentials: 'include',
                body: JSON.stringify({
                    user: {
                        password,
                        username,
                        last_name,
                        first_name
                    },
                    secret_key
                })
            });

            setLoading(false);

            if (postResponse.ok) {
                // Showing a success message/Показываем сообщение об успехе
                showMessage({
                    content: 'Вы успешно зарегистрировались. Выполняется вход...',
                    type: 'success',
                    duration: 3000
                });

                setTimeout(async () => {
                    await login();
                }, 3000);

            } else {
                const data = await postResponse.json();
                showMessage({
                    content: data.username ? data.username[0] : data.detail || 'Ошибка регистрации',
                    type: 'error',
                    duration: 5000
                });

            }
        } catch (err) {
            setLoading(false);
            showMessage({
                content: 'Ошибка сети при регистрации',
                type: 'error',
                duration: 5000
            });
        }
    };


    // ### Rendering HTMLElement/Отрисовка HTMLElement ###
    if (redirect) {
        return <Navigate to="/" />;
    }

    return (
        <div className="form-login-and-register">
            <div className="form-container">
                <MessageComponent />
                {/* Form of sending/Форма отправки */}
                <form onSubmit={register}>
                    <h1 className="h1">Регистрация</h1>
                    {error && <h3 className="error-message">{error}</h3>}
                    <div className="form-group">
                        <input
                        onChange={e => setFirstName(e.target.value)}
                            style={{ width: '100%' }}
                            className="form-control"
                            value={first_name}
                            placeholder="Имя"
                            id="first_name"
                            type="text"
                            required
                        />
                    </div>
                    <div className="form-group">
                        <input
                        onChange={e => setLastName(e.target.value)}
                            style={{ width: '100%' }}
                            className="form-control"
                            placeholder="Фамилия"
                            value={last_name}
                            id="last_name"
                            type="text"
                            required
                        />
                    </div>
                    <div className="form-group">
                        <input
                            onChange={e => setUserName(e.target.value)}
                            placeholder="Имя пользователя"
                            style={{ width: '100%' }}
                            className="form-control"
                            value={username}
                            id="username"
                            type="text"
                            required
                        />
                    </div>
                    <div className="form-group">
                        <input
                            onChange={e => setPassword(e.target.value)}
                            style={{ width: '100%' }}
                            className="form-control"
                            placeholder="Пароль"
                            value={password}
                            type="password"
                            id="password"
                            required
                        />
                    </div>
                    <div className="form-group">
                        <input
                            onChange={e => setSecretKey(e.target.value)}
                            placeholder="Кодовое слово"
                            style={{ width: '100%' }}
                            className="form-control"
                            value={secret_key}
                            type="password"
                            id="secret_key"
                            required
                        />
                    </div>

                    {/* Send button/Кнопка отправки */}
                    <button className="btn-primary" type="submit" disabled={loading}>
                        {loading ? 'Загрузка...' : 'Зарегистрироваться'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default RegisterTeacher;