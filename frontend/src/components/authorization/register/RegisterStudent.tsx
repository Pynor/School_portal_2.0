import React, { useEffect, useState, useRef } from 'react';
import { StudentForRegister, UserData } from '../../../types';
import { BASE_URL, CLASSES } from '../../../constants';
import { useMessageHandler, getCookie } from '../../../functions';

import '../CSS/form-signing.css';
import './../../../App.css';

const RegisterStudents = (props: { userData: UserData }) => {
  // ### Assigning variables/Назначение переменных ###
  const { MessageComponent, showMessage, clearMessage, currentMessage } = useMessageHandler();

  const [studentsData, setStudentsData] = useState<StudentForRegister[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);
  const csrftoken = getCookie('csrftoken');

  const [isIndividualClassInput, setIsIndividualClassInput] = useState(false);
  const [useCommonClass, setUseCommonClass] = useState(true);
  const [studentsInput, setStudentsInput] = useState('');
  const [isBulkInput, setIsBulkInput] = useState(false);
  const [schoolClass, setSchoolClass] = useState('');
  const [numStudents, setNumStudents] = useState(0);


  // ### Effects/Эффекты ###
  useEffect(() => {
    if (!isIndividualClassInput && schoolClass) {
      setStudentsData(prevData =>
        prevData.map(student => ({
          ...student,
          school_class: schoolClass
        })));
    }
  }, [schoolClass, isIndividualClassInput]);


  // ### Processing of input data/Обработка вводных данных ###
  const toggleClassMode = () => {
    const newMode = !useCommonClass;
    setUseCommonClass(newMode);
    if (newMode) {
      setStudentsData(prevData =>
        prevData.map(student => ({ ...student, school_class: schoolClass })))
    }
  };

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
    clearMessage();

    if (!schoolClass && useCommonClass) {
      showMessage({
        content: 'Пожалуйста, выберите класс.',
        type: 'error',
        duration: 3000
      });
      return;
    }

    if (studentsData.length === 0) {
      showMessage({
        content: 'Добавьте хотя бы одного ученика для регистрации.',
        type: 'error',
        duration: 3000
      });
      return;
    }

    // Send request/Отправка запроса:
    try {
      const postResponse = await fetch(`${BASE_URL}/user_app/v1/api-student-register/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRFToken': csrftoken,
        },
        credentials: 'include',
        body: JSON.stringify(studentsData),
      });

      // Response processing/Обработка ответа:
      if (postResponse.ok) {
        showMessage({
          content: 'Ученики успешно зарегистрированы!',
          type: 'success',
          duration: 3000
        });
        setStudentsData([]);
        setStudentsInput('');
        setNumStudents(0);
      } else {
        const responseData = await postResponse.json();
        const errorMsg = responseData.error ||
          (responseData.detail ? responseData.detail : 'Неизвестная ошибка');
        showMessage({
          content: `Ошибка регистрации: ${errorMsg}`,
          type: 'error',
          duration: 5000
        });
      }
    } catch (error) {
      showMessage({
        content: 'Ошибка сети при отправке данных',
        type: 'error',
        duration: 5000
      });
      console.error('Registration error:', error);
    }
  };


  // ### Rendering HTMLElement/Отрисовка HTMLElement ###

  if (!props.userData.is_staff) {
    return (
      <div className="form-container">
        <h2 style={{ animation: "none" }} className="error-message">У вас нет прав для этого действия</h2>
      </div>
    );
  }

  return (
    <div className="form-wrapper">
      <div className="form-container card" ref={containerRef}>
        {/* Displaying message/Отображение сообщения */}
        {currentMessage && (
          <div className="message-container">
            <MessageComponent />
          </div>
        )}

        <div className="form-header">
          <h2>Регистрация учеников</h2>
          <div className="form-modes">
            <div className="mode-tag">
              <span>Классы:</span>
              <span className={`mode-value ${useCommonClass ? 'active' : ''}`}>
                {useCommonClass ? 'Общий' : 'Индивидуальные'}
              </span>
            </div>
            <div className="mode-tag">
              <span>Ввод:</span>
              <span className={`mode-value ${isBulkInput ? 'active' : ''}`}>
                {isBulkInput ? 'Массовый' : 'Поштучный'}
              </span>
            </div>
          </div>
        </div>

        <div className="form-controls">
          <button
            className="btn btn-mode-toggle"
            onClick={() => setIsBulkInput(!isBulkInput)}
          >
            {isBulkInput ? 'Поштучный ввод' : 'Массовый ввод'}
          </button>

          <button
            className="btn btn-mode-toggle"
            onClick={toggleClassMode}
          >
            {useCommonClass ? 'Индивидуальные классы' : 'Общий класс'}
          </button>
        </div>

        {useCommonClass && (
          <div className="form-group">
            <label>Общий класс</label>
            <select
              onChange={e => setSchoolClass(e.target.value)}
              style={{ width: '100%' }}
              className="form-select"
              value={schoolClass}
              required
            >
              <option value="">Выберите класс</option>
              {CLASSES.map(option => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
          </div>
        )}

        {isBulkInput ? (
          /* General filling form/Общая форма заполнения */
          <div className="bulk-input-container">
            <div className="form-group">
              <label>
                {useCommonClass
                  ? "Введите учеников (Фамилия Имя через запятую)"
                  : "Введите учеников с классами (Фамилия Имя Класс)"}
              </label>
              <textarea
                value={studentsInput}
                className="form-textarea"
                onChange={(e) => handleStudentsInputChange(e.target.value)}
                placeholder={
                  useCommonClass
                    ? "Например: Иванов Иван, Петрова Мария"
                    : "Например: Иванов Иван 5А, Петрова Мария 5Б"
                }
                rows={6}
              />
            </div>

            {studentsData.length > 0 && (
              <div className="students-preview">
                <h3>Будет зарегистрировано: {studentsData.length} учеников</h3>
                <div className="preview-list">
                  {studentsData.slice(0, 5).map((student, index) => (
                    <div key={index} className="preview-item">
                      <span>{student.first_name} {student.last_name}</span>
                      {student.school_class && <span className="class-badge">{student.school_class}</span>}
                    </div>
                  ))}
                  {studentsData.length > 5 && (
                    <div className="preview-more">+{studentsData.length - 5} ещё</div>
                  )}
                </div>
              </div>
            )}
          </div>
        ) : (
          /* Separate filling forms/Отдельные формы для заполнения */
          <>
            <div className="form-group">
              <label>Количество учеников</label>
              <input
                min="0"
                type="number"
                value={numStudents}
                className="form-input"
                style={{ width: '92%' }}
                onChange={(e) => handleNumStudentsChange(parseInt(e.target.value, 10))}
              />
            </div>

            <div className="students-form-container">
              {studentsData.map((student, index) => (
                <div key={index} className="student-form card">
                  <h3>Ученик {index + 1}</h3>
                  <div className="form-row">
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
                          <option value="">Класс</option>
                          {CLASSES.map(option => (
                            <option key={option} value={option}>{option}</option>
                          ))}
                        </select>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* Send button/Кнопка отправки */}
        <button
          className="btn btn-submit"
          onClick={registerStudents}
          disabled={studentsData.length === 0}
        >
          Зарегистрировать учеников
        </button>
      </div>
    </div>
  );
};

export default RegisterStudents;