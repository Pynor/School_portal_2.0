import React, { useEffect, useState, useRef } from 'react';
import { TaskListForAddTasks, UserData, Task } from '../../types';
import { useMessageHandler, getCookie } from '../../functions';
import { BASE_URL, SUBJECTS, CLASSES } from '../../constants';
import './CSS/add-task.css';
import '../../App.css';

const AddTasks: React.FC<{ userData: UserData }> = ({ userData }) => {
  // ### Assigning variables/Назначение переменных ###
  const { showMessage, MessageComponent, clearMessage } = useMessageHandler();
  const messageRef = useRef<HTMLDivElement | null>(null);
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
    subject_id: '',
    count_task: 1,
    task_for: '',
    title: ''
  };

  const [formData, setFormData] = useState<TaskListForAddTasks>(initialFormData);
  const [activeTab, setActiveTab] = useState<number>(0);

  // ### Processing of input data/Обработка вводных данных ###

  // Processing changes in the number of tasks/Обработка изменения количества задач:
  useEffect(() => {
    setFormData((prevFormData) => ({
      ...prevFormData,
      tasks: Array.from({ length: prevFormData.count_task }, (_, i) => ({
        sequence_number: i + 1,
        ...emptyTask,
      })),
    }));
  }, [formData.count_task]);

  // Processing changes in form fields/Обработка изменений в полях формы:
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prevFormData) => ({
      ...prevFormData,
      [name]: name === 'count_task' ? parseInt(value, 10) : value,
    }));
  };

  // Processing changes in tasks/Обработка изменений в задачах:
  const handleTaskChange = (index: number, e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;

    if (name === 'title' && value.length > 30) {
      showMessage({
        content: 'Название задачи не должно превышать 30 символов.',
        type: 'error',
        duration: 4000
      });
      return;
    }
    setFormData((prevFormData) => {
      const updatedTasks = [...prevFormData.tasks];
      updatedTasks[index] = { ...updatedTasks[index], [name]: value };
      return { ...prevFormData, tasks: updatedTasks };
    });
  };

  // Processing file downloads for tasks/Обработка загрузки файлов для задач:
  const handleFileChange = (index: number, fileType: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setFormData((prevFormData) => {
      const updatedTasks = [...prevFormData.tasks];
      updatedTasks[index] = { ...updatedTasks[index], [fileType]: file };
      return { ...prevFormData, tasks: updatedTasks };
    });
  };

  const validateTimeFormat = (time: string) => {
    return /^([0-5]?\d):([0-5]?\d)$/.test(time);
  };

  // Adding a new task to the task array/Добавление новой задачи в массив задач:
  const addTask = () => {
    setFormData((prevFormData) => {
      const newTask = { sequence_number: prevFormData.count_task + 1, ...emptyTask };
      return {
        ...prevFormData,
        count_task: prevFormData.count_task + 1,
        tasks: [...prevFormData.tasks, newTask],
      };
    });
    setActiveTab(formData.count_task);
  };


  // ### Generation data for POST request/Формирование данных для POST запроса ###
  const addTasks = async (e: React.FormEvent) => {
    e.preventDefault();
    clearMessage();

    if (!validateTimeFormat(formData.time_to_tasks)) {
      showMessage({
        content: 'Введите время в формате ММ:СС (например, 30:00)',
        type: 'error',
        duration: 4000
      });
      if (messageRef.current) {
        messageRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
      return;
    }

    if (!formData.subject_id || !formData.task_for) {
      showMessage({
        content: 'Пожалуйста, выберите класс и предмет',
        type: 'error',
        duration: 4000
      });
      if (messageRef.current) {
        messageRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
      return;
    }

    // Data collection/Сборка данных
    const formToSend = new FormData();
    formToSend.append('title', formData.title);
    formToSend.append('task_for', formData.task_for);
    formToSend.append('subject', formData.subject_id);
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


    // ### Working with server/Работа с сервером ###
    try {
      // Send request/Отправка запроса:
      const postResponse = await fetch(`${BASE_URL}/task_app/v1/api-task-list-create/`, {
        method: 'POST',
        headers: {
          'X-CSRFToken': csrftoken,
        },
        credentials: 'include',
        body: formToSend,
      });

      // Response processing/Обработка ответа:
      if (postResponse.ok) {
        showMessage({
          content: 'Задача создана.',
          type: 'success',
          duration: 4000
        });
        setFormData(initialFormData);

        if (messageRef.current) {
          messageRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
      } else {
        const errorData = await postResponse.json();
        const errorMessage = errorData.title ? errorData.title.join(', ') : 'Неизвестная ошибка';
        showMessage({
          content: `Произошла ошибка при создании задачи: ${errorMessage}`,
          type: 'error',
          duration: 4000
        });

        if (messageRef.current) {
          messageRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
      }
    } catch (error) {
      showMessage({
        content: 'Произошла ошибка при отправке данных.',
        type: 'error',
        duration: 4000
      });

      if (messageRef.current) {
        messageRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    }
  };


  // ### Rendering HTMLElement/Отрисовка HTMLElement ###
  return (
    <div className="form-container-wrapper">
      {userData.is_staff ? ( // Checking rights/Проверка прав.
        <form onSubmit={addTasks} className="task-creation-form">
          <div ref={messageRef}>
            <MessageComponent />
          </div>
          <div className="form-general-section">
            <h2 className="form-section-title">Основные параметры теста</h2>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Название теста</label>
                <input
                  className="form-input"
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="Введите название теста"
                  required
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Класс</label>
                <select
                  className="form-select"
                  name="task_for"
                  value={formData.task_for}
                  onChange={handleChange}
                  required
                >
                  <option value="">Выберите класс</option>
                  {CLASSES.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Предмет</label>
                <select
                  className="form-select"
                  name="subject_id"
                  value={formData.subject_id}
                  onChange={handleChange}
                  required
                >
                  <option value="">Выберите предмет</option>
                  {SUBJECTS.map((subject) => (
                    <option key={subject.id} value={subject.id}>
                      {subject.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Количество задач</label>
                <input
                  className="form-input"
                  type="number"
                  name="count_task"
                  value={formData.count_task}
                  onChange={handleChange}
                  min={1}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Время на выполнение (ММ:СС)</label>
                <input
                  className="form-input"
                  type="text"
                  name="time_to_tasks"
                  value={formData.time_to_tasks}
                  onChange={handleChange}
                  placeholder="30:00"
                  required
                />
              </div>
            </div>
          </div>

          <div className="tasks-tabs">
            {formData.tasks.map((_, index) => (
              <button
                key={index}
                type="button"
                className={`tab-button ${activeTab === index ? 'active' : ''}`}
                onClick={() => setActiveTab(index)}
              >
                Задача {index + 1}
              </button>
            ))}
            <button
              type="button"
              className="tab-button add-button"
              onClick={addTask}
            >
              + Добавить задачу
            </button>
          </div>

          {formData.tasks.map((task, index) => (
            <div
              key={index}
              className={`task-section ${activeTab === index ? 'active' : ''}`}
            >
              <h2 className="form-section-title">Задача {index + 1}</h2>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Название задачи</label>
                  <input
                    className="form-input"
                    type="text"
                    name="title"
                    value={task.title}
                    onChange={(e) => handleTaskChange(index, e)}
                    placeholder="Введите название задачи"
                    maxLength={30}
                    required
                  />
                  <span className="char-counter">{task.title.length}/30</span>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Описание задачи</label>
                  <textarea
                    className="form-textarea"
                    name="description"
                    value={task.description}
                    onChange={(e) => handleTaskChange(index, e)}
                    placeholder="Введите описание задачи"
                    required
                    rows={4}
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Ответ на задачу</label>
                  <input
                    className="form-input"
                    type="text"
                    name="answer_to_the_task"
                    value={task.answer_to_the_task}
                    onChange={(e) => handleTaskChange(index, e)}
                    placeholder="Введите ответ"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Дополнительное условие</label>
                  <select
                    className="form-select"
                    name="additional_condition"
                    value={task.additional_condition}
                    onChange={(e) => handleTaskChange(index, e)}
                    required
                  >
                    <option value="None">Без доп. условий</option>
                    <option value="Photo">Сделать фото решения</option>
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Ссылка на статью (если есть)</label>
                  <input
                    className="form-input"
                    type="url"
                    name="link_to_article"
                    value={task.link_to_article}
                    onChange={(e) => handleTaskChange(index, e)}
                    placeholder="https://example.com"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="file-upload-section">
                  <h3 className="file-upload-title">Прикрепленные файлы</h3>

                  <div className="file-upload-grid">
                    <div className="file-upload-group">
                      <label className="form-label">DOCX файл</label>
                      <div className="file-input-wrapper">
                        <input
                          type="file"
                          accept=".docx, application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                          onChange={(e) => handleFileChange(index, 'docx_file', e)}
                        />
                        <span className="file-input-label">
                          {task.docx_file ? (task.docx_file as File).name : 'Выберите файл'}
                        </span>
                      </div>
                    </div>

                    <div className="file-upload-group">
                      <label className="form-label">Изображение</label>
                      <div className="file-input-wrapper">
                        <input
                          type="file"
                          accept="image/png, image/jpeg"
                          onChange={(e) => handleFileChange(index, 'photo_file', e)}
                        />
                        <span className="file-input-label">
                          {task.photo_file ? (task.photo_file as File).name : 'Выберите файл'}
                        </span>
                      </div>
                    </div>

                    <div className="file-upload-group">
                      <label className="form-label">Видео</label>
                      <div className="file-input-wrapper">
                        <input
                          type="file"
                          accept="video/mp4, video/x-m4v, video/*"
                          onChange={(e) => handleFileChange(index, 'video_file', e)}
                        />
                        <span className="file-input-label">
                          {task.video_file ? (task.video_file as File).name : 'Выберите файл'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}

          <div className="form-submit-section">
            <button type="submit" className="submit-button">
              Создать тест
            </button>
          </div>
        </form>
      ) : (
        <div className="access-denied-container">
          <h2 className="error-message">У вас нет на это прав.</h2>
        </div>
      )}
    </div>
  );
};

export default AddTasks;