import React, { useState, useEffect } from "react";

import { BASE_URL } from '../../constants';
import getCookie from '../../functions';
import { Answer, UserData, TaskListForAnswers, AnswerList } from "../../types";

import './CSS/add-answer.css';


const AddAnswers: React.FC<{ tasksListData: TaskListForAnswers, userData: UserData }> = ({ tasksListData, userData }) => {

  const [message, setMessage] = useState<React.ReactNode>(null);
  const [answers, setAnswers] = useState<AnswerList[]>([
    {
      user: userData.id,
      answers: tasksListData.task_list.tasks.map((task) => ({
        photo_to_the_answer: null,
        task: task.id,
        answer: '',
      })),
    },
  ]);

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
    } else {
      setMessage(<h2 className="error-message">Произошла ошибка при получении ответа.</h2>);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    postResponse();
  };

  return (
    <nav className="form-container">
      <form onSubmit={handleSubmit}>
        {message && <p>{message}</p>}
        {tasksListData.task_list.tasks.map((task, index) => (
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