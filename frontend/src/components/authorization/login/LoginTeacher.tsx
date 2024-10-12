import React, { SyntheticEvent, useState } from 'react';
import { Navigate } from "react-router-dom";

import { BASE_URL } from '../../../constants';
import { UserData } from '../../../types';
import getCookie from '../../../functions';

import '../CSS/form-signing.css'


const LoginTeacher = (props: { userData: UserData }) => {
    const csrftoken = getCookie('csrftoken');
    const [redirect, setRedirect] = useState(false);
    const [error, setError] = useState('');

    const [username, setUername] = useState('');
    const [password, setPassword] = useState('');

    const login = async (e: SyntheticEvent) => {
        e.preventDefault();

        const postResponse = await fetch(`${BASE_URL}/user_app/api/v1/api-teacher-login/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': csrftoken
            },
            credentials: 'include',
            body: JSON.stringify({
                password,
                username
            })
        });

        if (postResponse.ok) {
            const data = await postResponse.json();
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
        }
    }

    if (redirect) {
        return <Navigate to="/" />;
    }

    return (
        <div className="form-container">
            <form onSubmit={login}>
                <h1 className="h1">Авторизация</h1>
                {error && <h3 className="error-message">{error}</h3>}
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