import React, { SyntheticEvent, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';

import { BASE_URL } from '../../../constants';
import { UserData, Student, Props } from '../../../types';
import getCookie from '../../../functions';

import '../CSS/form-signin.css'



const RegisterStudents = ({ userData }: Props) => {

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

  const validateForm = (studentsData: Student[]): Record<number, string[]> => {
    const formErrors: Record<number, string[]> = {};

    studentsData.forEach((student, index) => {
      const errors: string[] = [];

      if (!student.first_name.trim()) {
        errors.push('First name is required');
      }

      if (!student.last_name.trim()) {
        errors.push('Last name is required');
      }

      if (!student.school_class.trim()) {
        errors.push('School class is required');
      }

      if (errors.length > 0) {
        formErrors[index] = errors;
      }
    });

    return formErrors;
  };

  const submitStudents = async (e: React.FormEvent) => {
    e.preventDefault();

    if (numStudents <= 0) {
      return;
    }

    setLoading(true);
    setErrors({});

    const formErrors = validateForm(studentsData);

    if (Object.keys(formErrors).length > 0) {
      setLoading(false);
      return;
    }

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
        if (Array.isArray(data)) {
          setErrors(data.reduce((acc, error, index) => ({ ...acc, [index]: error }), {}));
        } else if (data && data.detail) {
          setErrors({ 0: [data.detail] });
        }
      } else {
        navigate('/');
      }
    } catch (error) {
      console.error('Error registering students:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleNumStudentsChange = (value: number) => {
    if (value < 0) {
      return;
    }

    setNumStudents(value);
    setStudentsData(Array.from({ length: value }, () => ({ last_name: '', first_name: '', school_class: '' })));
    setErrors({});
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="form-container">
      <div className="form-group">
        <input
          type="number"
          className="form-control"
          id="num-students"
          placeholder="Enter the number of students"
          min="0"
          value={numStudents}
          onChange={(e) => handleNumStudentsChange(parseInt(e.target.value, 10))}
        />
        <div className="form-group">
          <input
            type="text"
            className="form-control"
            id="school-class"
            placeholder="Enter the school class"
            value={schoolClass}
            onChange={(e) => handleSchoolClassChange(e.target.value)}
          />
        </div>
        <button className="btn-primary" type="button" onClick={submitStudents} disabled={loading}>
          Register Students
        </button>
      </div>
      {numStudents >= 0 && (
        <form onSubmit={submitStudents}>
          {studentsData.map((student, index) => (
            <div key={index} className="student-form">
              <h2 className="h2">Студент {index + 1}</h2>
              <div className="form-group">
                <input
                  type="text"
                  className={`form-control ${errors[index]?.includes('First name is required') ? 'is-invalid' : ''}`}
                  id={`first_name_${index}`}
                  placeholder="Введите имя"
                  required
                  value={student.first_name}
                  onChange={(e) => handleInputChange(index, 'first_name', e.target.value)}
                />
                {errors[index]?.includes('First name is required') && (
                  <div className="invalid-feedback">First name is required</div>
                )}
              </div>
              <div className="form-group">
                <input
                  type="text"
                  className={`form-control ${errors[index]?.includes('Last name is required') ? 'is-invalid' : ''}`}
                  id={`last_name_${index}`}
                  placeholder="Введите фамилию"
                  required
                  value={student.last_name}
                  onChange={(e) => handleInputChange(index, 'last_name', e.target.value)}
                />
                {errors[index]?.includes('Last name is required') && (
                  <div className="invalid-feedback">Last name is required</div>
                )}
              </div>
            </div>
          ))}
        </form>
      )}
    </div>
  );
};

export default RegisterStudents;