import React, { SyntheticEvent, useState } from 'react';
import { Navigate } from "react-router-dom";

import { BASE_URL } from '../../../constants';
import { UserData } from '../../../types';
import getCookie from '../../../functions';

import '../CSS/form-signin.css'


const LoginTeacher = (props: { userData: UserData }) => {
    const csrftoken = getCookie('csrftoken');
    const [redirect, setRedirect] = useState(false);
    const [error, setError] = useState('');

    const [username, setUername] = useState('');
    const [password, setPassword] = useState('');
    const [secret_key, setSecretKey] = useState('');

    const submit = async (e: SyntheticEvent) => {
        e.preventDefault();

        const postResponse = await fetch(`${BASE_URL}/user_app/api/v1/api-teacher-login/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': csrftoken
            },
            credentials: 'include',
            body: JSON.stringify({
                secret_key,
                password,
                username
            })
        });

        if (postResponse.ok) {
            const data = await postResponse.json();
            setRedirect(true);
        } else {
            const data = await postResponse.json();
            if (data && data.username) {
                setError(data.username[0]);
            } else {
                setError(data.detail);
            }
        }
    }

    if (redirect) {
        return <Navigate to="/" />;
    }

    return (
        <div className="form-container">
            <form onSubmit={submit}>
                <h1 className="h1">Регистрация</h1>
                {error && <h3 className="error-message">{error}</h3>}
                <div className="form-group">
                    <input type="password" className="form-control" id="secret_key" placeholder="Кодовое слово" required
                        onChange={e => setSecretKey(e.target.value)}
                    />
                </div>
                <div className="form-group">
                    <input type="text" className="form-control" id="username" placeholder="Имя пользователя" required
                        onChange={e => setUername(e.target.value)}
                    />
                </div>
                <div className="form-group">
                    <input type="password" className="form-control" id="password" placeholder="Пароль" required
                        onChange={e => setPassword(e.target.value)}
                    />
                </div>
                <button className="btn-primary" type="submit">Авторизоваться</button>
            </form>
        </div>
    );
}

export default LoginTeacher;