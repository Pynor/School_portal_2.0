import { Navigate, useParams } from "react-router-dom";
import React, { useEffect, useState } from "react";

import { UserData, TaskList, AnswerList } from "../../types";
import { getCookie, setCookie } from '../../functions';
import { BASE_URL } from '../../constants';

import Modal from "./ModalWindows";

import './CSS/add-answer.css';
import '../../App.css';


const AddAnswers: React.FC<{ tasksListData: TaskList; userData: UserData }> = ({ tasksListData, userData }) => {
  // ### Assigning variables/Назначение переменных ###
  const [message, setMessage] = useState<React.ReactNode>(null);
  const { taskListId } = useParams<{ taskListId: string }>();
  const taskListIdNumber = parseInt(taskListId as string, 10);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [redirect, setRedirect] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const csrftoken = getCookie('csrftoken');

  // ### Check if tasksListData and task_list exist/Проверка существования tasksListData и task_list ###
  const taskList = tasksListData.task_list[taskListIdNumber];
  const isTaskListValid = taskList && taskList.tasks && taskList.tasks.length > 0;

  const [answers, setAnswers] = useState<AnswerList[]>([{
    user: userData.id,
    task_list: isTaskListValid ? taskList.id : 0,
    answers: isTaskListValid ? taskList.tasks.map(task => ({
      photo_to_the_answer: null,
      task: task.id,
      answer: '',
    })) : [],
  }]);


  // ### Working with time/Работа со временем ###
  const totalSeconds = isTaskListValid ? taskList.time_to_tasks.split(':')
    .reduce((acc, time) => acc * 60 + parseInt(time, 10), 0) : 0;

  const twentyPercentTime = Math.floor(totalSeconds * 0.2);
  const halfTime = Math.floor(totalSeconds / 2);

  const getTimeColor = () => {
    if (timeLeft <= twentyPercentTime) return 'red';
    if (timeLeft <= halfTime) return 'orange';
    return 'black';
  };

  useEffect(() => {
    const savedData = localStorage.getItem(`answers_${taskList.id}`);
    if (savedData) {
      const { user, task_list } = JSON.parse(savedData);
      setAnswers([{
        user: user,
        task_list: task_list,
        answers: isTaskListValid ? taskList.tasks.map(task => ({
          photo_to_the_answer: null,
          task: task.id,
          answer: '',
        })) : [],
      }]);
    } else {
      setAnswers([{
        user: userData.id,
        task_list: isTaskListValid ? taskList.id : 0,
        answers: isTaskListValid ? taskList.tasks.map(task => ({
          photo_to_the_answer: null,
          task: task.id,
          answer: '',
        })) : [],
      }]);
    }
  }, [taskList.id, userData.id, isTaskListValid, taskList]);

  useEffect(() => {
    const savedTime = localStorage.getItem(`timeLeft_${taskList.id}`);
    if (savedTime) {
      setTimeLeft(parseInt(savedTime, 10));
    } else {
      setTimeLeft(totalSeconds);
    }

    const interval = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 0) {
          clearInterval(interval);
          postResponse();
          return 0;
        }
        const newTime = prev - 1;

        localStorage.setItem(`timeLeft_${taskList.id}`, newTime.toString());
        return newTime;
      });
    }, 1000);

    return () => clearInterval(interval);
  });

  const formatTimeToHHMMSS = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    return [
      String(hours).padStart(2, '0'),
      String(minutes).padStart(2, '0'),
      String(secs).padStart(2, '0'),
    ].join(':');
  };



  // ### Processing of input data/Обработка вводных данных ###
  const handleChange = (taskId: number, field: 'answer' | 'photo_to_the_answer', e: React.ChangeEvent<HTMLInputElement>) => {
    const value = field === 'photo_to_the_answer' ? e.target.files?.[0] || null : e.target.value;

    setAnswers(prevAnswers => {
      const updatedAnswers = prevAnswers.map(answerObj => ({
        ...answerObj,
        answers: answerObj.answers.map(answer =>
          answer.task === taskId ? { ...answer, [field]: value } : answer
        ),
      }));

      const dataToSave = {
        user: updatedAnswers[0].user,
        task_list: updatedAnswers[0].task_list,
      };

      localStorage.setItem(`answers_${taskList.id}`, JSON.stringify(dataToSave));

      return updatedAnswers;
    });
  };




  // ### Generation data for POST request/Формирование данных для POST запроса ###
  const postResponse = async () => {
    const formData = new FormData();
    answers.forEach(({ user, task_list, answers }) => {
      formData.append('user', user.toString());
      formData.append('task_list', task_list?.toString() || '');
      formData.append('execution_time_answer', formatTimeToHHMMSS(totalSeconds - timeLeft));
      answers.forEach((answer, index) => {
        formData.append(`answers[${index}][answer]`, answer.answer);
        formData.append(`answers[${index}][task]`, answer.task.toString());
        if (answer.photo_to_the_answer) {
          formData.append(`answers[${index}][photo_to_the_answer]`, answer.photo_to_the_answer);
        }
      });
    });


    // Send request/Отправка запроса:
    const postResponse = await fetch(`${BASE_URL}/task_app/v1/api-answer-list-create/`, {
      headers: { 'X-CSRFToken': csrftoken },
      credentials: 'include',
      method: 'POST',
      body: formData,
    });

    // Response processing/Обработка ответа:
    if (postResponse.ok) {
      setCookie(`completedTask(${taskList.id})`, 'true', 0, 'Strict', true);
      setMessage(<h2 className="success-message">Ответ получен.</h2>);

      localStorage.removeItem(`timeLeft_${taskList.id}`);
      localStorage.removeItem(`answers_${taskList.id}`);

      setTimeout(() => setRedirect(true), 1000);

    } else {
      const responseData = await postResponse.json();
      setMessage(<h2 className="error-message">{responseData.details || 'Произошла ошибка при получении ответа.'}</h2>);
    }
  };


  // Processing Submit/Обработка Submit:
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    postResponse();
  };


  // ### Rendering HTMLElement/Отрисовка HTMLElement ###
  if (redirect) return <Navigate to="/profile-student" />;

  return (
    <div className="form-tasks-and-answers">
      <nav className="form-container">
        <form onSubmit={handleSubmit}>
          <h2 style={{ textAlign: 'center', color: getTimeColor() }}>
            Оставшееся время: {new Date(timeLeft * 1000).toISOString().substr(11, 8)}
          </h2>

          {message && <>{message}</>}

          {isTaskListValid && taskList.tasks.map(task => (
            <div key={task.id} className="form-container no-select">

              <h2 className="title">{`Задача ${task.sequence_number} (${task.title}):`}</h2>
              <div className="description">
                {task.description.split(' ').map((word, index) => (
                  <span key={index} style={{ wordBreak: 'break-all' }}>{word} </span>
                ))}
              </div>

              {task.photo_file && (
                <div>
                  <h4>Изображение к заданию:</h4>
                  <img
                    alt="Загруженное"
                    onClick={() => setIsModalOpen(true)}
                    src={`${BASE_URL}${task.photo_file}`}
                    style={{ width: '100%', height: 'auto', objectFit: 'cover' }} 
                  />
                </div>
              )}

              {task.video_file && (
                <div>
                  <h4>Видео к заданию:</h4>
                  <video
                    controls
                    playsInline
                    onError={(e) => console.error('Error loading video:', e)}
                    style={{ width: '100%', height: 'auto', objectFit: 'cover', margin: '10px 0' }} 
                  >
                    <source src={`${BASE_URL}${task.video_file}`} type={task.video_file.type} />
                    Ваш браузер не поддерживает видео.
                  </video>
                </div>
              )}

              {task.link_to_article && (
                <a href={task.link_to_article} target="_blank" rel="noopener noreferrer" className="hub-link">
                  Ссылка на статью к задаче
                </a>
              )}

              {task.docx_file && (
                <a href={`${BASE_URL}${task.docx_file}`} download={task.docx_file.name} className="hub-link">
                  Скачать файл к задаче
                </a>
              )}

              <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                imageSrc={`${BASE_URL}${task.photo_file}`}
              />

              <input
                type="text"
                placeholder="Ответ:"
                className="form-control"
                style={{ marginTop: '25px' }}
                onChange={(e) => handleChange(task.id, 'answer', e)}
              />
              {task.additional_condition === 'Photo' && (
                <input
                  type="file"
                  className="form-control"
                  style={{ marginTop: '5px' }}
                  accept="image/png, image/jpeg"
                  onChange={(e) => handleChange(task.id, 'photo_to_the_answer', e)}
                />
              )}
            </div>
          ))}

          <button className="btn-primary" type="submit">
            Прислать ответ
          </button>
        </form>
      </nav>
    </div>
  );

};

export default AddAnswers;