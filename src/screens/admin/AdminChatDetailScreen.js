import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  Animated,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { useChat } from '../../context/ChatContext';
import { COLORS, SPACING, FONT_SIZES, FONT_WEIGHTS, BORDER_RADIUS, SHADOWS } from '../../theme/theme';

const formatTime = (timestamp) => {
  const date = new Date(timestamp);
  const hours = date.getHours();
  const minutes = date.getMinutes().toString().padStart(2, '0');
  const ampm = hours >= 12 ? 'PM' : 'AM';
  return `${hours % 12 || 12}:${minutes} ${ampm}`;
};

const MessageBubble = React.memo(({ message, isAdmin }) => {
  return (
    <View
      style={[
        styles.bubbleContainer,
        isAdmin ? styles.bubbleRight : styles.bubbleLeft,
      ]}
    >
      {!isAdmin && (
        <View style={styles.studentAvatar}>
          <Text style={styles.studentAvatarText}>
            {(message.senderName || 'S').charAt(0).toUpperCase()}
          </Text>
        </View>
      )}
      <View style={styles.bubbleWrap}>
        {!isAdmin && <Text style={styles.senderName}>{message.senderName || 'Student'}</Text>}
        {isAdmin ? (
          <LinearGradient
            colors={COLORS.gradientPrimary}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={[styles.bubble, styles.bubbleAdmin]}
          >
            <Text style={styles.bubbleTextAdmin}>{message.text}</Text>
          </LinearGradient>
        ) : (
          <View style={[styles.bubble, styles.bubbleStudent]}>
            <Text style={styles.bubbleTextStudent}>{message.text}</Text>
          </View>
        )}
        <Text style={[styles.timestamp, isAdmin && styles.timestampRight]}>
          {formatTime(message.timestamp)}
          {isAdmin && '  ✓'}
        </Text>
      </View>
    </View>
  );
});

