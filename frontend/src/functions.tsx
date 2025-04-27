import { useCallback, useEffect, useRef, useState } from 'react';
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
    const [message, setMessage] = useState<{
        content: React.ReactNode;
        type: MessageType;
    } | null>(null);

    const timeoutRef = useRef<NodeJS.Timeout>();

    // Полностью очищаем предыдущее сообщение и таймер
    const clearMessage = useCallback(() => {
        setMessage(null);
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
            timeoutRef.current = undefined;
        }
    }, []);

    // Показ нового сообщения
    const showMessage = useCallback((msg: Message) => {
        // Сначала очищаем предыдущее сообщение
        clearMessage();

        // Устанавливаем новое сообщение
        setMessage({
            content: msg.content,
            type: msg.type
        });

        // Автоматическое скрытие через duration (если указано)
        if (msg.duration && msg.duration > 0) {
            timeoutRef.current = setTimeout(() => {
                setMessage(null);
            }, msg.duration);
        }
    }, [clearMessage]);

    // Компонент для отображения сообщения
    const MessageComponent = useCallback(() => {
        if (!message) return null;

        const baseClass = 'message';
        const typeClass = {
            success: 'message-success',
            error: 'message-error',
            info: 'message-info',
            warning: 'message-warning'
        }[message.type];

        return (
            <div className={`${baseClass} ${typeClass}`}>
                {message.content}
            </div>
        );
    }, [message]);

    return {
        showMessage,
        clearMessage,
        MessageComponent,
        currentMessage: message?.content,
        currentType: message?.type
    };
};