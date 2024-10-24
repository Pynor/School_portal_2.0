import React, { useState } from 'react';
import { Link } from "react-router-dom";

import { BASE_URL } from '../../constants';
import { UserData } from '../../types';
import getCookie from '../../functions';


import './CSS/nav.css'


const Nav = (props: { userData: UserData, setName: (name: string) => void }) => {
  const csrftoken = getCookie('csrftoken');

  const [message, setMessage] = useState<React.ReactNode>(null);
  const [showMessage, setShowMessage] = useState(false);

  const logout = async () => {
    try {
      await fetch(`${BASE_URL}/user_app/api/v1/api-user-logout/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRFToken': csrftoken
        },
        credentials: 'include',
      });

      props.setName('');
      setShowMessage(true);
      setMessage(
        <div className="form-container">
          <h2 className="success-message">Вы успешно вышли.</h2>
        </div>
      );

      setTimeout(() => {
        window.location.reload();
      }, 1000);

    } catch (error) {
      setShowMessage(true);
      setMessage(
        <div className="form-container">
          <h2 className="error-message">Ошибка при выходе.</h2>
        </div>
      );
    }
  };

  const menu = props.userData.username === "" ? (
    <ul className="navbar-nav">
      <li className="nav-item">
        <Link to="/login-hub" className="nav-link btn btn-primary">Вход</Link>
      </li>
      <li className="nav-item">
        <Link to="/register-hub" className="nav-link btn btn-primary">Регистрация</Link>
      </li>
    </ul>
  ) : (
    <ul className="navbar-nav">
      <li className="nav-item">
        <Link to="/profile" className="nav-link btn btn-primary">Профиль</Link>
      </li>
      <li className="nav-item">
        <Link to="/" className="nav-link btn btn-primary" onClick={logout}>Выйти</Link>
      </li>
    </ul>
  );

  return (
    <nav className="navbar navbar-expand-lg navbar-light bg-light navbar-home">
      <div className="container-fluid">
        <Link to="/" className="nav-link btn btn-primary">Главная</Link>

        <div className="navbar-menu">
          {menu}
        </div>
      </div>
      {showMessage && message}
    </nav>
  );
};

export default Nav;