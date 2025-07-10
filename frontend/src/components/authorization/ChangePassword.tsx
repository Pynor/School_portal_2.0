import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { getCookie, useMessageHandler } from '../../functions';
import { ChangePasswordForm } from '../../types';
import { BASE_URL } from '../../constants';

import './CSS/change-password.css';


const ChangePassword: React.FC = () => {
    const [formData, setFormData] = useState<ChangePasswordForm>({
        old_password: '',
        new_password: ''
    });

    const { showMessage, MessageComponent, clearMessage } = useMessageHandler();
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const csrftoken = getCookie('csrftoken');
    const navigate = useNavigate();

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        clearMessage();

        try {
            const response = await fetch(`${BASE_URL}/user_app/v1/api-change-password/`, {
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': csrftoken,
                },
                credentials: 'include',
                method: 'POST',

                body: JSON.stringify(formData),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.detail || 'Failed to change password');
            }

            showMessage({
                content: 'Пароль успешно изменен.',
                type: 'success',
                duration: 3000
            });

            setTimeout(() => {
                navigate('/profile-student');
            }, 2000);
        } catch (err) {
            showMessage({
                content: 'Произошла неизвестная ошибка.',
                type: 'error',
                duration: 3000
            });
        } finally {
            setIsLoading(false);
        }
    };

        return (
        <div className="change-password-container">
            <h1>Смена пароля</h1>
            
            <div className="message-container">
                <MessageComponent />
            </div>

            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <input
                        value={formData.old_password}
                        placeholder="Текущий пароль"
                        className="form-control"
                        onChange={handleChange}
                        name="old_password"
                        id="old_password"
                        type="password"
                        required
                    />
                </div>

                <div className="form-group">
                    <input
                        value={formData.new_password}
                        placeholder="Новый пароль"
                        className="form-control"
                        onChange={handleChange}
                        name="new_password"
                        id="new_password"
                        type="password"
                        required
                    />
                </div>

                <button 
                    type="submit" 
                    className="btn-primary" 
                    disabled={isLoading}
                >
                    {isLoading ? 'Обработка...' : 'Сменить пароль'}
                </button>
            </form>
        </div>
    );
};


export default ChangePassword;