import { Navigate } from 'react-router-dom';
import React, { useState } from 'react';

import { BASE_URL, CLASSES } from '../../../constants';
import { UserData, StudentForRegister } from '../../../types';
import { getCookie } from '../../../functions';

import '../CSS/form-signing.css'



const RegisterStudents = (props: { userData: UserData }) => {

  const [message, setMessage] = useState<React.ReactNode>(null);
  const [redirect, setRedirect] = useState(false);
  const csrftoken = getCookie('csrftoken');

  const [schoolClass, setSchoolClass] = useState('');
  const [numStudents, setNumStudents] = useState(1);



  const [studentsData, setStudentsData] = useState<StudentForRegister[]>(
    Array.from({ length: numStudents }, () => ({
      school_class: schoolClass,
      first_name: '',
      last_name: '',
    }))
  );

  const handleSchoolClassChange = (value: string) => {
    setSchoolClass(value);

    setStudentsData((prevData) =>
      prevData.map((student) => ({
        ...student,
        school_class: value,
      }))
    );
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
    setStudentsData(Array.from({ length: value }, () => ({ last_name: '', first_name: '', school_class: ''})));
  };


  const registerStudents = async (e: React.FormEvent) => {
    e.preventDefault();

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

    if (postResponse.ok) {

      setMessage(
        <div className="form-container">
          <h2 className="success-message">Регистрация учеников прошла успешно.</h2>
        </div>
      );

      setTimeout(() => {
        setRedirect(true);
      }, 2000);

    } else {
      const data = await postResponse.json();
      
      setMessage(
        <div className="form-container">
          <h2 className="error-message">Что то пошло не так.</h2>
        </div>
      );
      
      setTimeout(() => {
        setRedirect(true);
      }, 2000);

    }
  };

  if (redirect) {
    return <Navigate to="/" />;
  }

  return (
    <div>
      {props.userData.is_staff ? (
        !message ? (
          <div className="form-container">
            <div className="form-group">
              <div className="form-container">
                <div className="form-group d-flex align-items-center">
                  <div className='form-div'>Кол-во учеников:</div>
                  <div className="form-group">

                    <input
                      min="1"
                      type="number"
                      id="num-students"
                      value={numStudents}
                      className="form-control"
                      onChange={(e) => handleNumStudentsChange(parseInt(e.target.value, 10))}
                    />

                  </div>
                  <select className="form-control" id="school_class" name="school_class" onChange={e => handleSchoolClassChange(e.target.value)} required>
                    <option value="">Выберите класс</option>
                    {CLASSES.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </div>

                <button className="btn-primary" type="button" onClick={registerStudents} >
                  Зарегистрировать
                </button>
              </div>
            </div>


            {numStudents >= 1 && (
              <form onSubmit={registerStudents}>
                {studentsData.map((student, index) => (
                  <div className="form-container">
                    <div key={index} className="student-form">
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
          </div>
        ) : (message)

      ) : (
        <div className="form-container">
          <h2 className="error-message">У вас нет на это прав.</h2>
        </div>
      )}
    </div>
  );
};

export default RegisterStudents;