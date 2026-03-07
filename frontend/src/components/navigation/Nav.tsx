import React from 'react';
import { Link } from "react-router-dom";

import { useMessageHandler, getCookie } from '../../functions';
import { BASE_URL } from '../../constants';
import { UserData } from '../../types';

import './CSS/nav.css';

const Nav = (props: { userData: UserData; setName: (name: string) => void }) => {
  const { showMessage, MessageComponent, clearMessage, currentMessage } = useMessageHandler();
  const csrftoken = getCookie('csrftoken');

  const logout = async () => {
    clearMessage();
    try {
      const postResponse = await fetch(`${BASE_URL}/user_app/v1/api-user-logout/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRFToken': csrftoken,
        },
        credentials: 'include',
      });

      if (postResponse.ok) {
        props.setName('');
        showMessage({
          content: 'Вы успешно вышли',
          type: 'success',
          duration: 1000,
        });
        setTimeout(() => window.location.reload(), 1000);
      } else {
        showMessage({
          content: 'Ошибка при выходе из системы',
          type: 'error',
          duration: 3000,
        });
      }
    } catch (error) {
      showMessage({
        content: 'Ошибка соединения с сервером',
        type: 'error',
        duration: 3000,
      });
    }
  };

  const menu =
    props.userData.username === '' ? (
      <ul className="navbar-nav">
        <li className="nav-item">
          <Link to="/login-hub" className="nav-link">
            Вход
          </Link>
        </li>
        <li className="nav-item">
          <Link to="/register-hub" className="nav-link">
            Регистрация
          </Link>
        </li>
      </ul>
    ) : (
      <ul className="navbar-nav">
        {props.userData.is_staff ? (
          <li className="nav-item">
            <Link to="/profile-teacher" className="nav-link">
              Профиль
            </Link>
          </li>
        ) : (
          <>
            <li className="nav-item">
              <Link to="/profile-student" className="nav-link">
                Профиль
              </Link>
            </li>
            <li className="nav-item">
              <Link to="/change-password" className="nav-link">
                Изменить пароль
              </Link>
            </li>
          </>
        )}
        <li className="nav-item">
          <Link to="/" className="nav-link" onClick={logout}>
            Выйти
          </Link>
        </li>
      </ul>
    );

  return (
    <nav className="navbar navbar-expand-lg navbar-light bg-light navbar-home">
      <div className="container-fluid">
        <Link to="/" className="nav-link home-link">
          Главная
        </Link>
        <div className="navbar-menu">{menu}</div>
      </div>
      {currentMessage && (
        <div className="nav-container">
          <MessageComponent />
        </div>
      )}
    </nav>
  );
};

export default Nav;