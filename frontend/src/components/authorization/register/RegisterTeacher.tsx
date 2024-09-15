import React, { SyntheticEvent, useState } from 'react';
import { Navigate } from "react-router-dom";

import { BASE_URL } from '../../../constants';
import { UserData } from '../../../types';
import getCookie from '../../../functions';

import '../CSS/form-signin.css'

const RegisterTeacher = (props: { userData: UserData }) => {

    const csrftoken = getCookie('csrftoken');
    const [redirect, setRedirect] = useState(false);
    const [error, setError] = useState('');
    
    const [email, setEmail] = useState('');
    const [username, setUserName] = useState('');
    const [password, setPassword] = useState('');

    const submit = async (e: SyntheticEvent) => {
        e.preventDefault();

        const postResponse = await fetch(`${BASE_URL}/user_app/api/v1/api-teacher-register/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': csrftoken
            },
            credentials: 'include',
            body: JSON.stringify({
                password,
                username,
                email
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
                    <input type="text" className="form-control" id="email" placeholder="Введите Почту" required
                        onChange={e => setEmail(e.target.value)}
                    />
                </div>
                <div className="form-group">
                    <input type="text" className="form-control" id="username" placeholder="Введите имя пользователья" required
                        onChange={e => setUserName(e.target.value)}
                    />
                </div>
                <div className="form-group">
                    <input type="password" className="form-control" id="password" placeholder="Введите пароль" required
                        onChange={e => setPassword(e.target.value)}
                    />
                </div>
                <button className="btn-primary" type="submit">Зарегестрироваться</button>
            </form>
        </div>
    );
};

export default RegisterTeacher;