const AdminChatDetailScreen = ({ navigation, route }) => {
  const { conversationId, userName } = route.params;
  const { user } = useAuth();
  const { getMessages, sendMessage, markReadByAdmin, deleteConversation } = useChat();
  const [inputText, setInputText] = useState('');
  const flatListRef = useRef(null);
  const isNearBottomRef = useRef(true);
  const isFirstRender = useRef(true);

  const messages = getMessages(conversationId);
  const displayMessages = useMemo(() => [...messages].reverse(), [messages]);

  // Stable message IDs string to detect actual new messages
  const messageIds = useMemo(() => messages.map((m) => m.id).join(','), [messages]);

  useEffect(() => {
    markReadByAdmin(conversationId);
  }, [conversationId]);

  useEffect(() => {
    markReadByAdmin(conversationId);
  }, [messageIds]);

  // Removed scrollToEnd logic because FlatList is now inverted (WhatsApp style)

  const handleSend = useCallback(() => {
    if (!inputText.trim()) return;
    sendMessage(conversationId, inputText, {
      uid: user.uid,
      displayName: user.displayName || 'Admin',
      role: 'admin',
    });
    setInputText('');
  }, [inputText, conversationId, user, sendMessage]);

  const renderMessage = useCallback(({ item }) => (
    <MessageBubble
      message={item}
      isAdmin={item.senderRole === 'admin'}
    />
  ), []);

  const keyExtractor = useCallback((item) => item.id, []);

  const handleScroll = useCallback(({ nativeEvent }) => {
    const { layoutMeasurement, contentOffset, contentSize } = nativeEvent;
    const distanceFromBottom = contentSize.height - layoutMeasurement.height - contentOffset.y;
    isNearBottomRef.current = distanceFromBottom < 100;
  }, []);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.background} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()} activeOpacity={0.7}>
          <Ionicons name="arrow-back" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <View style={styles.headerAvatarWrap}>
          <LinearGradient colors={COLORS.gradientAccent} style={styles.headerAvatar}>
            <Text style={styles.headerAvatarText}>
              {(userName || 'S').charAt(0).toUpperCase()}
            </Text>
          </LinearGradient>
          <View style={styles.headerOnlineDot} />
        </View>
        <View style={styles.headerInfo}>
          <Text style={styles.headerName} numberOfLines={1}>{userName || 'Student'}</Text>
          <Text style={styles.headerStatus}>Student • Online</Text>
        </View>
        <TouchableOpacity 
          style={styles.headerAction} 
          activeOpacity={0.7}
          onPress={() => {
            Alert.alert(
              'Delete Chat',
              `Are you sure you want to delete this chat with ${userName}?`,
              [
                { text: 'Cancel', style: 'cancel' },
                { 
                  text: 'Delete', 
                  style: 'destructive',
                  onPress: async () => {
                    try {
                      await deleteConversation(conversationId);
                      navigation.goBack();
                    } catch (err) {
                      Alert.alert('Error', err.message || 'Failed to delete chat');
                    }
                  }
                }
              ]
            );
          }}
        >
          <Ionicons name="trash-outline" size={24} color={COLORS.error || '#ff4757'} />
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'padding'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 80}
      >
        {/* Messages */}
        <FlatList
          style={{ flex: 1 }}
          ref={flatListRef}
          data={displayMessages}
          renderItem={renderMessage}
          keyExtractor={keyExtractor}
          contentContainerStyle={[
            styles.messagesList,
            displayMessages.length === 0 && styles.messagesListEmpty,
          ]}
          showsVerticalScrollIndicator={false}
          inverted
          ListEmptyComponent={
            <View style={[styles.emptyInline, { transform: [{ scaleY: -1 }] }]}>
              <Ionicons name="chatbubble-ellipses-outline" size={40} color={COLORS.textMuted} />
              <Text style={styles.emptyInlineText}>No messages in this conversation yet</Text>
            </View>
          }
          onScroll={handleScroll}
          scrollEventThrottle={200}
          removeClippedSubviews={Platform.OS === 'android'}
          maxToRenderPerBatch={15}
          windowSize={11}
          initialNumToRender={20}
        />

        {/* Quick Reply Suggestions */}
        {messages.length > 0 && messages[messages.length - 1]?.senderRole === 'user' && (
          <View style={styles.quickReplies}>
            {['I can help with that!', 'Let me check and get back to you.', 'Could you provide more details?'].map((reply) => (
              <TouchableOpacity
                key={reply}
                style={styles.quickReplyChip}
                onPress={() => setInputText(reply)}
                activeOpacity={0.7}
              >
                <Text style={styles.quickReplyText}>{reply}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Input Bar */}
        <View style={styles.inputBar}>
          <View style={styles.inputWrap}>
            <TextInput
              style={styles.input}
              value={inputText}
              onChangeText={setInputText}
              placeholder="Type your reply..."
              placeholderTextColor={COLORS.textPlaceholder}
              multiline
              maxLength={1000}
              onSubmitEditing={handleSend}
            />
          </View>
          <TouchableOpacity
            onPress={handleSend}
            activeOpacity={0.8}
            disabled={!inputText.trim()}
          >
            <LinearGradient
              colors={inputText.trim() ? COLORS.gradientPrimary : [COLORS.surfaceLight, COLORS.surfaceLight]}
              style={styles.sendBtn}
            >
              <Ionicons name="send" size={18} color={inputText.trim() ? COLORS.white : COLORS.textMuted} />
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  flex: { flex: 1 },
  // Header
  header: {
    flexDirection: 'row', alignItems: 'center',
    paddingTop: SPACING.huge, paddingBottom: SPACING.md, paddingHorizontal: SPACING.lg,
    backgroundColor: COLORS.surface, borderBottomWidth: 1, borderBottomColor: COLORS.cardBorder,
  },
  backBtn: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: COLORS.surfaceLight, alignItems: 'center', justifyContent: 'center',
    marginRight: SPACING.md,
  },
  headerAvatarWrap: { position: 'relative', marginRight: SPACING.md },
  headerAvatar: {
    width: 40, height: 40, borderRadius: 20,
    alignItems: 'center', justifyContent: 'center',
  },
  headerAvatarText: { fontSize: FONT_SIZES.md, fontWeight: FONT_WEIGHTS.bold, color: COLORS.white },
  headerOnlineDot: {
    position: 'absolute', bottom: 0, right: 0,
    width: 12, height: 12, borderRadius: 6,
    backgroundColor: COLORS.success, borderWidth: 2, borderColor: COLORS.surface,
  },
  headerInfo: { flex: 1 },
  headerName: { fontSize: FONT_SIZES.lg, fontWeight: FONT_WEIGHTS.bold, color: COLORS.text },
  headerStatus: { fontSize: FONT_SIZES.xs, color: COLORS.textMuted, marginTop: 1 },
  headerAction: { padding: SPACING.sm },
  // Messages
  messagesList: { padding: SPACING.lg, paddingBottom: SPACING.sm },
  messagesListEmpty: { flex: 1, justifyContent: 'center' },
  bubbleContainer: { flexDirection: 'row', marginBottom: SPACING.md, maxWidth: '80%' },
  bubbleRight: { alignSelf: 'flex-end', flexDirection: 'row-reverse' },
  bubbleLeft: { alignSelf: 'flex-start' },
  bubbleWrap: { flex: 1 },
  studentAvatar: {
    width: 28, height: 28, borderRadius: 14,
    backgroundColor: COLORS.surfaceLight, alignItems: 'center', justifyContent: 'center',
    marginRight: SPACING.sm, marginTop: SPACING.xl,
    borderWidth: 1, borderColor: COLORS.cardBorder,
  },
  studentAvatarText: { fontSize: FONT_SIZES.xs, fontWeight: FONT_WEIGHTS.bold, color: COLORS.textSecondary },
  senderName: { fontSize: FONT_SIZES.xs, color: COLORS.textMuted, marginBottom: 3, fontWeight: FONT_WEIGHTS.medium },
  bubble: { borderRadius: BORDER_RADIUS.lg, padding: SPACING.md, paddingHorizontal: SPACING.lg },
  bubbleAdmin: { borderBottomRightRadius: 4 },
  bubbleStudent: { backgroundColor: COLORS.surface, borderBottomLeftRadius: 4, borderWidth: 1, borderColor: COLORS.cardBorder },
  bubbleTextAdmin: { fontSize: FONT_SIZES.md, color: COLORS.white, lineHeight: 22 },
  bubbleTextStudent: { fontSize: FONT_SIZES.md, color: COLORS.text, lineHeight: 22 },
  timestamp: { fontSize: 10, color: COLORS.textMuted, marginTop: 4, marginLeft: 4 },
  timestampRight: { textAlign: 'right', marginRight: 4, marginLeft: 0 },
  // Empty inline
  emptyInline: { alignItems: 'center', justifyContent: 'center', padding: SPACING.xxxl },
  emptyInlineText: { fontSize: FONT_SIZES.md, color: COLORS.textMuted, marginTop: SPACING.md },
  // Quick Replies
  quickReplies: {
    flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.sm,
    paddingHorizontal: SPACING.lg, paddingVertical: SPACING.sm,
    borderTopWidth: 1, borderTopColor: COLORS.cardBorder,
    backgroundColor: COLORS.background,
  },
  quickReplyChip: {
    backgroundColor: COLORS.surface, borderRadius: BORDER_RADIUS.round,
    paddingHorizontal: SPACING.md, paddingVertical: SPACING.xs + 2,
    borderWidth: 1, borderColor: COLORS.primary + '40',
  },
  quickReplyText: { fontSize: FONT_SIZES.xs, color: COLORS.primary, fontWeight: FONT_WEIGHTS.medium },
  // Input
  inputBar: {
    flexDirection: 'row', alignItems: 'flex-end',
    paddingHorizontal: SPACING.md, paddingVertical: SPACING.md,
    backgroundColor: COLORS.surface, borderTopWidth: 1, borderTopColor: COLORS.cardBorder,
    gap: SPACING.sm,
  },
  inputWrap: {
    flex: 1, backgroundColor: COLORS.surfaceLight,
    borderRadius: BORDER_RADIUS.xl, borderWidth: 1, borderColor: COLORS.cardBorder,
    paddingHorizontal: SPACING.lg, minHeight: 44, maxHeight: 120, justifyContent: 'center',
  },
  input: { fontSize: FONT_SIZES.md, color: COLORS.text, paddingVertical: SPACING.sm, maxHeight: 100 },
  sendBtn: {
    width: 44, height: 44, borderRadius: 22,
    alignItems: 'center', justifyContent: 'center', ...SHADOWS.small,
  },
});

export default AdminChatDetailScreen;
