import React from 'react';
import {Link} from "react-router-dom";

import { BASE_URL } from '../../constants';
import { UserData, Student } from '../../types';
import getCookie from '../../functions';


import './CSS/add-task.css'


const AddTasks = (props: { userData: UserData }) => {

    const csrftoken = getCookie('csrftoken');

    const addTasks = async () => {
        await fetch(`${BASE_URL}/task_app/api/v1/api-task-list-create/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': csrftoken
            },
            credentials: 'include',
        });
    }

    
      return (
        <nav className="">
          <div className="">
            
          </div>
        </nav>
      );
};

export default AddTasks;