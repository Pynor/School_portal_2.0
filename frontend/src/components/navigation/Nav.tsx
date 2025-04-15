import React from 'react';
import { Link } from "react-router-dom";

import { useMessageHandler, getCookie } from '../../functions';
import { BASE_URL } from '../../constants';
import { UserData } from '../../types';

import './CSS/nav.css'


const Nav = (props: { userData: UserData, setName: (name: string) => void }) => {
  // ### Assigning variables/Назначение переменных ###
  const { showMessage, MessageComponent, clearMessage, currentMessage } = useMessageHandler();

  const csrftoken = getCookie('csrftoken');


  // ### Working with server/Работа с сервером ###
  const logout = async () => {
    clearMessage()
    try {
      // Send request/Отправка запроса:
      const postResponse = await fetch(`${BASE_URL}/user_app/v1/api-user-logout/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRFToken': csrftoken
        },
        credentials: 'include',
      });

      // Response processing/Обработка ответа:
      if (postResponse.ok) {
        props.setName('');
        showMessage({
          content: 'Вы успешно вышли',
          type: 'success',
          duration: 1000
        });
        setTimeout(() => window.location.reload(), 1000);
      } else {
        showMessage({
          content: 'Ошибка при выходе из системы',
          type: 'error',
          duration: 3000
        });
      }
    } catch (error) {
      showMessage({
        content: 'Ошибка соединения с сервером',
        type: 'error',
        duration: 3000
      });
    }
  };


  // ### Preparing data for rendering Menu/Подготовка данных для отрисовки Menu ###
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
      {props.userData.is_staff ? (
        <li className="nav-item">
          <Link to="/profile-teacher" className="nav-link btn btn-primary">Профиль</Link>
        </li>
      ) : (
        <li className="nav-item">
          <Link to="/profile-student" className="nav-link btn btn-primary">Профиль</Link>
        </li>
      )
      }
      <li className="nav-item">
        <Link to="/" className="nav-link btn btn-primary" onClick={logout}>Выйти</Link>
      </li>
    </ul>
  );

  // ### Rendering HTMLElement/Отрисовка HTMLElement ###
  return (
    <nav className="navbar navbar-expand-lg navbar-light bg-light navbar-home">
      <div className="container-fluid">

        <Link to="/" className="nav-link btn btn-primary">Главная</Link>

        {/* Displaying Menu/Отображение Menu */}
        <div className="navbar-menu">
          {menu}
        </div>

      </div>

      {/* Displaying message/Отображение сообщения */}
      {currentMessage && (
        <div className="nav-container">
          <div className="form-container">
            <MessageComponent />
          </div>
        </div>
      )}

    </nav>
  );
};

export default Nav;