import React from 'react';
import { format } from 'date-fns';
import { FiCheck, FiCheckCircle } from 'react-icons/fi';

const MessageBubble = ({ message, isOwn, showAvatar }) => {
  return (
    <div className={`flex items-end space-x-2 ${isOwn ? 'flex-row-reverse space-x-reverse' : ''} message-enter`}>
      {showAvatar && !isOwn && (
        <img
          src={message.sender.avatar}
          alt={message.sender.username}
          className="w-8 h-8 rounded-full"
        />
      )}
      {!showAvatar && !isOwn && <div className="w-8" />}
      
      <div className={`max-w-xs lg:max-w-md ${isOwn ? 'items-end' : 'items-start'}`}>
        <div
          className={`px-4 py-2 rounded-2xl ${
            isOwn
              ? 'bg-primary-500 text-white rounded-br-none'
              : 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded-bl-none'
          } ${message.deleted ? 'italic opacity-70' : ''}`}
        >
          <p className="break-words">{message.content}</p>
        </div>
        
        <div className={`flex items-center space-x-1 mt-1 px-2 ${isOwn ? 'justify-end' : 'justify-start'}`}>
          <span className="text-xs text-gray-500 dark:text-gray-400">
            {format(new Date(message.createdAt), 'p')}
          </span>
          {message.edited && (
            <span className="text-xs text-gray-500 dark:text-gray-400">(edited)</span>
          )}
          {isOwn && (
            <span className="text-xs">
              {message.status === 'read' ? (
                <FiCheckCircle className="text-primary-400" />
              ) : message.status === 'delivered' ? (
                <FiCheck className="text-gray-400" />
              ) : (
                <FiCheck className="text-gray-400" />
              )}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default MessageBubble;
