import React, { useEffect, useState } from 'react';

import { BASE_URL, CLASSES } from '../../constants';
import { UserData, Task, TaskList } from '../../types';
import getCookie from '../../functions';

import './CSS/add-task.css';


const AddTasks: React.FC<{ userData: UserData }> = ({ userData }) => {
  
  const [message, setMessage] = useState<React.ReactNode>(null);
  const csrftoken = getCookie('csrftoken');


  const emptyTask: Omit<Task, 'sequence_number'> = {
    answer_to_the_task: '',
    title: '',
    description: '',
    additional_condition: 'None',
    time_to_task: '',
  };

  const initialFormData: TaskList = {
    title: '',
    count_task: 1,
    task_for: '',
    tasks: [{ sequence_number: 1, ...emptyTask }],
  };

  const [formData, setFormData] = useState<TaskList>(initialFormData);

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

    const postResponse = await fetch(`${BASE_URL}/task_app/api/v1/api-task-list-create/`, {
      method: 'POST',
      headers: {
        'Access-Control-Request-Headers': 'Content-Type',
        'Content-Type': 'application/json',
        'X-CSRFToken': csrftoken,
      },
      credentials: 'include',
      body: JSON.stringify(formData),
    });

    if (postResponse.ok) {
      setMessage(
        <h2 className="success-message">Задача создана.</h2>
      );
    } else {
      setMessage(
        <h2 className="error-message">Произошла ошибка при создании задачи.</h2>
      );
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
                <input className="form-control" type="text" name="title" placeholder="Название теста" value={formData.title} onChange={handleChange} required />
              </div>
              <div className="form-group">
                <input className="form-control" type="number" name="count_task" placeholder="Кол-во задач" value={formData.count_task} onChange={handleChange} min={1} required />
              </div>
              <div className="form-group">
                <select className="form-control" id="task_for" name="task_for" value={formData.task_for} onChange={handleChange} required>
                  <option value="">Выберите класс</option>
                  {CLASSES.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </div>

              <button className="btn-primary" type="button" onClick={addTask}>
                Добавить задачу
              </button>
            </div>
          </div>

          {formData.tasks.map((task, index) => (
            <div key={index} className="form-group">
              <div className="form-container">
                <div className="form-group">
                  <input className="form-control" type="text" name="title" placeholder="Название задачи" value={task.title} onChange={(e) => handleTaskChange(index, e)} required />
                </div>

                <div className="form-group">
                  <textarea className="form-control" name="description" value={task.description} placeholder="Описание задачи" onChange={(e) => handleTaskChange(index, e)} required />
                </div>

                <div className="form-group">
                  <input className="form-control" type="text" name="answer_to_the_task" placeholder="Ответ на задачу" value={task.answer_to_the_task} onChange={(e) => handleTaskChange(index, e)} />
                </div>

                <div className="form-group">
                  <select className="form-control" id="additional_condition" name="additional_condition" value={task.additional_condition} onChange={(e) => handleTaskChange(index, e)} required>
                    <option value="None">Без доп. условий</option>
                    <option value="Photo">Сделать фото решения</option>
                  </select>
                </div>

                <div className='form-group-time'>
                  <div className='form-time-div'>Время на выполнение:</div>
                  <input className="form-control" type="time" name="time_to_task" value={task.time_to_task} onChange={(e) => handleTaskChange(index, e)} style={{ width: '31%' }} />
                </div>
              </div>
            </div>
          ))}

          <button className="btn-primary" type="submit">
            Создать тест
          </button>

        </form>) : (<h2 className="error-message">У вас нет на это прав.</h2>)}
    </nav>
  )
}

export default AddTasks;