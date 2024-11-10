import { Navigate, useParams } from "react-router-dom";
import React, { useState } from "react";

import { UserData, TaskList, AnswerList } from "../../types";
import { getCookie, setCookie } from '../../functions';
import { BASE_URL } from '../../constants';

import './CSS/add-answer.css';


const AddAnswers: React.FC<{ tasksListData: TaskList, userData: UserData }> = ({ tasksListData, userData }) => {
  
  const [message, setMessage] = useState<React.ReactNode>(null);
  const taskListId = useParams<{ taskListId: string }>().taskListId as string;
  const taskListIdNumber = parseInt(taskListId, 10) as number;
  const [answers, setAnswers] = useState<AnswerList[]>([
    {
      user: userData.id,
      task_list: tasksListData.task_list[taskListIdNumber].id,
      answers: tasksListData.task_list[taskListIdNumber].tasks.map((task) => ({
        photo_to_the_answer: null,
        task: task.id,
        answer: '',
      })),
    },
  ]);

  const [redirect, setRedirect] = useState(false);
  const csrftoken = getCookie('csrftoken');

  const handleAnswerChange = (taskId: number, e: React.ChangeEvent<HTMLInputElement>) => {
    setAnswers(
      answers.map((answerObj) => ({
        ...answerObj,
        answers: answerObj.answers.map((answer) =>
          answer.task === taskId ? { ...answer, answer: e.target.value } : answer
        ),
      }))
    );
  };

  const handlePhotoChange = (taskId: number, e: React.ChangeEvent<HTMLInputElement>) => {
    setAnswers(
      answers.map((answerObj) => ({
        ...answerObj,
        answers: answerObj.answers.map((answer) =>
          answer.task === taskId ? { ...answer, photo_to_the_answer: e.target.files?.[0] || null } : answer
        ),
      }))
    );
  };

  const formDataToSend = new FormData();

  answers.forEach((answerObj) => {
    formDataToSend.append('user', answerObj.user.toString());

    answerObj.answers.forEach((answer) => {
      formDataToSend.append(`answers[${answer.task}][answer]`, answer.answer);
      if (answer.photo_to_the_answer) {
        formDataToSend.append(
          `answers[${answer.task}].photo_to_the_answer`,
          answer.photo_to_the_answer
        );
      }
    });
  });
  const prepareData = () => {
    return {
      user: answers[0].user,
      task_list: tasksListData.task_list[taskListIdNumber].id,
      answers: answers[0].answers.map((answer) => ({
        task: answer.task,
        answer: answer.answer,
        photo_to_the_answer: answer.photo_to_the_answer ? answer.photo_to_the_answer.name : null,
      })),
    };
  };

  const postResponse = async () => {
    const data = prepareData();
    const response = await fetch(`${BASE_URL}/task_app/api/v1/api-answer-list-create/`, {
      method: 'POST',
      headers: {
        'X-CSRFToken': csrftoken,
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(data),
    });

    if (response.ok) {
      setMessage(<h2 className="success-message">Ответ получен.</h2>);
      setCookie(`completedTask(${taskListId})`, `${taskListId}`)
      setTimeout(() => { setRedirect(true) }, 1000);


    } else {
      setMessage(<h2 className="error-message">Произошла ошибка при получении ответа.</h2>);
    }
  };

  if (redirect) {
    return <Navigate to="/profile" />;
}

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    postResponse();
  };

  return (
    <nav className="form-container">
      <form onSubmit={handleSubmit}>
        {message && <p>{message}</p>}
        {tasksListData.task_list[taskListIdNumber].tasks.map((task) => (
          <div key={task.id}>
            <div className="form-container">
              <h2>{`Задача ${task.sequence_number} (${task.title}):`}</h2>
              <h3>{task.description}</h3>
                <input
                  type="text"
                  placeholder="Ответ:"
                  className="form-control"
                  key={`answer-${task.id}`}
                  name={`answer-${task.id}`}
                  onChange={(e) => handleAnswerChange(task.id, e)}
                />
              {task.additional_condition === 'Photo' && (
                  <input
                    type="file"
                    className="form-control"
                    key={`photo-${task.id}`}
                    name={`photo-${task.id}`}
                    accept="image/png, image/jpeg"
                    onChange={(e) => handlePhotoChange(task.id, e)}
                  />
              )}
            </div>
          </div>
        ))}
        <button className="btn-primary" type="submit">
          Прислать ответ
        </button>
      </form>
    </nav>
  );
};

export default AddAnswers;