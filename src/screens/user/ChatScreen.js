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
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { useChat } from '../../context/ChatContext';
import { COLORS, SPACING, FONT_SIZES, FONT_WEIGHTS, BORDER_RADIUS, SHADOWS } from '../../theme/theme';

const { width } = Dimensions.get('window');

const formatTime = (timestamp) => {
  const date = new Date(timestamp);
  const hours = date.getHours();
  const minutes = date.getMinutes().toString().padStart(2, '0');
  const ampm = hours >= 12 ? 'PM' : 'AM';
  return `${hours % 12 || 12}:${minutes} ${ampm}`;
};

const MESSAGE_LIFETIME_MS = 10000;

const MessageBubble = React.memo(({ message, isOwn }) => {
  const timerAnim = useRef(new Animated.Value(1)).current;
  const fadeOutAnim = useRef(new Animated.Value(1)).current;
  const [secondsLeft, setSecondsLeft] = useState(null);

  const msgTime = new Date(message.timestamp).getTime();
  const expiresAt = message.expiresAt || (msgTime + MESSAGE_LIFETIME_MS);

  // Countdown timer bar + seconds display
  useEffect(() => {
    const remaining = expiresAt - Date.now();
    if (remaining <= 0) return;

    setSecondsLeft(Math.ceil(remaining / 1000));

    // Animate the progress bar shrinking
    timerAnim.setValue(remaining / MESSAGE_LIFETIME_MS);
    Animated.timing(timerAnim, {
      toValue: 0,
      duration: remaining,
      useNativeDriver: false,
    }).start();

    // Update the seconds countdown
    const interval = setInterval(() => {
      const left = Math.ceil((expiresAt - Date.now()) / 1000);
      if (left <= 0) {
        clearInterval(interval);
        setSecondsLeft(0);
        Animated.timing(fadeOutAnim, {
          toValue: 0,
          duration: 400,
          useNativeDriver: true,
        }).start();
      } else {
        setSecondsLeft(left);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [expiresAt]);

  return (
    <Animated.View
      style={[
        styles.bubbleContainer,
        isOwn ? styles.bubbleRight : styles.bubbleLeft,
        { opacity: fadeOutAnim },
      ]}
    >
      {!isOwn && (
        <LinearGradient colors={COLORS.gradientAccent} style={styles.adminAvatar}>
          <Text style={styles.adminAvatarText}>A</Text>
        </LinearGradient>
      )}
      <View style={styles.bubbleWrap}>
        {!isOwn && <Text style={styles.senderName}>Support Team</Text>}
        {isOwn ? (
          <LinearGradient
            colors={COLORS.gradientPrimary}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={[styles.bubble, styles.bubbleOwn]}
          >
            <Text style={styles.bubbleTextOwn}>{message.text}</Text>
            <View style={styles.timerBarContainer}>
              <Animated.View
                style={[
                  styles.timerBar,
                  {
                    width: timerAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: ['0%', '100%'],
                    }),
                  },
                ]}
              />
            </View>
          </LinearGradient>
        ) : (
          <View style={[styles.bubble, styles.bubbleOther]}>
            <Text style={styles.bubbleTextOther}>{message.text}</Text>
          </View>
        )}
        <View style={styles.timestampRow}>
          <Text style={[styles.timestamp, isOwn && styles.timestampRight]}>
            {formatTime(message.timestamp)}
          </Text>
          {secondsLeft !== null && secondsLeft > 0 && (
            <Text style={styles.timerText}>
              🕐 {secondsLeft}s
            </Text>
          )}
        </View>
      </View>
    </Animated.View>
  );
});

const ChatScreen = ({ navigation }) => {
  const { user } = useAuth();
  const { getOrCreateConversation, sendMessage, getUserConversation, markReadByUser } = useChat();
  const [inputText, setInputText] = useState('');
  const [conversationId, setConversationId] = useState(null);
  const [, forceUpdate] = useState(0);
  const flatListRef = useRef(null);
  const isNearBottomRef = useRef(true);
  const isFirstRender = useRef(true);

  const conversation = getUserConversation(user?.uid);
  const allMessages = conversation?.messages || [];

  // Memoize visible messages based on message IDs to avoid unnecessary array recreation
  const visibleMessages = useMemo(() => {
    return allMessages.filter((msg) => {
      const msgTime = new Date(msg.timestamp).getTime();
      return Date.now() - msgTime < MESSAGE_LIFETIME_MS;
    });
  }, [allMessages, Math.floor(Date.now() / 2000)]); // only recompute every 2s

  // Re-render periodically to hide newly expired messages
  useEffect(() => {
    const interval = setInterval(() => {
      forceUpdate((n) => n + 1);
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (user) {
      const conv = getOrCreateConversation(user);
      setConversationId(conv.id);
      markReadByUser(conv.id);
    }
  }, [user]);

  // Stable message IDs to track actual changes
  const messageIds = useMemo(() => visibleMessages.map((m) => m.id).join(','), [visibleMessages]);

  useEffect(() => {
    if (conversationId) {
      markReadByUser(conversationId);
    }
  }, [messageIds]);

  const displayMessages = useMemo(() => [...visibleMessages].reverse(), [visibleMessages]);

  // Removed scrollToEnd logic because FlatList is now inverted (WhatsApp style)

  const handleSend = useCallback(() => {
    if (!inputText.trim() || !conversationId) return;
    sendMessage(conversationId, inputText, {
      uid: user.uid,
      displayName: user.displayName,
      role: 'user',
    });
    setInputText('');
  }, [inputText, conversationId, user, sendMessage]);

  const renderMessage = useCallback(({ item }) => (
    <MessageBubble
      message={item}
      isOwn={item.senderId === user?.uid}
    />
  ), [user?.uid]);

  const keyExtractor = useCallback((item) => item.id, []);

  const handleScroll = useCallback(({ nativeEvent }) => {
    const { layoutMeasurement, contentOffset, contentSize } = nativeEvent;
    const distanceFromBottom = contentSize.height - layoutMeasurement.height - contentOffset.y;
    isNearBottomRef.current = distanceFromBottom < 100;
  }, []);

  const renderEmpty = useCallback(() => (
    <View style={styles.emptyState}>
      <View style={styles.emptyIconWrap}>
        <Ionicons name="chatbubbles-outline" size={56} color={COLORS.textMuted} />
      </View>
      <Text style={styles.emptyTitle}>Start a Conversation</Text>
      <Text style={styles.emptySubtitle}>
        Ask us anything about your courses, account, or learning journey. We're here to help!
      </Text>
    </View>
  ), []);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.background} />

      {/* Header */}
      <View style={styles.header}>
        {navigation.canGoBack() && navigation.getState()?.type !== 'tab' ? (
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()} activeOpacity={0.7}>
            <Ionicons name="arrow-back" size={24} color={COLORS.text} />
          </TouchableOpacity>
        ) : (
          <View style={{ width: 8 }} />
        )}
        <LinearGradient colors={COLORS.gradientAccent} style={styles.headerAvatar}>
          <Ionicons name="headset" size={18} color={COLORS.white} />
        </LinearGradient>
        <View style={styles.headerInfo}>
          <Text style={styles.headerTitle}>Support Chat</Text>
          <View style={styles.onlineRow}>
            <View style={styles.onlineDot} />
            <Text style={styles.onlineText}>Online</Text>
          </View>
        </View>
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
            <View style={{ transform: [{ scaleY: -1 }] }}>
              {renderEmpty()}
            </View>
          }
          onScroll={handleScroll}
          scrollEventThrottle={200}
          removeClippedSubviews={Platform.OS === 'android'}
          maxToRenderPerBatch={15}
          windowSize={11}
          initialNumToRender={20}
        />

        {/* Input Bar */}
        <View style={styles.inputBar}>
          <View style={styles.inputWrap}>
            <TextInput
              style={styles.input}
              value={inputText}
              onChangeText={setInputText}
              placeholder="Type a message..."
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
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: SPACING.huge,
    paddingBottom: SPACING.md,
    paddingHorizontal: SPACING.lg,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.cardBorder,
  },
  backBtn: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: COLORS.surfaceLight,
    alignItems: 'center', justifyContent: 'center',
    marginRight: SPACING.md,
  },
  headerAvatar: {
    width: 40, height: 40, borderRadius: 20,
    alignItems: 'center', justifyContent: 'center',
    marginRight: SPACING.md,
  },
  headerInfo: { flex: 1 },
  headerTitle: { fontSize: FONT_SIZES.lg, fontWeight: FONT_WEIGHTS.bold, color: COLORS.text },
  onlineRow: { flexDirection: 'row', alignItems: 'center', marginTop: 2 },
  onlineDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: COLORS.success, marginRight: SPACING.xs },
  onlineText: { fontSize: FONT_SIZES.xs, color: COLORS.success, fontWeight: FONT_WEIGHTS.medium },
  // Messages
  messagesList: { padding: SPACING.lg, paddingBottom: SPACING.sm },
  messagesListEmpty: { flex: 1, justifyContent: 'center' },
  bubbleContainer: { flexDirection: 'row', marginBottom: SPACING.md, maxWidth: '80%' },
  bubbleRight: { alignSelf: 'flex-end', flexDirection: 'row-reverse' },
  bubbleLeft: { alignSelf: 'flex-start' },
  bubbleWrap: { flex: 1 },
  adminAvatar: {
    width: 28, height: 28, borderRadius: 14,
    alignItems: 'center', justifyContent: 'center',
    marginRight: SPACING.sm, marginTop: SPACING.xl,
  },
  adminAvatarText: { fontSize: FONT_SIZES.xs, fontWeight: FONT_WEIGHTS.bold, color: COLORS.white },
  senderName: { fontSize: FONT_SIZES.xs, color: COLORS.textMuted, marginBottom: 3, fontWeight: FONT_WEIGHTS.medium },
  bubble: { borderRadius: BORDER_RADIUS.lg, padding: SPACING.md, paddingHorizontal: SPACING.lg },
  bubbleOwn: { borderBottomRightRadius: 4 },
  bubbleOther: { backgroundColor: COLORS.surface, borderBottomLeftRadius: 4, borderWidth: 1, borderColor: COLORS.cardBorder },
  bubbleTextOwn: { fontSize: FONT_SIZES.md, color: COLORS.white, lineHeight: 22 },
  bubbleTextOther: { fontSize: FONT_SIZES.md, color: COLORS.text, lineHeight: 22 },
  timestamp: { fontSize: 10, color: COLORS.textMuted, marginTop: 4, marginLeft: 4 },
  timestampRight: { textAlign: 'right', marginRight: 4, marginLeft: 0 },
  timestampRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end', gap: 6 },
  timerBarContainer: {
    height: 3,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 2,
    marginTop: SPACING.xs,
    overflow: 'hidden',
  },
  timerBar: {
    height: '100%',
    backgroundColor: 'rgba(255,255,255,0.7)',
    borderRadius: 2,
  },
  timerText: {
    fontSize: 10,
    color: COLORS.textMuted,
    marginTop: 4,
    fontWeight: FONT_WEIGHTS.medium,
  },
  // Empty
  emptyState: { alignItems: 'center', paddingHorizontal: SPACING.xxxl },
  emptyIconWrap: {
    width: 100, height: 100, borderRadius: 50,
    backgroundColor: COLORS.surface, alignItems: 'center', justifyContent: 'center',
    marginBottom: SPACING.xl, borderWidth: 1, borderColor: COLORS.cardBorder,
  },
  emptyTitle: { fontSize: FONT_SIZES.xxl, fontWeight: FONT_WEIGHTS.bold, color: COLORS.text, marginBottom: SPACING.sm },
  emptySubtitle: { fontSize: FONT_SIZES.md, color: COLORS.textMuted, textAlign: 'center', lineHeight: 22 },
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
    alignItems: 'center', justifyContent: 'center',
    ...SHADOWS.small,
  },
});

export default ChatScreen;
