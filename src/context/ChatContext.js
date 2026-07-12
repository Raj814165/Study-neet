import React, { createContext, useState, useContext, useEffect, useCallback, useRef } from 'react';
import { AppState } from 'react-native';
import { api } from '../config/api';
import { useAuth } from './AuthContext';

// User messages auto-delete after this many milliseconds
const MESSAGE_LIFETIME_MS = 10000;

// Poll intervals
const ACTIVE_POLL_MS = 8000;   // 8 seconds when app is active
const INACTIVE_POLL_MS = 30000; // 30 seconds when app is in background

const ChatContext = createContext({});

export const useChat = () => useContext(ChatContext);

// Helper to check if conversations data actually changed
const hasConversationsChanged = (prev, next) => {
  if (prev.length !== next.length) return true;
  for (let i = 0; i < prev.length; i++) {
    if (prev[i].id !== next[i].id) return true;
    if (prev[i].lastMessage !== next[i].lastMessage) return true;
    if (prev[i].lastMessageTime !== next[i].lastMessageTime) return true;
    if (prev[i].unreadByAdmin !== next[i].unreadByAdmin) return true;
    if (prev[i].unreadByUser !== next[i].unreadByUser) return true;
    if ((prev[i].messages?.length || 0) !== (next[i].messages?.length || 0)) return true;
  }
  return false;
};

const hasMyConversationChanged = (prev, next) => {
  if (!prev && !next) return false;
  if (!prev || !next) return true;
  if (prev.id !== next.id) return true;
  if (prev.lastMessage !== next.lastMessage) return true;
  if (prev.lastMessageTime !== next.lastMessageTime) return true;
  if (prev.unreadByUser !== next.unreadByUser) return true;
  if ((prev.messages?.length || 0) !== (next.messages?.length || 0)) return true;
  return false;
};

