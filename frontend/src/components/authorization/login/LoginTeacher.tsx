import React, { SyntheticEvent, useState } from 'react';
import { Navigate } from "react-router-dom";

import { getCookie } from '../../../functions';
import { BASE_URL } from '../../../constants';

import '../CSS/form-signing.css';
import './../../../App.css';


const LoginTeacher = () => {

    const [redirect, setRedirect] = useState(false);
    const csrftoken = getCookie('csrftoken');

    const [password, setPassword] = useState('');
    const [username, setUername] = useState('');
    const [error, setError] = useState('');

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
        <div className="form-login-and-register">
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
        </div>
    );
}

export default LoginTeacher;