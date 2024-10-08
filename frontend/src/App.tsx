import React, { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

import RegisterStudents from './components/authorization/register/RegisterStudent';
import RegisterTeacher from './components/authorization/register/RegisterTeacher';
import RegisterHub from './components/authorization/register/RegisterHub';

import LoginStudent from './components/authorization/login/LoginStudent';
import LoginTeacher from './components/authorization/login/LoginTeacher';
import LoginHub from './components/authorization/login/LoginHub';

import AddTasks from './components/tasks/AddTasks'

import Nav from './components/navigation/Nav';

import { BASE_URL } from './constants';
import { UserData } from './types';

import './App.css';


const App = () => {
    const [name, setName] = useState('');
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
                <Nav userData={userData} setName={setName}/>
                <div className="content">
                    <main className="main-content">
                        <div className="form-login-and-register">
                            <Routes>
                                <Route path="/login-hub" element={<LoginHub />} />
                                <Route path="/login-student" element={<LoginStudent userData={userData} />} />
                                <Route path="/login-teacher" element={<LoginTeacher userData={userData} />} />

                                <Route path="/register-hub" element={<RegisterHub />} />
                                <Route path="/register-teacher" element={<RegisterTeacher userData={userData} />} />
                                <Route path="/register-student" element={<RegisterStudents userData={userData} />} />
                            </Routes>
                        </div>
                        <div className="form-tasks-and-answers">
                            <Routes>
                                <Route path="/add-tasks" element={<AddTasks userData={userData}/>} />
                            </Routes>
                        </div>
                    </main>
                </div>
            </BrowserRouter>
        </div>
    );
};

export default App;
