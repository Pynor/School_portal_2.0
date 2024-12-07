import { Navigate, useParams } from "react-router-dom";
import React, { useEffect, useState } from "react";

import { UserData, TaskList, AnswerList } from "../../types";
import { getCookie, setCookie } from '../../functions';
import { BASE_URL } from '../../constants';

import './CSS/add-answer.css';



const AddAnswers: React.FC<{ tasksListData: TaskList, userData: UserData }> = ({ tasksListData, userData }) => {
  const taskListId = useParams<{ taskListId: string }>().taskListId as string;
  const [message, setMessage] = useState<React.ReactNode>(null);
  const taskListIdNumber = parseInt(taskListId, 10);
  const [redirect, setRedirect] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const csrftoken = getCookie('csrftoken');

  const timeParts = tasksListData.task_list[taskListIdNumber].time_to_tasks.split(':');
  const totalSeconds = parseInt(timeParts[0]) * 3600 + parseInt(timeParts[1]) * 60 + parseInt(timeParts[2]);

  const twentyPercentTime = Math.floor((totalSeconds * 20) / 100);
  const halfTime = Math.floor(totalSeconds / 2);

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

  useEffect(() => {
    setTimeLeft(totalSeconds);

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 0) {
          clearInterval(interval);
          postResponse();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);    

    return () => clearInterval(interval);
  }, [tasksListData, taskListIdNumber]);


  const getTimeColor = () => {
    if (timeLeft <= twentyPercentTime) {
      return 'red'; 
    } else if (timeLeft <= halfTime) {
      return 'orange'; 
    } else {
      return 'black';
    }
  };

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

  const postResponse = async () => {
    const formData = new FormData();

    answers.forEach((answerObj) => {
      formData.append('user', answerObj.user.toString());
      formData.append('task_list', answerObj.task_list.toString());
      answerObj.answers.forEach((answer, index) => {
        formData.append(`answers[${index}][answer]`, answer.answer);
        formData.append(`answers[${index}][task]`, answer.task.toString());
        if (answer.photo_to_the_answer) {
          formData.append(`answers[${index}][photo_to_the_answer]`, answer.photo_to_the_answer);
        }
      });
    });

    const response = await fetch(`${BASE_URL}/task_app/api/v1/api-answer-list-create/`, {
      method: 'POST',
      headers: {
        'X-CSRFToken': csrftoken
      },
      credentials: 'include',
      body: formData
    });

    if (response.ok) {
      setMessage(<h2 className="success-message">Ответ получен.</h2>);
      setCookie(`completedTask(${taskListId})`, `${taskListId}`);
      setTimeout(() => { setRedirect(true); }, 1000);
    } else {
      const responseData = await response.json();
      if (responseData.details) {
        setMessage(<h2 className="error-message">{responseData.details}</h2>);
      } else {
        setMessage(<h2 className="error-message">Произошла ошибка при получении ответа.</h2>);
      }
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
      <h2 style={{ textAlign: 'center', color: getTimeColor() }}>
          Оставшееся время: {Math.floor(timeLeft / 3600)}:{Math.floor((timeLeft % 3600) / 60).toString().padStart(2, '0')}:{(timeLeft % 60).toString().padStart(2, '0')}
        </h2>

        {message && <p>{message}</p>}
        {tasksListData.task_list[taskListIdNumber].tasks.map((task) => (
          <div key={task.id}>
            <div className="form-container">
              <div className="form-container">
                <h2>{`Задача ${task.sequence_number} (${task.title}):`}</h2>
                {task.link_to_article && (
                  <a
                    href={task.link_to_article} target="_blank"
                    rel="noopener noreferrer" className="hub-link">
                    Ссылка на статью к задаче
                  </a>
                )}
                <h3 className="no-select">{task.description}</h3>
              </div>
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