import React, { useEffect, useState } from 'react';

import { BASE_URL, CLASSES } from '../../constants';
import { UserData, Task, TaskListForAddTasks } from '../../types';
import { getCookie } from '../../functions';

import './CSS/add-task.css';


const AddTasks: React.FC<{ userData: UserData }> = ({ userData }) => {
  const [message, setMessage] = useState<React.ReactNode>(null);
  const csrftoken = getCookie('csrftoken');

  const emptyTask: Omit<Task, 'sequence_number'> = {
    additional_condition: 'None',
    answer_to_the_task: '',
    link_to_article: '',
    description: '',
    title: '',
    id: 0,
  };

  const initialFormData: TaskListForAddTasks = {
    tasks: [{ sequence_number: 1, ...emptyTask }],
    time_to_tasks: '',
    count_task: 1,
    task_for: '',
    title: ''
  };

  const [formData, setFormData] = useState<TaskListForAddTasks>(initialFormData);

  useEffect(() => {
    setFormData((prevFormData) => ({
      ...prevFormData,
      tasks: Array.from({ length: prevFormData.count_task }, (_, i) => ({
        sequence_number: i + 1,
        ...emptyTask,
      })),
    }));
  }, [formData.count_task]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prevFormData) => ({
      ...prevFormData,
      [name]: name === 'count_task' ? parseInt(value, 10) : value,
    }));
  };

  const handleTaskChange = (index: number, e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prevFormData) => {
      const updatedTasks = [...prevFormData.tasks];
      updatedTasks[index] = { ...updatedTasks[index], [name]: value };
      return { ...prevFormData, tasks: updatedTasks };
    });
  };

  const handleFileChange = (index: number, fileType: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setFormData((prevFormData) => {
      const updatedTasks = [...prevFormData.tasks];
      updatedTasks[index] = { ...updatedTasks[index], [fileType]: file };
      return { ...prevFormData, tasks: updatedTasks };
    });
  };

  const addTask = () => {
    setFormData((prevFormData) => {
      const newTask = { sequence_number: prevFormData.count_task + 1, ...emptyTask };
      return {
        ...prevFormData,
        count_task: prevFormData.count_task + 1,
        tasks: [...prevFormData.tasks, newTask],
      };
    });
  };

  const addTasks = async (e: React.FormEvent) => {
    e.preventDefault();

    const formToSend = new FormData();
    formToSend.append('title', formData.title);
    formToSend.append('task_for', formData.task_for);
    formToSend.append('count_task', formData.count_task.toString());
    formToSend.append('time_to_tasks', formData.time_to_tasks.toString());

    formData.tasks.forEach((task, index) => {
      Object.entries(task).forEach(([key, value]) => {
        const val: any = value;
        if (typeof val === 'string' || typeof val === 'number') {
          formToSend.append(`tasks[${index}][${key}]`, val.toString());
        } else if (val instanceof Blob || val instanceof File) {
          formToSend.append(`tasks[${index}][${key}]`, val);
        }
      });
    });

    try {
      const postResponse = await fetch(`${BASE_URL}/task_app/api/v1/api-task-list-create/`, {
        method: 'POST',
        headers: {
          'X-CSRFToken': csrftoken,
        },
        credentials: 'include',
        body: formToSend,
      });

      if (postResponse.ok) {
        setMessage(<h2 className="success-message">Задача создана.</h2>);
      } else {
        setMessage(<h2 className="error-message">Произошла ошибка при создании задачи.</h2>);
      }
    } catch (error) {
      setMessage(<h2 className="error-message">Произошла ошибка при отправке данных.</h2>);
    }

    setFormData(initialFormData);
  };

  return (
    <nav className="form-container">
      {message && message}
      {userData.is_staff ? (
        <form onSubmit={addTasks} >
          <div className="form-group">
            <div className="form-container">
              <div className="form-group">

                <div className="form-group">
                  <input className="form-control" style={{ width: '91.9%' }} type="text" name="title" placeholder="Название теста" value={formData.title} onChange={handleChange} required />
                </div>

                <div className="form-group">
                  <select className="form-control" style={{ marginBottom: '20px' }} id="task_for" name="task_for" value={formData.task_for} onChange={handleChange} required>
                    <option value="">Выберите класс</option>
                    {CLASSES.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </div>

                <div className='form-group-time'>
                  <div className='form-time-div'>Время на выполнение:</div>
                  <input className="form-control" type="time" name="time_to_tasks" value={formData.time_to_tasks} onChange={handleChange} style={{ width: '31%' }} />
                </div>
                <div className="form-group">
                  <input className="form-control" style={{ width: '91.9%' }} type="number" name="count_task" placeholder="Кол-во задач" value={formData.count_task} onChange={handleChange} min={1} required />
                </div>

              </div>

              <button className="btn-primary" type="button" onClick={addTask}>
                Добавить задачу
              </button>
            </div>
          </div>

          {formData.tasks.map((task, index) => (
            <div key={index}>
              <div className="form-container">
                <div className="form-group">

                  <div className="form-group">
                    <input className="form-control" type="text" name="title" placeholder="Название задачи" value={task.title}
                      onChange={(e) => handleTaskChange(index, e)} required />
                  </div>

                  <div className="form-group">
                    <textarea className="form-control" name="description" value={task.description} placeholder="Описание задачи"
                      onChange={(e) => handleTaskChange(index, e)} required />
                  </div>

                  <div className="form-group">
                    <input className="form-control" type="text" name="answer_to_the_task" placeholder="Ответ на задачу" value={task.answer_to_the_task}
                      onChange={(e) => handleTaskChange(index, e)} />
                  </div>
                  <div className="form-group">
                    <input className="form-control" type="url" name="link_to_article" placeholder="Ссылка на статью" value={task.link_to_article}
                      onChange={(e) => handleTaskChange(index, e)} />
                  </div>

                  <div className="form-group">
                    <select className="form-control" id="additional_condition" name="additional_condition" value={task.additional_condition}
                      onChange={(e) => handleTaskChange(index, e)} required>
                      <option value="None">Без доп. условий</option>
                      <option value="Photo">Сделать фото решения</option>
                    </select>
                  </div>
                  <h3 className="normal-message">Нежелательно отправлять более 1 файла.</h3>
                  <div className='form-group'>
                    <div className='form-file-div'>DOCX файл:</div>
                    <input className="form-control" type="file" name="docx_file" accept=".docx, application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                      onChange={(e) => handleFileChange(index, 'docx_file', e)} />
                  </div>
                  <div className='form-group'>
                    <div className='form-file-div'>Фото файл:</div>
                    <input className="form-control" type="file" name="photo_file" accept="image/png, image/jpeg"
                      onChange={(e) => handleFileChange(index, 'photo_file', e)} />
                  </div>
                  <div className='form-group'>
                    <div className='form-file-div'>Видео файл:</div>
                    <input className="form-control" type="file" name="video_file" accept="video/mp4, video/x-m4v, video/*"
                      onChange={(e) => handleFileChange(index, 'video_file', e)} />
                  </div>
                </div>
              </div>
            </div>
          ))}

          <button className="btn-primary" type="submit">
            Создать тест
          </button>

        </form>) : (<h2 className="error-message">У вас нет на это прав.</h2>)}
    </nav>

  );
};


export default AddTasks;