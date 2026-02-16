import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import Sidebar from '../components/Sidebar';
import ChatWindow from '../components/ChatWindow';
import UserList from '../components/UserList';

const Chat = () => {
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [showUserList, setShowUserList] = useState(false);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { socket, connected } = useSocket();

  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

  useEffect(() => {
    if (user) {
      fetchConversations();
    }
  }, [user]);

  useEffect(() => {
    if (socket && connected) {
      // Join all conversation rooms
      const conversationIds = conversations.map(c => c._id);
      if (conversationIds.length > 0) {
        socket.emit('join_conversations', conversationIds);
      }

      // Listen for new messages
      socket.on('receive_message', ({ message, conversationId }) => {
        setConversations(prev => {
          return prev.map(conv => {
            if (conv._id === conversationId) {
              return {
                ...conv,
                lastMessage: message,
                updatedAt: new Date()
              };
            }
            return conv;
          }).sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
        });
      });

      return () => {
        socket.off('receive_message');
      };
    }
  }, [socket, connected, conversations]);

  const fetchConversations = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/conversations`);
      if (response.data.success) {
        setConversations(response.data.conversations);
      }
    } catch (error) {
      console.error('Error fetching conversations:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectConversation = (conversation) => {
    setSelectedConversation(conversation);
    setShowUserList(false);
  };

  const handleNewConversation = async (userId) => {
    try {
      const response = await axios.post(`${API_URL}/api/conversations`, {
        participantId: userId
      });

      if (response.data.success) {
        const { conversation, existed } = response.data;
        
        if (!existed) {
          setConversations(prev => [conversation, ...prev]);
        }
        
        setSelectedConversation(conversation);
        setShowUserList(false);
      }
    } catch (error) {
      console.error('Error creating conversation:', error);
    }
  };

  return (
    <div className="flex h-screen bg-gray-100 dark:bg-gray-900">
      {/* Sidebar */}
      <Sidebar
        conversations={conversations}
        selectedConversation={selectedConversation}
        onSelectConversation={handleSelectConversation}
        onNewChat={() => setShowUserList(true)}
        loading={loading}
      />

      {/* Main Chat Area */}
      {showUserList ? (
        <UserList
          onSelectUser={handleNewConversation}
          onClose={() => setShowUserList(false)}
        />
      ) : selectedConversation ? (
        <ChatWindow
          conversation={selectedConversation}
          onBack={() => setSelectedConversation(null)}
        />
      ) : (
        <div className="flex-1 flex items-center justify-center bg-white dark:bg-gray-800">
          <div className="text-center">
            <div className="text-6xl mb-4">💬</div>
            <h2 className="text-2xl font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Welcome to SyncChat
            </h2>
            <p className="text-gray-500 dark:text-gray-400">
              Select a conversation or start a new chat
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Chat;
