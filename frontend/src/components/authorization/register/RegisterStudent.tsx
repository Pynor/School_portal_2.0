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
  const containerRef = useRef<HTMLDivElement>(null);
  const csrftoken = getCookie('csrftoken');
  
  const [isIndividualClassInput, setIsIndividualClassInput] = useState(false);
  const [containerWidth, setContainerWidth] = useState('100%');
  const [useCommonClass, setUseCommonClass] = useState(true);

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

  useEffect(() => {
    // Обновляем классы учеников при изменении общего класса или режима ввода
    if (!isIndividualClassInput && schoolClass) {
      setStudentsData(prevData =>
        prevData.map(student => ({
          ...student,
          school_class: schoolClass
        })));
    }
  }, [schoolClass, isIndividualClassInput]);

  const toggleClassMode = () => {
    const newMode = !useCommonClass;
    setUseCommonClass(newMode);

    if (newMode) {
      // При переходе к общему классу применяем выбранный класс ко всем
      setStudentsData(prevData =>
        prevData.map(student => ({ ...student, school_class: schoolClass })))
    }
  };

  // ### Processing of input data/Обработка вводных данных ###
  const handleInputChange = (index: number, field: keyof StudentForRegister, value: string) => {
    setStudentsData((prevData) => {
      const updatedData = [...prevData];
      updatedData[index][field] = value;
      return updatedData;
    });
  };


  const handleNumStudentsChange = (value: number) => {
    setNumStudents(value);
    setStudentsData(Array.from({ length: value }, () => ({
      last_name: '',
      first_name: '',
      school_class: useCommonClass ? schoolClass : ''
    })));
  };

  const handleStudentsInputChange = (value: string) => {
    setStudentsInput(value);

    const studentEntries = value.split(',')
      .map(entry => entry.trim())
      .filter(entry => entry)
      .map(entry => {
        const parts = entry.split(' ').filter(part => part.trim() !== '');

        // Если индивидуальные классы и есть что парсить
        if (!useCommonClass && parts.length > 1) {
          const classPart = parts[parts.length - 1];
          const isClassValid = CLASSES.includes(classPart);

          return {
            first_name: parts[0] || '',
            last_name: parts.slice(1, isClassValid ? -1 : undefined).join(' ') || '',
            school_class: isClassValid ? classPart : ''
          };
        } else {
          return {
            first_name: parts[0] || '',
            last_name: parts.slice(1).join(' ') || '',
            school_class: useCommonClass ? schoolClass : ''
          };
        }
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
      const postResponse = await fetch(`${BASE_URL}/user_app/v1/api-student-register/`, {
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


  useEffect(() => {
    if (containerRef.current) {
      setContainerWidth(`${containerRef.current.offsetWidth}px`);
    }
  }, []);


  // ### Rendering HTMLElement/Отрисовка HTMLElement ###
  return (
    <div className='form-login-and-register'>
      {props.userData.is_staff ? (
        <div className="form-container" ref={containerRef}>
          {/* Displaying message/Отображение сообщения */}
          {message && (
            <div ref={messageRef} className={message.className}>
              <h2>{message.text}</h2>
            </div>
          )}

          <div className="form-container">
            <div className="form-header" style={{ marginBottom: '20px' }}>
              <h2>
                Режим классов: {useCommonClass ? 'общий' : 'индивидуальные'}
              </h2>
              <h2>
                Режим ввода: {isBulkInput ? 'массовый' : 'поштучный'}
              </h2>
              {useCommonClass && schoolClass && (
                <h3>Выбран общий класс: {schoolClass}</h3>
              )}
            </div>
            {/* Кнопка переключения типа ввода */}
            <button className="btn-primary" style={{ marginBottom: '15px' }}
              onClick={() => setIsBulkInput(!isBulkInput)}>
              {isBulkInput ? 'Перейти на поштучный ввод' : 'Перейти на массовый ввод'}
            </button>

            {/* Кнопка переключения режима классов (видна в обоих режимах) */}
            <button className="btn-primary" style={{ marginBottom: '15px', marginLeft: '10px' }}
              onClick={toggleClassMode}>
              {useCommonClass ? 'Индивидуальные классы' : 'Общий класс'}
            </button>

            {/* Общий выбор класса (только в режиме общего класса) */}
            {useCommonClass && (
              <div className="form-group">
                <select
                  className="form-control"
                  value={schoolClass}
                  onChange={e => setSchoolClass(e.target.value)}
                  required
                >
                  <option value="">Выберите класс</option>
                  {CLASSES.map(option => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {isBulkInput ? (
            /* Массовый ввод */
            <div className="form-group" style={{ width: containerWidth }}>
              <textarea
                value={studentsInput}
                className="form-control textarea-for-register-student"
                onChange={(e) => handleStudentsInputChange(e.target.value)}
                placeholder={
                  useCommonClass
                    ? "Введите учеников (Фамилия Имя через запятую): Иванов Иван, Петрова Мария"
                    : "Введите учеников с классами (Фамилия Имя Класс): Иванов Иван 5А, Петрова Мария 5Б"
                }
              />

              {studentsData.length > 0 && (
                <div style={{ marginTop: '20px' }}>
                  <h2 style={{ marginBottom: '10px' }}>Список учеников:</h2>
                  <ul style={{ listStyleType: 'none', padding: '0' }}>
                    {studentsData.map((student, index) => (
                      <li key={index} style={{ padding: '5px 0', borderBottom: '1px solid #eee' }}>
                        {student.first_name} {student.last_name}
                        {student.school_class && ` (${student.school_class})`}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ) : (
            /* Separate filling forms/Отдельные формы для заполнения */
            <>
              <div className="form-container" style={{ width: containerWidth }}>
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
                        <h2 className="h2">Ученик {index + 1}</h2>

                        <div className="form-group">
                          <input
                            required
                            type="text"
                            placeholder="Имя"
                            className="form-control"
                            value={student.first_name}
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
                            onChange={(e) => handleInputChange(index, 'last_name', e.target.value)}
                          />
                        </div>

                        {!useCommonClass && (
                          <div className="form-group">
                            <select
                              className="form-control"
                              value={student.school_class}
                              onChange={(e) => handleInputChange(index, 'school_class', e.target.value)}
                              required
                            >
                              <option value="" >Выберите класс</option>
                              {CLASSES.map(option => (
                                <option key={option} value={option}>{option}</option>
                              ))}
                            </select>
                          </div>
                        )}
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