import { useEffect, useRef, useState } from 'react';
import { Message, MessageType } from './types';


export function getCookie(name: string) {
    const cookieValue = document.cookie
      .split('; ')
      .find(row => row.startsWith(`${name}=`));
    if (cookieValue) {
      return cookieValue.split('=')[1];
    }
    return '';
};

export function setCookie(name: string, value: string, days: number = 0, sameSite: 'Lax' | 'Strict' | 'None' = 'Lax', secure: boolean = false) {
  
  const expires = days ? `expires=${new Date(Date.now() + days * 24 * 60 * 60 * 1000).toUTCString()}` : '';
  const secureFlag = secure ? 'Secure' : '';
  const sameSiteFlag = `SameSite=${sameSite}`;

  document.cookie = `${name}=${value}; ${expires}; path=/; ${sameSiteFlag}; ${secureFlag}`.trim();
}


export const useMessageHandler = () => {
    const [message, setMessage] = useState<React.ReactNode>(null);
    const [messageType, setMessageType] = useState<MessageType>('info');
    const timeoutRef = useRef<NodeJS.Timeout>();

    const showMessage = (msg: Message) => {
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }

        setMessage(msg.content);
        setMessageType(msg.type);

        // Automatic hiding of the message after a specified time/Автоматическое скрытие сообщения через указанное время
        if (msg.duration && msg.duration > 0) {
            timeoutRef.current = setTimeout(() => {
                setMessage(null);
            }, msg.duration);
        }
    };

    const clearMessage = () => {
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }
        setMessage(null);
    };

    useEffect(() => {
        return () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
        };
    }, []);

    const MessageComponent = () => {
        if (!message) return null;

        const baseClasses = "message-animation";
        const typeClasses = {
            success: "success-message",
            error: "error-message",
            info: "info-message",
            warning: "normal-message"
        };

        return (
            <div className={`${baseClasses} ${typeClasses[messageType]}`}>
                {message}
            </div>
        );
    };

    return {
        currentType: messageType,
        currentMessage: message,
        
        MessageComponent,
        clearMessage,
        showMessage,
    };
};