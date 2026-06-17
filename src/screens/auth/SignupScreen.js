import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Animated,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import {
  COLORS,
  SPACING,
  FONT_SIZES,
  FONT_WEIGHTS,
  BORDER_RADIUS,
  SHADOWS,
} from '../../theme/theme';

const { width, height } = Dimensions.get('window');

const SignupScreen = ({ navigation }) => {
  const { signup } = useAuth();

  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Animated values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(40)).current;
  const logoScale = useRef(new Animated.Value(0.8)).current;
  const shakeAnim = useRef(new Animated.Value(0)).current;
  const errorOpacity = useRef(new Animated.Value(0)).current;
  const buttonScale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(logoScale, {
        toValue: 1,
        friction: 4,
        tension: 60,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);



  const triggerShake = () => {
    Animated.sequence([
      Animated.timing(shakeAnim, { toValue: 12, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -12, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 6, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -6, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 0, duration: 50, useNativeDriver: true }),
    ]).start();
  };

  const showError = (message) => {
    setError(message);
    Animated.timing(errorOpacity, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
    triggerShake();
  };

  const hideError = () => {
    Animated.timing(errorOpacity, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start(() => setError(''));
  };

  const handleSignup = async () => {
    hideError();

    if (!displayName.trim()) {
      showError('Please enter your display name.');
      return;
    }
    if (!email.trim()) {
      showError('Please enter your email address.');
      return;
    }
    if (!password) {
      showError('Please enter a password.');
      return;
    }
    if (password.length < 6) {
      showError('Password must be at least 6 characters long.');
      return;
    }
    if (password !== confirmPassword) {
      showError('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      const result = await signup(email.trim(), password, displayName.trim(), 'user');
      if (result && !result.success) {
        const errMsg = result.error || 'Signup failed. Please try again.';
        const message =
          errMsg.includes('email-already-in-use')
            ? 'This email is already registered.'
            : errMsg.includes('invalid-email')
            ? 'Please enter a valid email address.'
            : errMsg.includes('weak-password')
            ? 'Password is too weak. Use at least 6 characters.'
            : errMsg;
        showError(message);
      }
    } catch (err) {
      showError(err.message || 'Signup failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleButtonPressIn = () => {
    Animated.spring(buttonScale, {
      toValue: 0.96,
      useNativeDriver: true,
    }).start();
  };

  const handleButtonPressOut = () => {
    Animated.spring(buttonScale, {
      toValue: 1,
      friction: 3,
      tension: 100,
      useNativeDriver: true,
    }).start();
  };

  const clearErrorOnChange = (setter) => (text) => {
    setter(text);
    if (error) hideError();
  };



  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.background} />
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          bounces={false}
        >
          {/* Hero Gradient Header */}
          <LinearGradient
            colors={COLORS.gradientHero || ['#6C5CE7', '#a855f7', '#6C5CE7']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.heroGradient}
          >
            <View style={styles.heroOverlay}>
              <Animated.View
                style={[
                  styles.logoContainer,
                  { transform: [{ scale: logoScale }] },
                ]}
              >
                <View style={styles.logoIconWrapper}>
                  <Ionicons name="book" size={34} color="#FFFFFF" />
                </View>
                <Text style={styles.appName}>StudyHub</Text>
                <Text style={styles.appTagline}>Learn Anything, Anywhere</Text>
              </Animated.View>
            </View>
          </LinearGradient>

          {/* Form Area */}
          <Animated.View
            style={[
              styles.formContainer,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              },
            ]}
          >
            <Text style={styles.welcomeTitle}>Create Account</Text>
            <Text style={styles.welcomeSubtitle}>
              Join thousands of learners on StudyHub
            </Text>

            {/* Error Message */}
            <Animated.View
              style={[
                styles.errorContainer,
                {
                  opacity: errorOpacity,
                  transform: [{ translateX: shakeAnim }],
                  display: error ? 'flex' : 'none',
                },
              ]}
            >
              <Ionicons
                name="alert-circle"
                size={18}
                color={COLORS.error || '#FF6B6B'}
              />
              <Text style={styles.errorText}>{error}</Text>
            </Animated.View>

            {/* Display Name Input */}
            <View style={styles.inputWrapper}>
              <View style={styles.inputIconContainer}>
                <Ionicons
                  name="person-outline"
                  size={20}
                  color={COLORS.textMuted}
                />
              </View>
              <TextInput
                style={styles.input}
                placeholder="Display Name"
                placeholderTextColor={COLORS.textMuted}
                value={displayName}
                onChangeText={clearErrorOnChange(setDisplayName)}
                autoCapitalize="words"
                autoCorrect={false}
                editable={!loading}
              />
            </View>

            {/* Email Input */}
            <View style={styles.inputWrapper}>
              <View style={styles.inputIconContainer}>
                <Ionicons
                  name="mail-outline"
                  size={20}
                  color={COLORS.textMuted}
                />
              </View>
              <TextInput
                style={styles.input}
                placeholder="Email Address"
                placeholderTextColor={COLORS.textMuted}
                value={email}
                onChangeText={clearErrorOnChange(setEmail)}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                editable={!loading}
              />
            </View>

            {/* Password Input */}
            <View style={styles.inputWrapper}>
              <View style={styles.inputIconContainer}>
                <Ionicons
                  name="lock-closed-outline"
                  size={20}
                  color={COLORS.textMuted}
                />
              </View>
              <TextInput
                style={[styles.input, styles.passwordInput]}
                placeholder="Password (min 6 characters)"
                placeholderTextColor={COLORS.textMuted}
                value={password}
                onChangeText={clearErrorOnChange(setPassword)}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                editable={!loading}
              />
              <TouchableOpacity
                style={styles.eyeButton}
                onPress={() => setShowPassword(!showPassword)}
                activeOpacity={0.7}
                disabled={loading}
              >
                <Ionicons
                  name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                  size={20}
                  color={COLORS.textMuted}
                />
              </TouchableOpacity>
            </View>

            {/* Confirm Password Input */}
            <View style={styles.inputWrapper}>
              <View style={styles.inputIconContainer}>
                <Ionicons
                  name="shield-checkmark-outline"
                  size={20}
                  color={COLORS.textMuted}
                />
              </View>
              <TextInput
                style={[styles.input, styles.passwordInput]}
                placeholder="Confirm Password"
                placeholderTextColor={COLORS.textMuted}
                value={confirmPassword}
                onChangeText={clearErrorOnChange(setConfirmPassword)}
                secureTextEntry={!showConfirmPassword}
                autoCapitalize="none"
                editable={!loading}
              />
              <TouchableOpacity
                style={styles.eyeButton}
                onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                activeOpacity={0.7}
                disabled={loading}
              >
                <Ionicons
                  name={showConfirmPassword ? 'eye-off-outline' : 'eye-outline'}
                  size={20}
                  color={COLORS.textMuted}
                />
              </TouchableOpacity>
            </View>



            {/* Signup Button */}
            <Animated.View style={{ transform: [{ scale: buttonScale }] }}>
              <TouchableOpacity
                activeOpacity={0.9}
                onPress={handleSignup}
                onPressIn={handleButtonPressIn}
                onPressOut={handleButtonPressOut}
                disabled={loading}
              >
                <LinearGradient
                  colors={COLORS.gradientPrimary || ['#6C5CE7', '#a855f7']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.signupButton}
                >
                  {loading ? (
                    <ActivityIndicator size="small" color="#FFFFFF" />
                  ) : (
                    <>
                      <Text style={styles.signupButtonText}>Create Account</Text>
                      <Ionicons
                        name="arrow-forward"
                        size={20}
                        color="#FFFFFF"
                        style={{ marginLeft: SPACING.xs }}
                      />
                    </>
                  )}
                </LinearGradient>
              </TouchableOpacity>
            </Animated.View>

            {/* Login Link */}
            <View style={styles.footerContainer}>
              <Text style={styles.footerText}>Already have an account? </Text>
              <TouchableOpacity
                onPress={() => navigation.navigate('Login')}
                activeOpacity={0.7}
                disabled={loading}
              >
                <Text style={styles.footerLink}>Login</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  heroGradient: {
    width: '100%',
    height: height * 0.28,
    borderBottomLeftRadius: 36,
    borderBottomRightRadius: 36,
  },
  heroOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.15)',
    borderBottomLeftRadius: 36,
    borderBottomRightRadius: 36,
  },
  logoContainer: {
    alignItems: 'center',
  },
  logoIconWrapper: {
    width: 64,
    height: 64,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.sm,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  appName: {
    fontSize: 30,
    fontWeight: FONT_WEIGHTS.bold || '700',
    color: '#FFFFFF',
    letterSpacing: 1,
  },
  appTagline: {
    fontSize: FONT_SIZES.sm || 14,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 4,
    fontWeight: FONT_WEIGHTS.medium || '500',
    letterSpacing: 0.5,
  },
  formContainer: {
    flex: 1,
    paddingHorizontal: SPACING.xl,
    paddingTop: SPACING.lg,
    paddingBottom: SPACING.xl,
  },
  welcomeTitle: {
    fontSize: FONT_SIZES.xxl || 28,
    fontWeight: FONT_WEIGHTS.bold || '700',
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  welcomeSubtitle: {
    fontSize: FONT_SIZES.sm || 14,
    color: COLORS.textSecondary,
    marginBottom: SPACING.lg,
    lineHeight: 20,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,107,107,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(255,107,107,0.25)',
    borderRadius: BORDER_RADIUS.md || 12,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm + 2,
    marginBottom: SPACING.md,
  },
  errorText: {
    color: COLORS.error || '#FF6B6B',
    fontSize: FONT_SIZES.sm || 14,
    marginLeft: SPACING.sm,
    flex: 1,
    fontWeight: FONT_WEIGHTS.medium || '500',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.md || 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
    marginBottom: SPACING.md,
    height: 56,
    ...SHADOWS.small,
  },
  inputIconContainer: {
    width: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    color: COLORS.text,
    fontSize: FONT_SIZES.md || 16,
    paddingRight: SPACING.md,
    height: '100%',
  },
  passwordInput: {
    paddingRight: 50,
  },
  eyeButton: {
    position: 'absolute',
    right: 0,
    width: 50,
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  roleSelectorContainer: {
    marginBottom: SPACING.lg,
    marginTop: SPACING.xs,
  },
  roleSelectorLabel: {
    fontSize: FONT_SIZES.sm || 14,
    color: COLORS.textSecondary,
    marginBottom: SPACING.sm,
    fontWeight: FONT_WEIGHTS.medium || '500',
  },
  roleSwitch: {
    flexDirection: 'row',
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.md || 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
    height: 50,
    padding: 4,
    position: 'relative',
    ...SHADOWS.small,
  },
  roleSwitchIndicator: {
    position: 'absolute',
    top: 4,
    left: 4,
    height: 42,
    borderRadius: (BORDER_RADIUS.md || 12) - 4,
    overflow: 'hidden',
  },
  roleSwitchIndicatorGradient: {
    flex: 1,
    borderRadius: (BORDER_RADIUS.md || 12) - 4,
  },
  roleSwitchOption: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    height: 42,
    zIndex: 1,
  },
  roleSwitchText: {
    fontSize: FONT_SIZES.sm || 14,
    color: COLORS.textMuted,
    fontWeight: FONT_WEIGHTS.medium || '500',
  },
  roleSwitchTextActive: {
    color: '#FFFFFF',
    fontWeight: FONT_WEIGHTS.bold || '700',
  },
  signupButton: {
    height: 56,
    borderRadius: BORDER_RADIUS.md || 12,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    ...SHADOWS.medium,
  },
  signupButtonText: {
    color: '#FFFFFF',
    fontSize: FONT_SIZES.md || 16,
    fontWeight: FONT_WEIGHTS.bold || '700',
    letterSpacing: 0.5,
  },
  footerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: SPACING.xl,
    paddingBottom: SPACING.md,
  },
  footerText: {
    color: COLORS.textSecondary,
    fontSize: FONT_SIZES.sm || 14,
  },
  footerLink: {
    color: COLORS.primary,
    fontSize: FONT_SIZES.sm || 14,
    fontWeight: FONT_WEIGHTS.bold || '700',
  },
});

export default SignupScreen;
