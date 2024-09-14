import React, { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

import RegisterStudent from './components/authorization/register/RegisterStudent';
import RegisterTeacher from './components/authorization/register/RegisterTeacher';

import LoginStudent from './components/authorization/login/LoginStudent';
import LoginTeacher from './components/authorization/login/LoginTeacher';

import { BASE_URL } from './constants';
import { UserData } from './types';

import './App.css';

const App = () => {
    const [userData, setUserData] = useState<UserData>({
        username: '',
        birth_date: '',
        bio: '',
        email: '',
        first_name: '',
        last_name: '',
        is_staff: false,
        id: 0,
    });

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const response = await fetch(`${BASE_URL}/user_app/api/v1/api-user-get/`, {
                    method: 'GET',
                    headers: { 'Content-Type': 'application/json' },
                    credentials: 'include',
                });

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                const data = await response.json();
                setUserData(data);
            } catch (error) {
                console.error('Error fetching user data:', error);
            }
        };

        fetchUserData();
    }, []);

    return (
        <div className="App">
            <BrowserRouter>
                <div className="content">
                    <main className="main-content">
                        <div className="form-signin">
                            <Routes>
                                <Route path="/login-student" element={<LoginStudent userData={userData} />} />
                                <Route path="/login-teacher" element={<LoginTeacher userData={userData} />} />
                            </Routes>
                        </div>
                    </main>
                </div>
            </BrowserRouter>
        </div>
    );
};

export default App;
