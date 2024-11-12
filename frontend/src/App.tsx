import React, { useEffect, useRef, useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

import RegisterStudents from './components/authorization/register/RegisterStudent';
import RegisterTeacher from './components/authorization/register/RegisterTeacher';
import RegisterHub from './components/authorization/register/RegisterHub';

import LoginStudent from './components/authorization/login/LoginStudent';
import LoginTeacher from './components/authorization/login/LoginTeacher';
import LoginHub from './components/authorization/login/LoginHub';

import CheckAnswersHub from './components/tasks-and-answers/CheckAnswersHub';
import CheckAnswers from './components/tasks-and-answers/CheckAnswers';
import AddAnswers from './components/tasks-and-answers/AddAnswers';
import AddTasks from './components/tasks-and-answers/AddTasks';

import ProfileTeacher from './components/profile/ProfileTeacher';
import ProfileStudent from './components/profile/ProfileStudent';

import Nav from './components/navigation/Nav';


import { BASE_URL } from './constants';
import useDefaultState from './types';

import './App.css';


const App = () => {
    const { defaultTasksListData, defaultUserData } = useDefaultState();

    const [tasksListData, setTasksListData] = useState(defaultTasksListData);
    const [userData, setUserData] = useState(defaultUserData);
    const hasFetchedRef = useRef(false);

    const [, setName] = useState('');

    useEffect(() => {
        const fetchData = async () => {

            if (hasFetchedRef.current) return;
            hasFetchedRef.current = true;

            try {
                console.log("Запрос пользователя начат");
                const userGetResponse = await fetch(`${BASE_URL}/user_app/api/v1/api-user-get/`, {
                    headers: {
                        'Access-Control-Request-Headers': 'Content-Type',
                        'Content-Type': 'application/json',
                    },
                    credentials: 'include',
                    method: 'GET',
                });

                if (!userGetResponse.ok) {
                    throw new Error(`HTTP error! status: ${userGetResponse.status}`);
                }

                const userData = await userGetResponse.json();
                setUserData(userData);

                if (!userData.is_staff && userData.student) {
                    const tasksGetResponse = await fetch(`${BASE_URL}/task_app/api/v1/api-task-list-get/${userData.student.school_class}`, {
                        headers: {
                            'Access-Control-Request-Headers': 'Content-Type',
                            'Content-Type': 'application/json',
                        },
                        credentials: 'include',
                        method: 'GET',
                    });

                    if (!tasksGetResponse.ok) {
                        throw new Error(`HTTP error! status: ${tasksGetResponse.status}`);
                    }

                    const tasksListData = await tasksGetResponse.json();
                    setTasksListData(tasksListData);
                }
            } catch (error) {
                console.error("Ошибка при получении данных:", error);
            }
        };

        fetchData();
    }, []);



    return (
        <div className="App">
            <BrowserRouter>
                <Nav userData={userData} setName={setName} />
                <div className="content">
                    <main className="main-content">
                        <div className="form-tasks-and-answers">
                            <Routes>
                                <Route path="/add-answers/:taskListId" element={<AddAnswers tasksListData={tasksListData} userData={userData} />} />
                                <Route path="/add-tasks" element={<AddTasks userData={userData} />} />

                                <Route path="/check-answers/:schoolClass/:taskListId" element={<CheckAnswers userData={userData} />} />
                                <Route path="/check-answers-hub" element={<CheckAnswersHub userData={userData} />} />
                            </Routes>
                        </div>

                        <div className="form-login-and-register">
                            <Routes>
                                <Route path="/register-students" element={<RegisterStudents userData={userData} />} />
                                <Route path="/register-teacher" element={<RegisterTeacher />} />
                                <Route path="/register-hub" element={<RegisterHub />} />

                                <Route path="/login-student" element={<LoginStudent />} />
                                <Route path="/login-teacher" element={<LoginTeacher />} />
                                <Route path="/login-hub" element={<LoginHub />} />
                            </Routes>
                        </div>

                        <div className="profile">
                            <Routes>
                                <Route path="/profile-student" element={<ProfileStudent tasksListData={tasksListData} />} />
                                <Route path="/profile-teacher" element={<ProfileTeacher userData={userData} />} />
                            </Routes>
                        </div>
                    </main>
                </div>
            </BrowserRouter>
        </div>
    );
};

export default App;
