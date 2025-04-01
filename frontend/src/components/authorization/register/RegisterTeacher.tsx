import React, { SyntheticEvent, useEffect, useRef, useState } from 'react';
import { Navigate } from "react-router-dom";

import { getCookie } from '../../../functions';
import { BASE_URL } from '../../../constants';

import '../CSS/form-signing.css';
import './../../../App.css';

const RegisterTeacher = () => {
    // ### Assigning technical variables/Назначение технических переменных ###
    const [message, setMessage] = useState<React.ReactNode>(null);
    const errorTimeoutRef = useRef<NodeJS.Timeout>();
    const messageTimeoutRef = useRef<NodeJS.Timeout>();
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
                // Показываем сообщение об успехе
                setMessage(
                    <div className="message-animation">
                        <h2 style={{ marginBottom: "30px" }} className="success-message">
                            Вы успешно зарегистрировались. Выполняется вход...
                        </h2>
                    </div>
                );

                // Ждем 3 секунды перед входом
                messageTimeoutRef.current = setTimeout(async () => {
                    await login();
                    // Плавно скрываем сообщение
                    setMessage(null);
                }, 3000);
            } else {
                const data = await postResponse.json();
                setError(data.username ? data.username[0] : data.detail || 'Ошибка регистрации');
                
                // Hide error after 5 seconds/Скрытие ошибки через 5 секунд
                errorTimeoutRef.current = setTimeout(() => {
                    setError('');
                }, 5000);
            }
        } catch (err) {
            setLoading(false);
            setError('Ошибка сети при регистрации');
            errorTimeoutRef.current = setTimeout(() => {
                setError('');
            }, 5000);
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
    if (redirect) {
        return <Navigate to="/" />;
    }

    return (
        <div className="form-login-and-register">
            <div className="form-container">
                {!message ? (
                    /* Form of sending/Форма отправки */
                    <form onSubmit={register}>
                        <h1 className="h1">Регистрация</h1>
                        {error && <h3 className="error-message">{error}</h3>}
                        <div className="form-group">
                            <input
                                type="text"
                                className="form-control"
                                id="first_name"
                                placeholder="Имя"
                                required
                                value={first_name}
                                onChange={e => setFirstName(e.target.value)}
                            />
                        </div>
                        <div className="form-group">
                            <input
                                type="text"
                                className="form-control"
                                id="last_name"
                                placeholder="Фамилия"
                                required
                                value={last_name}
                                onChange={e => setLastName(e.target.value)}
                            />
                        </div>
                        <div className="form-group">
                            <input
                                type="text"
                                className="form-control"
                                id="username"
                                placeholder="Имя пользователя"
                                required
                                value={username}
                                onChange={e => setUserName(e.target.value)}
                            />
                        </div>
                        <div className="form-group">
                            <input
                                type="password"
                                className="form-control"
                                id="password"
                                placeholder="Пароль"
                                required
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                            />
                        </div>
                        <div className="form-group">
                            <input
                                type="password"
                                className="form-control"
                                id="secret_key"
                                placeholder="Кодовое слово"
                                required
                                value={secret_key}
                                onChange={e => setSecretKey(e.target.value)}
                            />
                        </div>

                        {/* Send button/Кнопка отправки */}
                        <button className="btn-primary" type="submit" disabled={loading}>
                            {loading ? 'Загрузка...' : 'Зарегистрироваться'}
                        </button>
                    </form>
                ) : (
                    message
                )}
            </div>
        </div>
    );
};

export default RegisterTeacher;