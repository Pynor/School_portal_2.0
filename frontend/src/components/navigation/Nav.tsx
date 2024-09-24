import React from 'react';
import {Link} from "react-router-dom";

import { BASE_URL } from '../../constants';
import { UserData, Student } from '../../types';
import getCookie from '../../functions';

import './CSS/nav.css'


const Nav = (props: {userData: UserData, setName: (name: string) => void }) => {

    const csrftoken = getCookie('csrftoken');

    const logout = async () => {
        await fetch(`${BASE_URL}/user_app/api/v1/api-logout/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': csrftoken
            },
            credentials: 'include',
        });

        props.setName('');
    }
    console.log(props.userData)
    let menu;
    if (props.userData.username === "") {
        menu = (
            <ul className="navbar-nav">
                <li className="nav-item active">
                    <Link to="/login-hub" className="nav-link">Login</Link>
                </li>
                <li className="nav-item active">
                    <Link to="/register-hub" className="nav-link">Register</Link>
                </li>
            </ul>
        )
    } else {
        menu = (
            <ul className="navbar-nav">
                <li className="nav-item active">
                    <Link to="/profile" className="nav-link">{props.userData.username}</Link>
                </li>
                <li className="nav-item active">
                    <Link to="/" className="nav-link" onClick={logout}>Logout</Link>
                </li>
            </ul>
        )
    }

    return (
        <nav className="navbar-home">
            <div className="container-fluid">
                <Link to="/" className="nav-link">Home</Link>

                <div>
                    {menu}
                </div>
            </div>
        </nav>
    );
};

export default Nav;