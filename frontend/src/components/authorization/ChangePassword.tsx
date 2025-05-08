import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { getCookie, useMessageHandler } from '../../functions';
import { ChangePasswordForm } from '../../types';
import { BASE_URL } from '../../constants';


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
            const response = await fetch(`${BASE_URL}/user_app/v1/api-student-change-password/`, {
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
        <div className="auth-container">
            <h2>Change Password</h2>
            <div className="message-container">
                <MessageComponent />
            </div>

            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label htmlFor="old_password">Current Password</label>
                    <input
                        value={formData.old_password}
                        onChange={handleChange}
                        name="old_password"
                        id="old_password"
                        type="password"
                        required
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="new_password">New Password</label>
                    <input
                        value={formData.new_password}
                        onChange={handleChange}
                        name="new_password"
                        id="new_password"
                        type="password"
                        required
                    />
                </div>

                <button type="submit" disabled={isLoading}>
                    {isLoading ? 'Processing...' : 'Change Password'}
                </button>
            </form>
        </div>
    );
};

export default ChangePassword;