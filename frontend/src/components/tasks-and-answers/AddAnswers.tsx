import React, { useState } from "react";

import { UserData, FormAnswerData } from "../../types";
import { BASE_URL } from "../../constants";
import getCookie from "../../functions";


const AddAnswers: React.FC<{ userData: UserData }> = ({ userData }) => {
  const csrftoken = getCookie("csrftoken");

  const [message, setMessage] = useState<React.ReactNode>(null);
  const [formData, setFormData] = useState<FormAnswerData>({ 
    user: userData.id, answers: [{ task: "", answer: "", photo_to_the_answer: null }]
  });

  const addAnswers = async (e: React.FormEvent) => {
    e.preventDefault();

    const formDataToSend = new FormData();
    formDataToSend.append("user", formData.user.toString());

    formData.answers.forEach((answer, index) => {
      formDataToSend.append(`answers[${index}].task`, answer.task.toString());
      formDataToSend.append(`answers[${index}].answer`, answer.answer);
      if (answer.photo_to_the_answer) {
        formDataToSend.append(
          `answers[${index}].photo_to_the_answer`,
          answer.photo_to_the_answer
        );
      }
    });

    const postResponse = await fetch(`${BASE_URL}/task_app/api/v1/api-answer-list-create/`, {
        method: "POST",
        headers: {
          "X-CSRFToken": csrftoken,
        },
        credentials: "include",
        body: formDataToSend,
      });

      if (postResponse.ok) {
        setMessage(
          <h3 className="success-message">Ответ получен.</h3>
        );
      } else {
        setMessage(
          <h3 className="error-message">Произошла ошибка при получении ответа.</h3>
        );
      }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const file = e.target.files?.[0];
    const reader = new FileReader();

    reader.onloadend = () => {
      if (typeof reader.result === "string" && reader.result.startsWith("data:image")) {
        const base64Result = reader.result.split(",")[1];
        setFormData((prevFormData) => {
          const updatedAnswers = [...prevFormData.answers];
          updatedAnswers[index].photo_to_the_answer = base64Result;
          return {
            ...prevFormData,
            answers: updatedAnswers,
          };
        });
      }
    };

    if (file) {
      reader.readAsDataURL(file);
    }
  };
  return (
    <div className="form-container">
      {message && message}
      <form onSubmit={addAnswers}>
        {formData.answers.map((answer, index) => (
          <div key={index}>
            <input
              type="text"
              placeholder="Ответ"
              value={answer.answer}
              onChange={(e) =>
                setFormData((prevFormData) => {
                  const updatedAnswers = [...prevFormData.answers];
                  updatedAnswers[index].answer = e.target.value;
                  return {
                    ...prevFormData,
                    answers: updatedAnswers,
                  };
                })
              }
            />
            <input
              type="file"
              accept="image/*"
              onChange={(e) => handleFileChange(e, index)}
            />
          </div>
        ))}
        <button type="submit">Submit</button>
      </form>
    </div>
  );
};

export default AddAnswers;