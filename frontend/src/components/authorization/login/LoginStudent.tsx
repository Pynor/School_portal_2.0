import React, { SyntheticEvent, useState } from 'react';
import { Navigate } from "react-router-dom";

import { BASE_URL } from '../../../constants';
import { UserData } from '../../../types';
import getCookie from '../../../functions';

import '../CSS/form-signin.css'


const LoginStudent = (props: {userData: UserData} ) => {

    const csrftoken = getCookie('csrftoken');
    const [redirect, setRedirect] = useState(false);
    const [error, setError] = useState('');

    const [last_name, setLastName] = useState('');
    const [first_name, setFirstName] = useState('');
    const [school_class, setSchoolClass] = useState('');
    const [password, setPassword] = useState('');

    const submit = async (e: SyntheticEvent) => {
        e.preventDefault();

        const postResponse = await fetch(`${BASE_URL}/user_app/api/v1/api-student-login/`, {
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
                <h1 className="h3 mb-3 fw-normal">Please sign in</h1>
                {error && <p className="error-message">{error}</p>}
                <input type="last_name" className="form-control" placeholder="Фамилия" required
                    onChange={e => setLastName(e.target.value)}
                />
                <input type="first_name" className="form-control" placeholder="Имя" required
                    onChange={e => setFirstName(e.target.value)}
                />
                <input type="school_class" className="form-control" placeholder="Класс" required
                    onChange={e => setSchoolClass(e.target.value)}
                />

                <input type="password" className="form-control" placeholder="Пароль" required
                    onChange={e => setPassword(e.target.value)}
                />

                <button className="w-100 btn btn-lg btn-primary" type="submit">Авторизоваться</button>
            </form>
        </div>
    );
};

export default LoginStudent;