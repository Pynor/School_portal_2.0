import React from 'react';
import {Link} from "react-router-dom";

import { BASE_URL } from '../../constants';
import { UserData, Student } from '../../types';
import getCookie from '../../functions';


import './CSS/nav.css'


const Nav = (props: {userData: UserData, setName: (name: string) => void }) => {

    const csrftoken = getCookie('csrftoken');

    const logout = async () => {
        await fetch(`${BASE_URL}/user_app/api/v1/api-user-logout/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': csrftoken
            },
            credentials: 'include',
        });

        props.setName('');
    }

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
        <div className="container-fluid">
            <Link to="/profile" className="nav-link btn btn-primary">Профиль</Link>
            <Link to="/" className="nav-link btn btn-primary" onClick={logout}>Выйти</Link>
        </div>
      );
    
      return (
        <nav className="navbar navbar-expand-lg navbar-light bg-light navbar-home">
          <div className="container-fluid">
            <Link to="/" className="nav-link btn btn-primary">Главная</Link>

            <div className="navbar-menu">
              {menu}
            </div>
          </div>
        </nav>
      );
};

export default Nav;