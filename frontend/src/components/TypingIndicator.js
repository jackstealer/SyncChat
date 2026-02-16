import React from 'react';

const TypingIndicator = ({ users }) => {
  return (
    <div className="flex items-center space-x-2 animate-fadeIn">
      <div className="flex items-center space-x-1 px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded-2xl rounded-bl-none">
        <div className="typing-indicator flex space-x-1">
          <span className="w-2 h-2 bg-gray-500 dark:bg-gray-400 rounded-full"></span>
          <span className="w-2 h-2 bg-gray-500 dark:bg-gray-400 rounded-full"></span>
          <span className="w-2 h-2 bg-gray-500 dark:bg-gray-400 rounded-full"></span>
        </div>
      </div>
      <span className="text-xs text-gray-500 dark:text-gray-400">
        {users.join(', ')} {users.length === 1 ? 'is' : 'are'} typing...
      </span>
    </div>
  );
};

export default TypingIndicator;
