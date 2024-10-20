import React, { useEffect, useState } from 'react';

import { BASE_URL, CLASSES } from '../../constants';
import { UserData } from '../../types';
import getCookie from '../../functions';

import './CSS/add-task.css';


const AddAnswers: React.FC<{ userData: UserData }> = ({ userData }) => {
    const [formData, setFormData] = useState();
    const csrftoken = getCookie('csrftoken');


    const addAnswers = async (e: React.FormEvent) => {
        e.preventDefault();1
    
        const postResponse = await fetch(`${BASE_URL}/task_app/api/v1/api-answer-list-create/`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': csrftoken,
          },
          credentials: 'include',
          body: JSON.stringify(formData),
        });
      };

    return (
        <div>

        </div>
    )
}

export default AddAnswers;