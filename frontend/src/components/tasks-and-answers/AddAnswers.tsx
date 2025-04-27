import { Navigate, useParams } from "react-router-dom";
import React, { useEffect, useRef, useState } from "react";

import { UserData, TaskList, AnswerList } from "../../types";
import { useMessageHandler, getCookie, setCookie } from '../../functions';
import { MEDIA_URL, BASE_URL } from '../../constants';

import Modal from "./ModalWindows";

import './CSS/add-answer.css';
import '../../App.css';


const AddAnswers: React.FC<{ tasksListData: TaskList; userData: UserData }> = ({ tasksListData, userData }) => {
  // ### Assigning variables/Назначение переменных ###
  const { showMessage, MessageComponent, clearMessage } = useMessageHandler();
  const { taskListId } = useParams<{ taskListId: string }>();
  const taskListIdNumber = parseInt(taskListId as string, 10);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const messageRef = useRef<HTMLDivElement | null>(null);
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
    if (timeLeft <= twentyPercentTime) return '#ff4444';
    if (timeLeft <= halfTime) return '#ff9800';
    return '#4CAF50';
  };

  const getTimeEmoji = () => {
    if (timeLeft <= twentyPercentTime) return '⏰';
    if (timeLeft <= halfTime) return '🕒';
    return '⏳';
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
  }, [taskList.id, totalSeconds]);


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


  const postResponse = async () => {
    setIsSubmitting(true);
    try {
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

      const postResponse = await fetch(`${BASE_URL}/task_app/v1/api-answer-list-create/`, {
        headers: { 'X-CSRFToken': csrftoken },
        credentials: 'include',
        method: 'POST',
        body: formData,
      });

      if (postResponse.ok) {
        setCookie(`completedTask(${taskList.id})`, 'true', 0, 'Strict', true);
        showMessage({
          content: 'Ответ успешно отправлен!',
          type: 'success',
          duration: 3000
        });

        localStorage.removeItem(`timeLeft_${taskList.id}`);
        localStorage.removeItem(`answers_${taskList.id}`);

        setTimeout(() => setRedirect(true), 3000);
      } else {
        const responseData = await postResponse.json();
        showMessage({
          content: responseData.details || 'Произошла ошибка при отправке ответа',
          type: 'error',
          duration: 5000
        });
      }
    } catch (error) {
      showMessage({
        content: 'Ошибка сети при отправке ответа',
        type: 'error',
        duration: 5000
      });
    } finally {
      setIsSubmitting(false);
    }
  }


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    clearMessage();
    await postResponse();
  };


  // ### Rendering HTMLElement/Отрисовка HTMLElement ###
  if (redirect) return <Navigate to="/profile-student" />;

  return (
    <div className="add-answers-page">
      <div className="add-answers-container">
        <div className="time-counter" style={{ color: getTimeColor() }}>
          {getTimeEmoji()} Оставшееся время: {formatTimeToHHMMSS(timeLeft)}
        </div>

        <div
          className="message-container"
          ref={messageRef}
          style={{
            display: 'flex',
            justifyContent: 'center',
            width: '100%'
          }}
        >
          <MessageComponent />
        </div>

        <form onSubmit={handleSubmit} style={{ width: '100%' }} className="answers-form">
          {isTaskListValid && taskList.tasks.map(task => (
            <div key={task.id} className="task-card">
              <div className="task-header">
                <h2 className="task-title">{`Задача ${task.sequence_number}: ${task.title}`}</h2>
              </div>

              <div className="task-content">
                <div className="task-description">
                  {task.description}
                </div>

                {task.photo_file && (
                  <div className="task-media">
                    <h4>Изображение к заданию:</h4>
                    <img
                      alt="Загруженное"
                      onClick={() => setIsModalOpen(true)}
                      src={`${MEDIA_URL}${task.photo_file}`}
                      className="task-image"
                    />
                  </div>
                )}

                {task.video_file && (
                  <div className="task-media">
                    <h4>Видео к заданию:</h4>
                    <video
                      controls
                      playsInline
                      onError={(e) => console.error('Error loading video:', e)}
                      className="task-video"
                    >
                      <source src={`${MEDIA_URL}${task.video_file}`} type={task.video_file.type} />
                      Ваш браузер не поддерживает видео.
                    </video>
                  </div>
                )}

                {task.link_to_article && (
                  <a href={task.link_to_article} target="_blank" rel="noopener noreferrer" className="resource-link">
                    📖 Ссылка на статью к задаче
                  </a>
                )}

                {task.docx_file && (
                  <a href={`${MEDIA_URL}${task.docx_file}`} download={task.docx_file.name} className="resource-link">
                    📄 Скачать файл к задаче
                  </a>
                )}

                <Modal
                  isOpen={isModalOpen}
                  onClose={() => setIsModalOpen(false)}
                  imageSrc={`${MEDIA_URL}${task.photo_file}`}
                />

                <div className="answer-input-group">
                  <label htmlFor={`answer-${task.id}`}>Ваш ответ:</label>
                  <input
                    id={`answer-${task.id}`}
                    type="text"
                    placeholder="Введите ваш ответ..."
                    className="answer-input"
                    onChange={(e) => handleChange(task.id, 'answer', e)}
                  />
                </div>

                {task.additional_condition === 'Photo' && (
                  <div className="file-upload-group">
                    <label htmlFor={`photo-${task.id}`} className="file-upload-label">
                      📷 Загрузить фото ответа
                    </label>
                    <input
                      id={`photo-${task.id}`}
                      type="file"
                      className="file-input"
                      accept="image/png, image/jpeg"
                      onChange={(e) => handleChange(task.id, 'photo_to_the_answer', e)}
                    />
                  </div>
                )}
              </div>
            </div>
          ))}

          <button
            className="submit-button"
            type="submit"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Отправка...' : 'Отправить ответы'}
          </button>
        </form>
      </div>
    </div>
  );
};


export default AddAnswers;