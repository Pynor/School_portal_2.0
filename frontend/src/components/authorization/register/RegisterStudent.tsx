import React, { useEffect, useState, useRef } from 'react';

import { StudentForRegister, UserData } from '../../../types';
import { BASE_URL, CLASSES } from '../../../constants';
import { getCookie } from '../../../functions';

import '../CSS/form-signing.css';
import './../../../App.css';


const RegisterStudents = (props: { userData: UserData }) => {
  // ### Assigning variables/Назначение переменных ###
  const [message, setMessage] = useState<{ text: string; className: 'success-message' | 'error-message' } | null>(null);
  const [studentsData, setStudentsData] = useState<StudentForRegister[]>([]);
  const messageRef = useRef<HTMLDivElement | null>(null);
  const csrftoken = getCookie('csrftoken');

  const [studentsInput, setStudentsInput] = useState('');
  const [isBulkInput, setIsBulkInput] = useState(false);
  const [schoolClass, setSchoolClass] = useState('');
  const [numStudents, setNumStudents] = useState(0);


  // ### Working with message/Работа с сообщениями ###
  useEffect(() => {
    if (message) {
      // Scrolling to a message/Прокрутка к сообщению:
      if (messageRef.current) {
        messageRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }

      // Setting a timer to hide a message/Установка таймера для скрытия сообщения:
      const timer = setTimeout(() => setMessage(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [message]);


  // ### Processing of input data/Обработка вводных данных ###
  const handleInputChange = (index: number, field: keyof StudentForRegister, value: string) => {
    setStudentsData((prevData) => {
      const updatedData = [...prevData];
      updatedData[index][field] = value;
      return updatedData;
    });
  };

  const handleSchoolClassChange = (value: string) => {
    setSchoolClass(value);
  };

  const handleNumStudentsChange = (value: number) => {
    setNumStudents(value);
    setStudentsData(Array.from({ length: value }, () => ({ last_name: '', first_name: '', school_class: schoolClass })));
  };

  const handleStudentsInputChange = (value: string) => {
    setStudentsInput(value);
    const studentEntries = value.split(',')
      .map(entry => entry.trim()) 
      .filter(entry => entry) 
      .map(entry => {
        const names = entry.split(' ').filter(name => name.trim() !== ''); 
        const first_name = names[0] || '';
        const last_name = names.slice(1).join(' ') || ''; 
        return { first_name, last_name, school_class: schoolClass };
      });
  
    setStudentsData(studentEntries);
    setNumStudents(studentEntries.length);
  };
  

  // ### Working with server/Работа с сервером ###
  const registerStudents = async (e: React.FormEvent) => {
    e.preventDefault();
  
    if (!schoolClass) {
      setMessage({ text: 'Пожалуйста, выберите класс.', className: 'error-message' });
      return;
    }
    
    // Send request/Отправка запроса:
    try {
      const postResponse = await fetch(`${BASE_URL}/user_app/api/v1/api-student-register/`, {
        method: 'POST',
        headers: {
          'Access-Control-Request-Headers': 'Content-Type',
          'Content-Type': 'application/json',
          'X-CSRFToken': csrftoken,
        },
        credentials: 'include',
        body: JSON.stringify(studentsData),
      });
      
      // Response processing/Обработка ответа:
      if (postResponse.ok) {
        setMessage({ text: 'Ученики успешно зарегистрированы.', className: 'success-message' });
      } else {
        const responseData = await postResponse.json();
        setMessage({ text: `Произошла ошибка при регистрации: ${responseData.error}`, className: 'error-message' });
      }
    } catch {
      setMessage({ text: 'Произошла ошибка при получении данных', className: 'error-message' });
    }
  };


  // ### Rendering HTMLElement/Отрисовка HTMLElement ###
  return (
    <div className='form-login-and-register'>
      {props.userData.is_staff ? ( // Checking rights/Проверка прав.
        <div className="form-container">
          {/* Displaying message/Отображение сообщения */}
          {message && (
            <div ref={messageRef} className={message.className}>
              <h2>{message.text}</h2>
            </div>
          )}
          <div className="form-container">
            {/* Format switching button/Кнопка переключения форматов */}
            <button className="btn-primary" style={{ marginBottom: '15px' }} type="button" onClick={() => setIsBulkInput(!isBulkInput)}>
              {isBulkInput ? 'Переключиться на ввод по форме' : 'Переключиться на массовый ввод'}
            </button>

            <div className="form-group">
              <select
                className="form-control"
                id="school_class"
                name="school_class"
                onChange={e => handleSchoolClassChange(e.target.value)}
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
          </div>

          {isBulkInput ? (
            /* General filling form/Общая форма заполнения */
            <div className="form-group">
              <textarea
                value={studentsInput}
                className="form-control textarea-for-register-student"
                onChange={(e) => handleStudentsInputChange(e.target.value)}
                placeholder="Введите учеников (например: Дарья Кузнецова, Иван Иванов)"
              />

              {studentsData.length > 0 && (
                <div style={{ marginTop: '20px' }}>
                  <h2 style={{ marginBottom: '10px' }}>Список учеников:</h2>
                  <ul style={{ listStyleType: 'none', padding: '0' }}>
                    {studentsData.map((student, index) => (
                      <li key={index} style={{ padding: '5px 0', borderBottom: '1px solid #eee' }}>
                        {student.first_name} {student.last_name} ({student.school_class})
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ) : (
            /* Separate filling forms/Отдельные формы для заполнения */
            <>
              <div className="form-container">
                <div className="form-group">
                  <label htmlFor="num-students">Кол-во учеников</label>
                  <input
                    min="0"
                    type="number"
                    id="num-students"
                    value={numStudents}
                    className="form-control"
                    onChange={(e) => handleNumStudentsChange(parseInt(e.target.value, 10))}
                  />
                </div>
              </div>

              {numStudents >= 1 && (
                <form onSubmit={registerStudents}>
                  {studentsData.map((student, index) => (
                    <div key={index} className="form-container">
                      <div className="student-form">
                        <h2 className="h2">Ученик: "{index + 1}"</h2>

                        <div className="form-group">
                          <input
                            required
                            type="text"
                            placeholder="Имя"
                            className="form-control"
                            value={student.first_name}
                            id={`first_name_${index}`}
                            onChange={(e) => handleInputChange(index, 'first_name', e.target.value)}
                          />
                        </div>

                        <div className="form-group">
                          <input
                            required
                            type="text"
                            placeholder="Фамилия"
                            className="form-control"
                            value={student.last_name}
                            id={`last_name_${index}`}
                            onChange={(e) => handleInputChange(index, 'last_name', e.target.value)}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </form>
              )}
            </>
          )}

          {/* Send button/Кнопка отправки */}
          <button className="btn-primary" type="button" onClick={registerStudents}>
            Зарегистрировать
          </button>

        </div>
      ) : (
        <div className="form-container">
          <h2 className="error-message">У вас нет на это прав.</h2>
        </div>
      )}
    </div>
  );

};


export default RegisterStudents;