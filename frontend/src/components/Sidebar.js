import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useSocket } from '../context/SocketContext';
import { FiLogOut, FiMoon, FiSun, FiEdit, FiWifi, FiWifiOff } from 'react-icons/fi';
import { formatDistanceToNow } from 'date-fns';

const Sidebar = ({ conversations, selectedConversation, onSelectConversation, onNewChat, loading }) => {
  const { user, logout } = useAuth();
  const { darkMode, toggleDarkMode } = useTheme();
  const { connected, onlineUsers } = useSocket();

  const getOtherParticipant = (conversation) => {
    return conversation.participants.find(p => p._id !== user._id);
  };

  const isUserOnline = (userId) => {
    return onlineUsers.has(userId);
  };

  return (
    <div className="w-80 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <img
              src={user?.avatar}
              alt={user?.username}
              className="w-10 h-10 rounded-full"
            />
            <div>
              <h2 className="font-semibold text-gray-900 dark:text-white">
                {user?.username}
              </h2>
              <div className="flex items-center space-x-1">
                {connected ? (
                  <>
                    <FiWifi className="text-green-500 text-xs" />
                    <span className="text-xs text-green-500">Connected</span>
                  </>
                ) : (
                  <>
                    <FiWifiOff className="text-red-500 text-xs" />
                    <span className="text-xs text-red-500">Disconnected</span>
                  </>
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={toggleDarkMode}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              title="Toggle theme"
            >
              {darkMode ? (
                <FiSun className="text-gray-600 dark:text-gray-300" />
              ) : (
                <FiMoon className="text-gray-600 dark:text-gray-300" />
              )}
            </button>
            <button
              onClick={logout}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              title="Logout"
            >
              <FiLogOut className="text-gray-600 dark:text-gray-300" />
            </button>
          </div>
        </div>

        <button
          onClick={onNewChat}
          className="w-full flex items-center justify-center space-x-2 bg-primary-500 hover:bg-primary-600 text-white py-2 rounded-lg transition-colors"
        >
          <FiEdit />
          <span>New Chat</span>
        </button>
      </div>

      {/* Conversations List */}
      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
          </div>
        ) : conversations.length === 0 ? (
          <div className="text-center py-8 px-4">
            <p className="text-gray-500 dark:text-gray-400">
              No conversations yet. Start a new chat!
            </p>
          </div>
        ) : (
          conversations.map((conversation) => {
            const otherUser = getOtherParticipant(conversation);
            const isOnline = isUserOnline(otherUser?._id);
            const isSelected = selectedConversation?._id === conversation._id;

            return (
              <div
                key={conversation._id}
                onClick={() => onSelectConversation(conversation)}
                className={`p-4 border-b border-gray-200 dark:border-gray-700 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${
                  isSelected ? 'bg-primary-50 dark:bg-gray-700' : ''
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div className="relative">
                    <img
                      src={otherUser?.avatar}
                      alt={otherUser?.username}
                      className="w-12 h-12 rounded-full"
                    />
                    {isOnline && (
                      <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white dark:border-gray-800 rounded-full"></div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-gray-900 dark:text-white truncate">
                        {otherUser?.username}
                      </h3>
                      {conversation.lastMessage && (
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {formatDistanceToNow(new Date(conversation.lastMessage.createdAt), {
                            addSuffix: true
                          })}
                        </span>
                      )}
                    </div>
                    {conversation.lastMessage && (
                      <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                        {conversation.lastMessage.sender === user._id ? 'You: ' : ''}
                        {conversation.lastMessage.content}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default Sidebar;
