import React, { useEffect, useState, useRef } from 'react';
import { useChannel } from 'ably/react';
import styles from './ChatBox.module.css';

export default function ChatBox() {
    const [messageText, setMessageText] = useState('');
    const [receivedMessages, setMessages] = useState([]);
    const inputBoxRef = useRef(null);
    const messageEndRef = useRef(null);

    const messageTextIsEmpty = messageText.trim().length === 0;

    const { channel, ably } = useChannel('chat-demo', (message) => {
        const history = receivedMessages.slice(-199);
        setMessages([...history, message]);
    });

    const sendChatMessage = (messageText) => {
        channel.publish({ name: 'chat-message', data: messageText });
        setMessageText('');
        inputBoxRef.current.focus();
    };

    const handleFormSubmission = (event) => {
        event.preventDefault();
        sendChatMessage(messageText);
    };

    const handleKeyDown = (event) => {
        if (event.key !== 'Enter' || messageTextIsEmpty) {
            return;
        }
        sendChatMessage(messageText);
        event.preventDefault();
    };

    const messages = receivedMessages.map((message, index) => {
        const author = message.connectionId === ably.connection.id ? 'me' : 'other';
        return <span key={index} className={styles.message} data-author={author}>{message.data}</span>;
    });

    useEffect(() => {
        if (messageEndRef.current) {
            messageEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [receivedMessages]);

    return (
        <div className={styles.chatHolder}>
            <div className={styles.chatText}>
                {messages}
                <div ref={messageEndRef}></div>
            </div>
            <form onSubmit={handleFormSubmission} className={styles.form}>
                <textarea
                    ref={inputBoxRef}
                    value={messageText}
                    placeholder="Type a message..."
                    onChange={e => setMessageText(e.target.value)}
                    onKeyDown={handleKeyDown}
                    className={styles.textarea}
                ></textarea>
                <button type="submit" className={styles.button} disabled={messageTextIsEmpty}>Send</button>
            </form>
        </div>
    );
}
