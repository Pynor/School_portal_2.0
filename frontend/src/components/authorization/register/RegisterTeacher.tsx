import React, { SyntheticEvent, useState } from 'react';
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

    // ### Assignment registration variables/Назначение переменных регистрации ###
    const [first_name, setFirstName] = useState('');
    const [secret_key, setSecretKey] = useState('');
    const [last_name, setLastName] = useState('');
    const [username, setUserName] = useState('');
    const [password, setPassword] = useState('');

    // ### Logging upon successful registration/Вход в систему после успешной регистрации ###
    const login = async () => {
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
            let errorMessage = 'Ошибка входа';

            if (data.detail) errorMessage = data.detail;
            else if (data.non_field_errors)
                errorMessage = Array.isArray(data.non_field_errors) ? data.non_field_errors.join(', ') : data.non_field_errors;
            else if (data.username)
                errorMessage = Array.isArray(data.username) ? data.username.join(', ') : data.username;
            else if (typeof data === 'object') {
                const messages = Object.entries(data).map(([field, errors]) =>
                    Array.isArray(errors) ? `${field}: ${errors.join(', ')}` : `${field}: ${errors}`
                );
                if (messages.length) errorMessage = messages.join('; ');
            }

            showMessage({ content: errorMessage, type: 'error', duration: 5000 });
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
                    user: { password, username, last_name, first_name },
                    secret_key
                })
            });

            setLoading(false);

            if (postResponse.ok) {
                showMessage({
                    content: 'Вы успешно зарегистрировались. Выполняется вход...',
                    type: 'success',
                    duration: 3000
                });
                setTimeout(login, 3000);
            } else {
                const data = await postResponse.json();
                let errorMessage = 'Ошибка регистрации';

                if (data.detail) errorMessage = data.detail;
                else if (data.non_field_errors)
                    errorMessage = Array.isArray(data.non_field_errors) ? data.non_field_errors.join(', ') : data.non_field_errors;
                else if (data.username)
                    errorMessage = Array.isArray(data.username) ? data.username.join(', ') : data.username;
                else if (data.secret_key)
                    errorMessage = Array.isArray(data.secret_key) ? data.secret_key.join(', ') : data.secret_key;
                else if (typeof data === 'object') {
                    const messages = Object.entries(data).map(([field, errors]) =>
                        Array.isArray(errors) ? `${field}: ${errors.join(', ')}` : `${field}: ${errors}`
                    );
                    if (messages.length) errorMessage = messages.join('; ');
                }

                console.error('Ошибка регистрации учителя:', data);
                showMessage({ content: errorMessage, type: 'error', duration: 5000 });
            }
        } catch {
            setLoading(false);
            showMessage({ content: 'Ошибка сети при регистрации', type: 'error', duration: 5000 });
        }
    };

    if (redirect) return <Navigate to="/" />;

    return (
        <div className="form-login-and-register">
            <div className="form-container">
                <MessageComponent />
                <form onSubmit={register}>
                    <h1 className="h1">Регистрация</h1>
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

                    <button className="btn-primary" type="submit" disabled={loading}>
                        {loading ? 'Загрузка...' : 'Зарегистрироваться'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default RegisterTeacher;