import React, { SyntheticEvent, useState } from 'react';
import { Navigate } from "react-router-dom";

import { getCookie } from '../../../functions';
import { BASE_URL } from '../../../constants';

import '../CSS/form-signing.css';
import './../../../App.css';


const RegisterTeacher = () => {

    const [message, setMessage] = useState<React.ReactNode>(null);
    const [redirect, setRedirect] = useState(false);
    const csrftoken = getCookie('csrftoken');
    const [error, setError] = useState('');

    const [first_name, setFirstName] = useState('');
    const [secret_key, setSecretKey] = useState('');
    const [last_name, setLastName] = useState('');
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
                user: {
                    password: password,
                    username: username,
                    last_name: last_name,
                    first_name: first_name
                },
                secret_key: secret_key
            })
        });

        if (postResponse.ok) {

            setMessage(<h2 className="success-message">Вы успешно зарегистрировались.</h2>);

            setTimeout(() => {
                setRedirect(true);
            }, 2000);

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
        return <Navigate to="/login-teacher" />;
    }

    return (
        <div className="form-login-and-register">
            <div className="form-container">
                {!message ? (
                    <form onSubmit={submit}>
                        <h1 className="h1">Регистрация</h1>
                        {error && <h3 className="error-message">{error}</h3>}
                        <div className="form-group">
                            <input type="text" className="form-control" id="first_name" placeholder="Имя" required
                                onChange={e => setFirstName(e.target.value)}
                            />
                        </div>
                        <div className="form-group">
                            <input type="text" className="form-control" id="last_name" placeholder="Фамилия" required
                                onChange={e => setLastName(e.target.value)}
                            />
                        </div>
                        <div className="form-group">
                            <input type="text" className="form-control" id="username" placeholder="Имя пользователья" required
                                onChange={e => setUserName(e.target.value)}
                            />
                        </div>
                        <div className="form-group">
                            <input type="password" className="form-control" id="password" placeholder="Пароль" required
                                onChange={e => setPassword(e.target.value)}
                            />
                        </div>
                        <div className="form-group">
                            <input type="password" className="form-control" id="secret_key" placeholder="Кодовое слово" required
                                onChange={e => setSecretKey(e.target.value)}
                            />
                        </div>
                        <button className="btn-primary" type="submit">Зарегестрироваться</button>
                    </form>
                ) : (message)
                }
            </div>
        </div>
    );
};

export default RegisterTeacher;