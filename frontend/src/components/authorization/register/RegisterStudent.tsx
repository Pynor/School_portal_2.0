import React, { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';

import { BASE_URL } from '../../../constants';
import { UserData, Student } from '../../../types';
import getCookie from '../../../functions';

import '../CSS/form-signin.css'



const RegisterStudents = (props: { userData: UserData }) => {

  const navigate = useNavigate();
  const csrftoken = getCookie('csrftoken');

  const [numStudents, setNumStudents] = useState(0);
  const [schoolClass, setSchoolClass] = useState('');
  const [errors, setErrors] = useState<Record<number, string[]>>({});
  const [loading, setLoading] = useState(false);

  const [studentsData, setStudentsData] = useState<Student[]>(
    Array.from({ length: numStudents }, () => ({
      last_name: '',
      first_name: '',
      school_class: schoolClass,
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

    setErrors({});
  };

  const handleInputChange = (index: number, field: keyof Student, value: string) => {
    setStudentsData((prevData) => {
      const updatedData = [...prevData];
      updatedData[index][field] = value;
      return updatedData;
    });

    setErrors((prevErrors) => {
      const updatedErrors = { ...prevErrors };
      delete updatedErrors[index];
      return updatedErrors;
    });
  };

  const handleNumStudentsChange = (value: number) => {
    setNumStudents(value);
    setStudentsData(Array.from({ length: value }, () => ({ last_name: '', first_name: '', school_class: '' })));
    setErrors({});
  };


  const registerStudents = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});

    try {
      const response = await fetch(`${BASE_URL}/user_app/api/v1/api-student-register/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRFToken': csrftoken,
        },
        credentials: 'include',
        body: JSON.stringify(studentsData),
      });

      if (!response.ok) {
        const data = await response.json();
        setErrors(data);
      } else {
        navigate('/');
      }
      
    } catch (error) {
      console.error('Error registering students:', error);

    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="form-container"><h2>Загрузка...</h2></div>;
  }

  return (
    <div>
      {props.userData.is_staff ? (
        <div className="form-container">
          <div className="form-group">
            <div className="form-container">
              <input
                min="0"
                type="number"
                id="num-students"
                value={numStudents}
                className="form-control"
                onChange={(e) => handleNumStudentsChange(parseInt(e.target.value, 10))}
              />

              <input
                type="text"
                id="school-class"
                value={schoolClass}
                className="form-control"
                placeholder="Класс учеников"
                onChange={(e) => handleSchoolClassChange(e.target.value)}
              />

              <button className="btn-primary" type="button" onClick={registerStudents} disabled={loading}>
                Зарегистрировать
              </button>
            </div>
          </div>


          {numStudents >= 0 && (
            <form onSubmit={registerStudents}>
              {studentsData.map((student, index) => (
                <div key={index} className="student-form">
                  <h2 className="h2">Ученик: "{index + 1}"</h2>

                  <div className="form-group">

                    <input
                      required
                      type="text"
                      placeholder="Имя"
                      value={student.first_name}
                      id={`first_name_${index}`}
                      onChange={(e) => handleInputChange(index, 'first_name', e.target.value)}
                      className={`form-control ${errors[index]?.includes('First name is required') ? 'is-invalid' : ''}`}
                    />
                    
                    <input
                      required
                      type="text"
                      value={student.last_name}
                      id={`last_name_${index}`}
                      placeholder="Фамилия"
                      onChange={(e) => handleInputChange(index, 'last_name', e.target.value)}
                      className={`form-control ${errors[index]?.includes('Last name is required') ? 'is-invalid' : ''}`}
                    />

                  </div>
                </div>
              ))}
            </form>
          )}
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