export const ChatProvider = ({ children }) => {
  const { user } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [myConversation, setMyConversation] = useState(null);
  const pollRef = useRef(null);
  const conversationsRef = useRef([]);
  const myConversationRef = useRef(null);
  const appStateRef = useRef('active');
  const isFetchingRef = useRef(false);

  // Fetch all conversations (admin only)
  const fetchConversations = useCallback(async () => {
    if (!user || user.role !== 'admin') return;
    if (isFetchingRef.current) return; // Prevent overlapping fetches
    isFetchingRef.current = true;
    try {
      const data = await api.get('/chat/conversations');
      if (data.success) {
        const mapped = data.conversations.map((c) => ({
          ...c,
          id: c.id || c._id,
        }));
        if (hasConversationsChanged(conversationsRef.current, mapped)) {
          conversationsRef.current = mapped;
          setConversations(mapped);
        }
      }
    } catch (error) {
      // Not admin or not logged in — ignore
    } finally {
      isFetchingRef.current = false;
    }
  }, [user]);

  // Fetch user's own conversation (user only)
  const fetchMyConversation = useCallback(async () => {
    if (!user) return;
    try {
      const data = await api.get('/chat/my');
      if (data.success) {
        const conv = data.conversation;
        conv.id = conv.id || conv._id;
        conv.messages = (conv.messages || []).map((m) => ({
          ...m,
          id: m.id || m._id,
          timestamp: m.timestamp || new Date().toISOString(),
        }));

        if (hasMyConversationChanged(myConversationRef.current, conv)) {
          myConversationRef.current = conv;
          setMyConversation(conv);

          // Also update in the conversations list
          setConversations((prev) => {
            const idx = prev.findIndex((c) => c.id === conv.id || c.userId === conv.userId);
            if (idx >= 0) {
              const updated = [...prev];
              updated[idx] = conv;
              conversationsRef.current = updated;
              return updated;
            }
            return prev;
          });
        }
      }
    } catch (error) {
      // Not logged in — ignore
    }
  }, [user]);

  // Get or create a conversation for a user (returns cached version)
  const getOrCreateConversation = useCallback((usr) => {
    if (myConversation && myConversation.userId === usr.uid) {
      return myConversation;
    }
    fetchMyConversation();
    return myConversation || {
      id: 'temp',
      userId: usr.uid,
      userName: usr.displayName || 'Student',
      messages: [],
    };
  }, [myConversation, fetchMyConversation]);

  // Send a message
  const sendMessage = useCallback(async (conversationId, text, sender) => {
    try {
      const data = await api.post('/chat/send', {
        conversationId: conversationId === 'temp' ? undefined : conversationId,
        text,
        targetUserId: sender.uid,
      });

      if (data.success) {
        const newMsg = {
          ...data.message,
          id: data.message.id || data.message._id,
        };

        // Optimistically update local state
        if (myConversation) {
          const updated = {
            ...myConversation,
            messages: [...myConversation.messages, newMsg],
            lastMessage: text,
            lastMessageTime: new Date().toISOString(),
          };
          myConversationRef.current = updated;
          setMyConversation(updated);
        }

        // Update conversations list
        setConversations((prev) => {
          const updated = prev.map((conv) => {
            if (conv.id === conversationId) {
              return {
                ...conv,
                messages: [...conv.messages, newMsg],
                lastMessage: text,
                lastMessageTime: new Date().toISOString(),
                unreadByAdmin: sender.role === 'user' ? (conv.unreadByAdmin || 0) + 1 : 0,
                unreadByUser: sender.role === 'admin' ? (conv.unreadByUser || 0) + 1 : 0,
              };
            }
            return conv;
          });
          conversationsRef.current = updated;
          return updated;
        });

        return newMsg;
      }
    } catch (error) {
      console.log('Send message error:', error.message);
    }
  }, [myConversation]);

  // Mark conversation as read by admin
  const markReadByAdmin = useCallback(async (conversationId) => {
    try {
      await api.put(`/chat/read/${conversationId}`);
      setConversations((prev) => {
        const updated = prev.map((conv) =>
          conv.id === conversationId ? { ...conv, unreadByAdmin: 0 } : conv
        );
        conversationsRef.current = updated;
        return updated;
      });
    } catch (error) {
      // Ignore
    }
  }, []);

  // Delete conversation (admin)
  const deleteConversation = useCallback(async (conversationId) => {
    try {
      const res = await api.delete(`/chat/${conversationId}`);
      if (res.success) {
        setConversations((prev) => {
          const updated = prev.filter((c) => c.id !== conversationId);
          conversationsRef.current = updated;
          return updated;
        });
      }
      return res;
    } catch (error) {
      throw error;
    }
  }, []);

  // Mark conversation as read by user
  const markReadByUser = useCallback(async (conversationId) => {
    if (conversationId === 'temp') return;
    try {
      await api.put(`/chat/read/${conversationId}`);
      const updated = myConversation ? { ...myConversation, unreadByUser: 0 } : null;
      myConversationRef.current = updated;
      setMyConversation(updated);
    } catch (error) {
      // Ignore
    }
  }, [myConversation]);

  // Get messages for a conversation
  const getMessages = useCallback((conversationId) => {
    if (myConversation && myConversation.id === conversationId) {
      return myConversation.messages || [];
    }
    const conv = conversations.find((c) => c.id === conversationId);
    return conv?.messages || [];
  }, [conversations, myConversation]);

  // Get conversation for a specific user
  const getUserConversation = useCallback((userId) => {
    if (myConversation && myConversation.userId === userId) {
      return myConversation;
    }
    return conversations.find((c) => c.userId === userId);
  }, [conversations, myConversation]);

  // Total unread count for admin badge
  const totalUnreadForAdmin = conversations.reduce((sum, c) => sum + (c.unreadByAdmin || 0), 0);

  // Total unread count for user
  const getUserUnread = useCallback((userId) => {
    if (myConversation && myConversation.userId === userId) {
      return myConversation.unreadByUser || 0;
    }
    const conv = conversations.find((c) => c.userId === userId);
    return conv?.unreadByUser || 0;
  }, [conversations, myConversation]);

  // Smart polling: only when user is logged in, with adaptive interval
  useEffect(() => {
    if (!user) {
      // Not logged in — clear any existing poll
      if (pollRef.current) {
        clearInterval(pollRef.current);
        pollRef.current = null;
      }
      return;
    }

    const startPolling = (interval) => {
      if (pollRef.current) clearInterval(pollRef.current);
      pollRef.current = setInterval(() => {
        if (user.role === 'admin') {
          fetchConversations();
        }
        fetchMyConversation();
      }, interval);
    };

    // Initial fetch
    if (user.role === 'admin') {
      fetchConversations();
    }
    fetchMyConversation();

    // Start with active interval
    startPolling(ACTIVE_POLL_MS);

    // Listen for app state changes to reduce polling when backgrounded
    const subscription = AppState.addEventListener('change', (nextAppState) => {
      if (nextAppState === 'active') {
        appStateRef.current = 'active';
        startPolling(ACTIVE_POLL_MS);
        // Immediate refresh on foreground
        if (user.role === 'admin') fetchConversations();
        fetchMyConversation();
      } else {
        appStateRef.current = 'background';
        startPolling(INACTIVE_POLL_MS);
      }
    });

    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
      subscription?.remove();
    };
  }, [user, fetchMyConversation, fetchConversations]);

  return (
    <ChatContext.Provider
      value={{
        conversations,
        getOrCreateConversation,
        sendMessage,
        markReadByAdmin,
        markReadByUser,
        getMessages,
        getUserConversation,
        totalUnreadForAdmin,
        getUserUnread,
        fetchConversations,
        fetchMyConversation,
        deleteConversation,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};
