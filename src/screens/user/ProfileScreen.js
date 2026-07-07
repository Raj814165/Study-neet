import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Animated,
  StatusBar,
  Alert,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { useCourses } from '../../context/CourseContext';
import { CourseCard } from '../../components/CourseComponents';
import { COLORS, SPACING, FONT_SIZES, FONT_WEIGHTS, BORDER_RADIUS, SHADOWS } from '../../theme/theme';

const ProfileScreen = ({ navigation }) => {
  const { user, isAdmin, logout, unenrollFromCourse } = useAuth();
  const { courses } = useCourses();

  const enrolledCoursesList = (user?.enrolledCourses || [])
    .map(courseOrId => {
      if (typeof courseOrId === 'string' || !courseOrId.title) {
        return courses.find(c => (c._id || c.id) === (courseOrId._id || courseOrId.id || courseOrId));
      }
      return courseOrId;
    })
    .filter(Boolean);

  const handleRemoveCourse = (courseId, courseTitle) => {
    Alert.alert(
      "Remove Course",
      `Are you sure you want to unenroll from "${courseTitle || 'this course'}"?`,
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Remove", 
          style: "destructive",
          onPress: async () => {
            const res = await unenrollFromCourse(courseId);
            if (!res.success) {
              Alert.alert("Error", res.error);
            }
          }
        }
      ]
    );
  };

  const headerAnim = useRef(new Animated.Value(0)).current;
  const statsAnim = useRef(new Animated.Value(0)).current;
  const settingsAnim = useRef(new Animated.Value(0)).current;
  const logoutAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.stagger(140, [
      Animated.spring(headerAnim, { toValue: 1, useNativeDriver: true, tension: 50, friction: 8 }),
      Animated.spring(statsAnim, { toValue: 1, useNativeDriver: true, tension: 50, friction: 8 }),
      Animated.spring(settingsAnim, { toValue: 1, useNativeDriver: true, tension: 50, friction: 8 }),
      Animated.spring(logoutAnim, { toValue: 1, useNativeDriver: true, tension: 50, friction: 8 }),
    ]).start();
  }, []);

  const getAnimStyle = (animValue) => ({
    opacity: animValue,
    transform: [
      {
        translateY: animValue.interpolate({
          inputRange: [0, 1],
          outputRange: [30, 0],
        }),
      },
    ],
  });

  const displayName = user?.displayName || 'Student';
  const email = user?.email || 'student@example.com';
  const firstLetter = displayName.charAt(0).toUpperCase();

  const enrolledCourses = user?.enrolledCourses || [];
  const enrolledCount = enrolledCourses.length;

  const totalHours = enrolledCourses.reduce((total, course) => {
    if (course && course.duration) {
      const match = course.duration.match(/(\d+)/);
      if (match) {
        return total + parseInt(match[0], 10);
      }
    }
    return total;
  }, 0);

  const stats = [
    { label: 'Enrolled', value: enrolledCount.toString(), icon: 'book' },
    { label: 'Hours', value: totalHours.toString(), icon: 'time' },
    { label: 'Certificates', value: '0', icon: 'ribbon' },
  ];

  const settingsSections = [
    {
      title: 'Account',
      items: [
        { icon: 'person-outline', label: 'Edit Profile', onPress: () => navigation.navigate('EditProfile') },
      ],
    },
    {
      title: 'Preferences',
      items: [
        { icon: 'download-outline', label: 'Download Settings', onPress: () => navigation.navigate('DownloadSettings') },
      ],
    },
    {
      title: 'Support',
      items: [
        { icon: 'help-circle-outline', label: 'Help & Support', onPress: () => navigation.navigate('Support') },
        { icon: 'information-circle-outline', label: 'About', onPress: () => navigation.navigate('About') },
      ],
    },
  ];

  const handleLogout = () => {
    if (Platform.OS === 'web') {
      const result = window.confirm('Sign Out\n\nAre you sure you want to sign out?');
      if (result) {
        logout();
      }
    } else {
      Alert.alert(
        'Sign Out',
        'Are you sure you want to sign out?',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Sign Out',
            style: 'destructive',
            onPress: async () => {
              await logout();
            },
          },
        ]
      );
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.background} />
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile Header */}
        <Animated.View style={getAnimStyle(headerAnim)}>
          <LinearGradient
            colors={[COLORS.primaryDark, COLORS.primary + '40', COLORS.background]}
            style={styles.headerGradient}
          >
            <View style={styles.avatarContainer}>
              <LinearGradient
                colors={COLORS.gradientPrimary}
                style={styles.avatarOuter}
              >
                <View style={styles.avatarInner}>
                  <Text style={styles.avatarText}>{firstLetter}</Text>
                </View>
              </LinearGradient>
            </View>
            <Text style={styles.userName}>{displayName}</Text>
            <Text style={styles.userEmail}>{email}</Text>

            {isAdmin && (
              <View style={styles.adminBadge}>
                <Ionicons name="shield-checkmark" size={14} color={COLORS.accent} />
                <Text style={styles.adminBadgeText}>Admin</Text>
              </View>
            )}
          </LinearGradient>
        </Animated.View>

        {/* Stats Row */}
        <Animated.View style={[styles.statsContainer, getAnimStyle(statsAnim)]}>
          {stats.map((stat, index) => (
            <View key={stat.label} style={styles.statItem}>
              <View style={styles.statIconContainer}>
                <Ionicons name={stat.icon} size={20} color={COLORS.primary} />
              </View>
              <Text style={styles.statValue}>{stat.value}</Text>
              <Text style={styles.statLabel}>{stat.label}</Text>
              {index < stats.length - 1 && <View style={styles.statDivider} />}
            </View>
          ))}
        </Animated.View>

        {/* My Enrolled Courses */}
        {enrolledCoursesList.length > 0 && (
          <Animated.View style={[styles.enrolledSection, getAnimStyle(settingsAnim)]}>
            <View style={styles.enrolledHeader}>
              <Text style={styles.enrolledTitle}>My Enrolled Courses</Text>
              <View style={styles.enrolledBadge}>
                <Text style={styles.enrolledBadgeText}>{enrolledCoursesList.length}</Text>
              </View>
            </View>
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.enrolledScrollContent}
            >
              {enrolledCoursesList.map((course, idx) => (
                <View key={course._id || course.id || idx} style={styles.enrolledCardWrapper}>
                  <CourseCard
                    course={course}
                    onPress={() => navigation.navigate('CourseDetail', { courseId: course._id || course.id })}
                    index={idx}
                  />
                  <TouchableOpacity
                    style={styles.removeCourseBtn}
                    onPress={() => handleRemoveCourse(course._id || course.id, course.title)}
                    activeOpacity={0.8}
                    hitSlop={{ top: 10, right: 10, bottom: 10, left: 10 }}
                  >
                    <Ionicons name="close" size={16} color={COLORS.white} />
                  </TouchableOpacity>
                </View>
              ))}
            </ScrollView>
          </Animated.View>
        )}

        {/* Admin Panel Button */}
        {isAdmin && (
          <Animated.View style={[styles.adminButtonContainer, getAnimStyle(settingsAnim)]}>
            <TouchableOpacity
              style={styles.adminButton}
              activeOpacity={0.85}
              onPress={() => navigation.navigate('AdminDashboard')}
            >
              <LinearGradient
                colors={COLORS.gradientHero}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.adminButtonGradient}
              >
                <View style={styles.adminButtonLeft}>
                  <Ionicons name="shield-checkmark" size={22} color={COLORS.white} />
                  <View style={styles.adminButtonTextContainer}>
                    <Text style={styles.adminButtonTitle}>Admin Panel</Text>
                    <Text style={styles.adminButtonSubtitle}>Manage courses & users</Text>
                  </View>
                </View>
                <Ionicons name="arrow-forward" size={20} color={COLORS.white} />
              </LinearGradient>
            </TouchableOpacity>
          </Animated.View>
        )}

        {/* Settings Sections */}
        <Animated.View style={getAnimStyle(settingsAnim)}>
          {settingsSections.map((section) => (
            <View key={section.title} style={styles.settingsSection}>
              <Text style={styles.settingsSectionTitle}>{section.title}</Text>
              <View style={styles.settingsCard}>
                {section.items.map((item, index) => (
                  <TouchableOpacity
                    key={item.label}
                    style={[
                      styles.settingsItem,
                      index < section.items.length - 1 && styles.settingsItemBorder,
                    ]}
                    onPress={item.onPress}
                    activeOpacity={0.7}
                  >
                    <View style={styles.settingsItemLeft}>
                      <View style={styles.settingsIconContainer}>
                        <Ionicons name={item.icon} size={20} color={COLORS.primary} />
                      </View>
                      <Text style={styles.settingsItemLabel}>{item.label}</Text>
                    </View>
                    <Ionicons name="chevron-forward" size={18} color={COLORS.textMuted} />
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          ))}
        </Animated.View>

        {/* Logout Button */}
        <Animated.View style={[styles.logoutContainer, getAnimStyle(logoutAnim)]}>
          <TouchableOpacity
            style={styles.logoutButton}
            onPress={handleLogout}
            activeOpacity={0.8}
          >
            <Ionicons name="log-out-outline" size={20} color={COLORS.error} />
            <Text style={styles.logoutText}>Sign Out</Text>
          </TouchableOpacity>
        </Animated.View>

        <Text style={styles.versionText}>StudyApp v1.0.0</Text>

        <View style={{ height: SPACING.huge }} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: SPACING.xxxl,
  },
  // Header
  headerGradient: {
    alignItems: 'center',
    paddingTop: SPACING.xxxl,
    paddingBottom: SPACING.xxxl,
    paddingHorizontal: SPACING.xl,
  },
  avatarContainer: {
    marginBottom: SPACING.lg,
    ...SHADOWS.glow,
  },
  avatarOuter: {
    width: 96,
    height: 96,
    borderRadius: 48,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 3,
  },
  avatarInner: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: FONT_SIZES.hero,
    fontWeight: FONT_WEIGHTS.bold,
    color: COLORS.primary,
  },
  userName: {
    fontSize: FONT_SIZES.xxl,
    fontWeight: FONT_WEIGHTS.bold,
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  userEmail: {
    fontSize: FONT_SIZES.md,
    fontWeight: FONT_WEIGHTS.regular,
    color: COLORS.textSecondary,
  },
  adminBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: SPACING.md,
    backgroundColor: COLORS.accent + '20',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.round,
    gap: SPACING.xs,
    borderWidth: 1,
    borderColor: COLORS.accent + '40',
  },
  adminBadgeText: {
    fontSize: FONT_SIZES.sm,
    fontWeight: FONT_WEIGHTS.semibold,
    color: COLORS.accent,
  },
  // Stats
  statsContainer: {
    flexDirection: 'row',
    marginHorizontal: SPACING.xl,
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.xl,
    marginTop: -SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    ...SHADOWS.medium,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
    position: 'relative',
  },
  statIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.primary + '15',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  statValue: {
    fontSize: FONT_SIZES.xxl,
    fontWeight: FONT_WEIGHTS.extrabold,
    color: COLORS.text,
  },
  statLabel: {
    fontSize: FONT_SIZES.xs,
    fontWeight: FONT_WEIGHTS.medium,
    color: COLORS.textMuted,
    marginTop: SPACING.xs,
  },
  statDivider: {
    position: 'absolute',
    right: 0,
    top: '15%',
    height: '70%',
    width: 1,
    backgroundColor: COLORS.cardBorder,
  },
  // Admin Button
  adminButtonContainer: {
    paddingHorizontal: SPACING.xl,
    marginTop: SPACING.xxl,
  },
  adminButton: {
    borderRadius: BORDER_RADIUS.lg,
    overflow: 'hidden',
    ...SHADOWS.large,
  },
  adminButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.lg,
  },
  adminButtonLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
  },
  adminButtonTextContainer: {
    gap: 2,
  },
  adminButtonTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: FONT_WEIGHTS.bold,
    color: COLORS.white,
  },
  adminButtonSubtitle: {
    fontSize: FONT_SIZES.xs,
    fontWeight: FONT_WEIGHTS.regular,
    color: 'rgba(255,255,255,0.7)',
  },
  // Settings
  settingsSection: {
    paddingHorizontal: SPACING.xl,
    marginTop: SPACING.xxl,
  },
  settingsSectionTitle: {
    fontSize: FONT_SIZES.sm,
    fontWeight: FONT_WEIGHTS.semibold,
    color: COLORS.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: SPACING.md,
    marginLeft: SPACING.xs,
  },
  settingsCard: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    overflow: 'hidden',
  },
  settingsItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: SPACING.lg,
    paddingHorizontal: SPACING.lg,
  },
  settingsItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: COLORS.cardBorder,
  },
  settingsItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
  },
  settingsIconContainer: {
    width: 36,
    height: 36,
    borderRadius: BORDER_RADIUS.sm,
    backgroundColor: COLORS.primary + '15',
    justifyContent: 'center',
    alignItems: 'center',
  },
  settingsItemLabel: {
    fontSize: FONT_SIZES.md,
    fontWeight: FONT_WEIGHTS.medium,
    color: COLORS.text,
  },
  // Logout
  logoutContainer: {
    paddingHorizontal: SPACING.xl,
    marginTop: SPACING.xxxl,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.lg,
    backgroundColor: COLORS.error + '12',
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.error + '30',
    gap: SPACING.sm,
  },
  logoutText: {
    fontSize: FONT_SIZES.lg,
    fontWeight: FONT_WEIGHTS.semibold,
    color: COLORS.error,
  },
  // Version
  versionText: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textMuted,
    textAlign: 'center',
    marginTop: SPACING.xxl,
    fontWeight: FONT_WEIGHTS.regular,
  },
  // Enrolled Courses
  enrolledSection: {
    marginTop: SPACING.xl,
    marginBottom: SPACING.sm,
  },
  enrolledHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.xl,
    marginBottom: SPACING.md,
    gap: SPACING.sm,
  },
  enrolledTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: FONT_WEIGHTS.bold,
    color: COLORS.text,
  },
  enrolledBadge: {
    backgroundColor: COLORS.primary + '20',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  enrolledBadgeText: {
    fontSize: FONT_SIZES.xs,
    fontWeight: FONT_WEIGHTS.bold,
    color: COLORS.primary,
  },
  enrolledScrollContent: {
    paddingHorizontal: SPACING.xl,
    gap: SPACING.md,
    paddingBottom: SPACING.sm,
  },
  enrolledCardWrapper: {
    width: 260,
    position: 'relative',
  },
  removeCourseBtn: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(0,0,0,0.6)',
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
});

export default ProfileScreen;
