import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { FiSend, FiArrowLeft, FiMoreVertical } from 'react-icons/fi';
import { format } from 'date-fns';
import MessageBubble from './MessageBubble';
import TypingIndicator from './TypingIndicator';

const ChatWindow = ({ conversation, onBack }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [typingUsers, setTypingUsers] = useState(new Set());
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const { user } = useAuth();
  const { socket, connected, onlineUsers } = useSocket();

  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

  const otherUser = conversation.participants.find(p => p._id !== user._id);
  const isOnline = onlineUsers.has(otherUser?._id);

  useEffect(() => {
    fetchMessages();
  }, [conversation._id]);

  useEffect(() => {
    if (socket && connected) {
      socket.on('receive_message', handleReceiveMessage);
      socket.on('typing_status', handleTypingStatus);
      socket.on('message_edited', handleMessageEdited);
      socket.on('message_deleted', handleMessageDeleted);
      socket.on('messages_read', handleMessagesRead);

      return () => {
        socket.off('receive_message', handleReceiveMessage);
        socket.off('typing_status', handleTypingStatus);
        socket.off('message_edited', handleMessageEdited);
        socket.off('message_deleted', handleMessageDeleted);
        socket.off('messages_read', handleMessagesRead);
      };
    }
  }, [socket, connected, conversation._id]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchMessages = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/messages/${conversation._id}`);
      if (response.data.success) {
        setMessages(response.data.messages);
        markMessagesAsRead(response.data.messages);
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const markMessagesAsRead = (msgs) => {
    if (!socket || !connected) return;

    const unreadMessageIds = msgs
      .filter(msg => msg.sender._id !== user._id && msg.status !== 'read')
      .map(msg => msg._id);

    if (unreadMessageIds.length > 0) {
      socket.emit('mark_read', {
        conversationId: conversation._id,
        messageIds: unreadMessageIds
      });
    }
  };

  const handleReceiveMessage = ({ message, conversationId }) => {
    if (conversationId === conversation._id) {
      setMessages(prev => [...prev, message]);
      markMessagesAsRead([message]);
    }
  };

  const handleTypingStatus = ({ userId, username, conversationId, isTyping }) => {
    if (conversationId === conversation._id && userId !== user._id) {
      setTypingUsers(prev => {
        const newSet = new Set(prev);
        if (isTyping) {
          newSet.add(username);
        } else {
          newSet.delete(username);
        }
        return newSet;
      });
    }
  };

  const handleMessageEdited = ({ messageId, newContent, editedAt, conversationId }) => {
    if (conversationId === conversation._id) {
      setMessages(prev =>
        prev.map(msg =>
          msg._id === messageId
            ? { ...msg, content: newContent, edited: true, editedAt }
            : msg
        )
      );
    }
  };

  const handleMessageDeleted = ({ messageId, conversationId }) => {
    if (conversationId === conversation._id) {
      setMessages(prev =>
        prev.map(msg =>
          msg._id === messageId
            ? { ...msg, deleted: true, content: 'This message was deleted' }
            : msg
        )
      );
    }
  };

  const handleMessagesRead = ({ conversationId, messageIds, readBy }) => {
    if (conversationId === conversation._id) {
      setMessages(prev =>
        prev.map(msg =>
          messageIds.includes(msg._id)
            ? { ...msg, status: 'read' }
            : msg
        )
      );
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    
    if (!newMessage.trim() || !socket || !connected || sending) return;

    setSending(true);
    const messageContent = newMessage.trim();
    setNewMessage('');

    socket.emit('send_message', {
      conversationId: conversation._id,
      content: messageContent,
      type: 'text'
    }, (response) => {
      if (response.success) {
        setMessages(prev => [...prev, response.message]);
      }
      setSending(false);
    });

    // Stop typing indicator
    socket.emit('typing', {
      conversationId: conversation._id,
      isTyping: false
    });
  };

  const handleTyping = (e) => {
    setNewMessage(e.target.value);

    if (!socket || !connected) return;

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Emit typing start
    socket.emit('typing', {
      conversationId: conversation._id,
      isTyping: true
    });

    // Set timeout to emit typing stop
    typingTimeoutRef.current = setTimeout(() => {
      socket.emit('typing', {
        conversationId: conversation._id,
        isTyping: false
      });
    }, 2000);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="flex-1 flex flex-col bg-white dark:bg-gray-800">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <button
            onClick={onBack}
            className="lg:hidden p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
          >
            <FiArrowLeft className="text-gray-600 dark:text-gray-300" />
          </button>
          <div className="relative">
            <img
              src={otherUser?.avatar}
              alt={otherUser?.username}
              className="w-10 h-10 rounded-full"
            />
            {isOnline && (
              <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white dark:border-gray-800 rounded-full"></div>
            )}
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white">
              {otherUser?.username}
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {isOnline ? 'Online' : `Last seen ${format(new Date(otherUser?.lastSeen), 'p')}`}
            </p>
          </div>
        </div>
        <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
          <FiMoreVertical className="text-gray-600 dark:text-gray-300" />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-gray-500 dark:text-gray-400">
              No messages yet. Start the conversation!
            </p>
          </div>
        ) : (
          messages.map((message, index) => (
            <MessageBubble
              key={message._id}
              message={message}
              isOwn={message.sender._id === user._id}
              showAvatar={
                index === 0 ||
                messages[index - 1].sender._id !== message.sender._id
              }
            />
          ))
        )}
        {typingUsers.size > 0 && (
          <TypingIndicator users={Array.from(typingUsers)} />
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-center space-x-2">
          <input
            type="text"
            value={newMessage}
            onChange={handleTyping}
            placeholder="Type a message..."
            disabled={!connected}
            className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={!newMessage.trim() || !connected || sending}
            className="p-3 bg-primary-500 hover:bg-primary-600 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <FiSend />
          </button>
        </div>
      </form>
    </div>
  );
};

export default ChatWindow;
