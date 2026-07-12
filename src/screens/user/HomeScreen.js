import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  TextInput,
  Animated,
  RefreshControl,
  StatusBar,
  Dimensions,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { useCourses } from '../../context/CourseContext';
import { COLORS, SPACING, FONT_SIZES, FONT_WEIGHTS, BORDER_RADIUS, SHADOWS } from '../../theme/theme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const FEATURED_CARD_WIDTH = 280;
const CONTINUE_CARD_WIDTH = 200;

const HomeScreen = ({ navigation }) => {
  const { user } = useAuth();
  const { courses, categories, loading, getCoursesByCategory, searchCourses, refreshCourses } = useCourses();

  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  // Animation refs
  const headerAnim = useRef(new Animated.Value(0)).current;
  const searchAnim = useRef(new Animated.Value(0)).current;
  const categoryAnim = useRef(new Animated.Value(0)).current;
  const featuredAnim = useRef(new Animated.Value(0)).current;
  const continueAnim = useRef(new Animated.Value(0)).current;
  const popularAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.stagger(120, [
      Animated.spring(headerAnim, { toValue: 1, useNativeDriver: true, tension: 50, friction: 8 }),
      Animated.spring(searchAnim, { toValue: 1, useNativeDriver: true, tension: 50, friction: 8 }),
      Animated.spring(categoryAnim, { toValue: 1, useNativeDriver: true, tension: 50, friction: 8 }),
      Animated.spring(featuredAnim, { toValue: 1, useNativeDriver: true, tension: 50, friction: 8 }),
      Animated.spring(continueAnim, { toValue: 1, useNativeDriver: true, tension: 50, friction: 8 }),
      Animated.spring(popularAnim, { toValue: 1, useNativeDriver: true, tension: 50, friction: 8 }),
    ]).start();
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await refreshCourses();
    } catch (error) {
      console.log('Error refreshing courses:', error.message);
    } finally {
      setRefreshing(false);
    }
  }, [refreshCourses]);

  const enrolledCoursesList = (user?.enrolledCourses || [])
    .map(courseOrId => {
      if (typeof courseOrId === 'string' || !courseOrId.title) {
        return courses.find(c => (c._id || c.id) === (courseOrId._id || courseOrId.id || courseOrId));
      }
      return courseOrId;
    })
    .filter(Boolean);

  const filteredCourses = selectedCategory === 'All' ? courses : getCoursesByCategory(selectedCategory);
  const featuredCourses = filteredCourses.filter((c) => c.featured || c.rating >= 4).slice(0, 8);
  const continueCourses = enrolledCoursesList.slice(0, 5);
  const popularCourses = filteredCourses.slice(0, 10);

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
  const firstLetter = displayName.charAt(0).toUpperCase();

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  const handleCoursePress = (course) => {
    navigation.navigate('CourseDetail', { courseId: course.id });
  };

  const renderStars = (rating = 0) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalf = rating - fullStars >= 0.5;
    for (let i = 0; i < 5; i++) {
      if (i < fullStars) {
        stars.push(<Ionicons key={i} name="star" size={12} color={COLORS.warning} />);
      } else if (i === fullStars && hasHalf) {
        stars.push(<Ionicons key={i} name="star-half" size={12} color={COLORS.warning} />);
      } else {
        stars.push(<Ionicons key={i} name="star-outline" size={12} color={COLORS.textMuted} />);
      }
    }
    return stars;
  };

  const renderDifficultyBadge = (difficulty) => {
    const colorMap = {
      Beginner: COLORS.success,
      Intermediate: COLORS.warning,
      Advanced: COLORS.error,
    };
    const color = colorMap[difficulty] || COLORS.primary;
    return (
      <View style={[styles.difficultyBadge, { backgroundColor: color + '25', borderColor: color + '50' }]}>
        <Text style={[styles.difficultyText, { color }]}>{difficulty || 'General'}</Text>
      </View>
    );
  };

  const renderFeaturedCard = (course, index) => (
    <TouchableOpacity
      key={course.id || course._id || index}
      style={styles.featuredCard}
      onPress={() => handleCoursePress(course)}
      activeOpacity={0.85}
    >
      <Image
        source={{ uri: course.thumbnail || 'https://via.placeholder.com/280x180/13131A/6C5CE7?text=Course' }}
        style={styles.featuredImage}
        resizeMode="cover"
      />
      <LinearGradient
        colors={['transparent', 'rgba(0,0,0,0.85)', 'rgba(0,0,0,0.95)']}
        style={styles.featuredGradient}
      >
        <View style={styles.featuredBadgeRow}>
          {renderDifficultyBadge(course.difficulty)}
          {course.duration && (
            <View style={styles.durationBadge}>
              <Ionicons name="time-outline" size={10} color={COLORS.textSecondary} />
              <Text style={styles.durationText}>{course.duration}</Text>
            </View>
          )}
        </View>
        <Text style={styles.featuredTitle} numberOfLines={2}>{course.title}</Text>
        <View style={styles.featuredMeta}>
          <Text style={styles.featuredInstructor} numberOfLines={1}>{course.instructor || 'Instructor'}</Text>
          <View style={styles.ratingRow}>{renderStars(course.rating)}</View>
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );

  const renderContinueCard = (course, index) => (
    <TouchableOpacity
      key={course.id || course._id || index}
      style={styles.continueCard}
      onPress={() => handleCoursePress(course)}
      activeOpacity={0.85}
    >
      <Image
        source={{ uri: course.thumbnail || 'https://via.placeholder.com/200x120/13131A/6C5CE7?text=Course' }}
        style={styles.continueImage}
        resizeMode="cover"
      />
      <LinearGradient
        colors={['transparent', 'rgba(0,0,0,0.9)']}
        style={styles.continueGradient}
      >
        <Text style={styles.continueTitle} numberOfLines={2}>{course.title}</Text>
        <View style={styles.progressBarContainer}>
          <View style={[styles.progressBar, { width: `${Math.floor(Math.random() * 70 + 10)}%` }]} />
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );

  const renderPopularCard = (course, index) => (
    <TouchableOpacity
      key={course.id || course._id || index}
      style={styles.popularCard}
      onPress={() => handleCoursePress(course)}
      activeOpacity={0.85}
    >
      <Image
        source={{ uri: course.thumbnail || 'https://via.placeholder.com/120x80/13131A/6C5CE7?text=Course' }}
        style={styles.popularImage}
        resizeMode="cover"
      />
      <View style={styles.popularInfo}>
        <Text style={styles.popularTitle} numberOfLines={2}>{course.title}</Text>
        <Text style={styles.popularInstructor} numberOfLines={1}>{course.instructor || 'Instructor'}</Text>
        <View style={styles.popularBottom}>
          <View style={styles.ratingRow}>{renderStars(course.rating)}</View>
          <Text style={styles.ratingNumber}>{(course.rating || 0).toFixed(1)}</Text>
        </View>
        <View style={styles.popularBadges}>
          {renderDifficultyBadge(course.difficulty)}
          {course.duration && (
            <View style={styles.durationBadge}>
              <Ionicons name="time-outline" size={10} color={COLORS.textSecondary} />
              <Text style={styles.durationText}>{course.duration}</Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <StatusBar barStyle="light-content" backgroundColor={COLORS.background} />
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.background} />
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={COLORS.primary}
            colors={[COLORS.primary]}
            progressBackgroundColor={COLORS.surface}
          />
        }
      >
        {/* Header */}
        <Animated.View style={[styles.header, getAnimStyle(headerAnim)]}>
          <View style={styles.headerLeft}>
            <Text style={styles.greeting}>{getGreeting()},</Text>
            <Text style={styles.userName}>{displayName} 👋</Text>
          </View>
          <TouchableOpacity
            style={styles.avatarContainer}
            onPress={() => navigation.navigate('Profile')}
          >
            <LinearGradient
              colors={COLORS.gradientPrimary}
              style={styles.avatarGradient}
            >
              <Text style={styles.avatarText}>{firstLetter}</Text>
            </LinearGradient>
          </TouchableOpacity>
        </Animated.View>

        {/* Search Bar */}
        <Animated.View style={[styles.searchContainer, getAnimStyle(searchAnim)]}>
          <View style={styles.searchBar}>
            <Ionicons name="search" size={20} color={COLORS.textMuted} style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search courses, instructors..."
              placeholderTextColor={COLORS.textPlaceholder}
              value={searchQuery}
              onChangeText={setSearchQuery}
              returnKeyType="search"
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <Ionicons name="close-circle" size={20} color={COLORS.textMuted} />
              </TouchableOpacity>
            )}
          </View>
        </Animated.View>

        {/* Categories */}
        <Animated.View style={getAnimStyle(categoryAnim)}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoryScroll}
          >
            {['All', ...categories].map((cat) => (
              <TouchableOpacity
                key={cat}
                onPress={() => setSelectedCategory(cat)}
                activeOpacity={0.8}
              >
                {selectedCategory === cat ? (
                  <LinearGradient
                    colors={COLORS.gradientPrimary}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.categoryChip}
                  >
                    <Text style={styles.categoryTextActive}>{cat}</Text>
                  </LinearGradient>
                ) : (
                  <View style={[styles.categoryChip, styles.categoryChipInactive]}>
                    <Text style={styles.categoryText}>{cat}</Text>
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </ScrollView>
        </Animated.View>

        {/* Featured Courses */}
        {featuredCourses.length > 0 && (
          <Animated.View style={getAnimStyle(featuredAnim)}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Featured Courses</Text>
              <TouchableOpacity onPress={() => navigation.navigate('Explore', { category: selectedCategory })}>
                <Text style={styles.seeAll}>See All</Text>
              </TouchableOpacity>
            </View>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.horizontalScroll}
              decelerationRate="fast"
              snapToInterval={FEATURED_CARD_WIDTH + SPACING.md}
            >
              {featuredCourses.map((course, i) => renderFeaturedCard(course, i))}
            </ScrollView>
          </Animated.View>
        )}

        {/* Continue Learning */}
        {continueCourses.length > 0 && (
          <Animated.View style={getAnimStyle(continueAnim)}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Continue Learning</Text>
              <TouchableOpacity onPress={() => navigation.navigate('Explore', { mode: 'enrolled' })}>
                <Text style={styles.seeAll}>See All</Text>
              </TouchableOpacity>
            </View>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.horizontalScroll}
              decelerationRate="fast"
              snapToInterval={CONTINUE_CARD_WIDTH + SPACING.md}
            >
              {continueCourses.map((course, i) => renderContinueCard(course, i))}
            </ScrollView>
          </Animated.View>
        )}

        {/* Popular Courses */}
        <Animated.View style={getAnimStyle(popularAnim)}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Popular Courses</Text>
          </View>
          {popularCourses.length > 0 ? (
            popularCourses.map((course, i) => renderPopularCard(course, i))
          ) : (
            <View style={styles.emptyState}>
              <Ionicons name="book-outline" size={48} color={COLORS.textMuted} />
              <Text style={styles.emptyText}>No courses found</Text>
              <Text style={styles.emptySubtext}>Try a different category</Text>
            </View>
          )}
        </Animated.View>

        <View style={{ height: SPACING.huge }} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: SPACING.xxxl,
  },
  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.xl,
    paddingTop: SPACING.lg,
    paddingBottom: SPACING.md,
  },
  headerLeft: {
    flex: 1,
  },
  greeting: {
    fontSize: FONT_SIZES.md,
    fontWeight: FONT_WEIGHTS.regular,
    color: COLORS.textSecondary,
  },
  userName: {
    fontSize: FONT_SIZES.xxxl,
    fontWeight: FONT_WEIGHTS.bold,
    color: COLORS.text,
    marginTop: SPACING.xs,
  },
  avatarContainer: {
    marginLeft: SPACING.md,
  },
  avatarGradient: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    ...SHADOWS.medium,
  },
  avatarText: {
    fontSize: FONT_SIZES.xl,
    fontWeight: FONT_WEIGHTS.bold,
    color: COLORS.white,
  },
  // Search
  searchContainer: {
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.md,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    paddingHorizontal: SPACING.lg,
    height: 50,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
  },
  searchIcon: {
    marginRight: SPACING.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: FONT_SIZES.md,
    fontWeight: FONT_WEIGHTS.regular,
    color: COLORS.text,
    height: '100%',
  },
  // Categories
  categoryScroll: {
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.md,
    gap: SPACING.sm,
  },
  categoryChip: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm + 2,
    borderRadius: BORDER_RADIUS.round,
    marginRight: SPACING.sm,
  },
  categoryChipInactive: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
  },
  categoryTextActive: {
    fontSize: FONT_SIZES.sm,
    fontWeight: FONT_WEIGHTS.semibold,
    color: COLORS.white,
  },
  categoryText: {
    fontSize: FONT_SIZES.sm,
    fontWeight: FONT_WEIGHTS.medium,
    color: COLORS.textSecondary,
  },
  // Section
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.xl,
    paddingTop: SPACING.xxl,
    paddingBottom: SPACING.md,
  },
  sectionTitle: {
    fontSize: FONT_SIZES.xl,
    fontWeight: FONT_WEIGHTS.bold,
    color: COLORS.text,
  },
  seeAll: {
    fontSize: FONT_SIZES.sm,
    fontWeight: FONT_WEIGHTS.semibold,
    color: COLORS.primary,
  },
  horizontalScroll: {
    paddingHorizontal: SPACING.xl,
  },
  // Featured Card
  featuredCard: {
    width: FEATURED_CARD_WIDTH,
    height: 200,
    borderRadius: BORDER_RADIUS.lg,
    overflow: 'hidden',
    marginRight: SPACING.md,
    ...SHADOWS.medium,
  },
  featuredImage: {
    width: '100%',
    height: '100%',
    backgroundColor: COLORS.surface,
  },
  featuredGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.lg,
    paddingTop: SPACING.huge,
    justifyContent: 'flex-end',
  },
  featuredBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
    gap: SPACING.sm,
  },
  featuredTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: FONT_WEIGHTS.bold,
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  featuredMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  featuredInstructor: {
    fontSize: FONT_SIZES.xs,
    fontWeight: FONT_WEIGHTS.medium,
    color: COLORS.textSecondary,
    flex: 1,
  },
  // Continue Card
  continueCard: {
    width: CONTINUE_CARD_WIDTH,
    height: 130,
    borderRadius: BORDER_RADIUS.md,
    overflow: 'hidden',
    marginRight: SPACING.md,
    ...SHADOWS.small,
  },
  continueImage: {
    width: '100%',
    height: '100%',
    backgroundColor: COLORS.surface,
  },
  continueGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: SPACING.md,
    paddingTop: SPACING.xxxl,
  },
  continueTitle: {
    fontSize: FONT_SIZES.sm,
    fontWeight: FONT_WEIGHTS.semibold,
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  progressBarContainer: {
    height: 3,
    backgroundColor: COLORS.surfaceLight,
    borderRadius: BORDER_RADIUS.round,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: COLORS.primary,
    borderRadius: BORDER_RADIUS.round,
  },
  // Popular Card
  popularCard: {
    flexDirection: 'row',
    backgroundColor: COLORS.surface,
    marginHorizontal: SPACING.xl,
    marginBottom: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    ...SHADOWS.small,
  },
  popularImage: {
    width: 110,
    height: 100,
    backgroundColor: COLORS.surfaceLight,
  },
  popularInfo: {
    flex: 1,
    padding: SPACING.md,
    justifyContent: 'center',
  },
  popularTitle: {
    fontSize: FONT_SIZES.md,
    fontWeight: FONT_WEIGHTS.semibold,
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  popularInstructor: {
    fontSize: FONT_SIZES.xs,
    fontWeight: FONT_WEIGHTS.regular,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xs,
  },
  popularBottom: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  ratingNumber: {
    fontSize: FONT_SIZES.xs,
    fontWeight: FONT_WEIGHTS.semibold,
    color: COLORS.warning,
    marginLeft: SPACING.xs,
  },
  popularBadges: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  // Badges
  difficultyBadge: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    borderRadius: BORDER_RADIUS.round,
    borderWidth: 1,
  },
  difficultyText: {
    fontSize: FONT_SIZES.xs - 1,
    fontWeight: FONT_WEIGHTS.semibold,
  },
  durationBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  durationText: {
    fontSize: FONT_SIZES.xs - 1,
    fontWeight: FONT_WEIGHTS.medium,
    color: COLORS.textSecondary,
  },
  // Empty
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.huge,
  },
  emptyText: {
    fontSize: FONT_SIZES.lg,
    fontWeight: FONT_WEIGHTS.semibold,
    color: COLORS.textSecondary,
    marginTop: SPACING.md,
  },
  emptySubtext: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textMuted,
    marginTop: SPACING.xs,
  },
});

export default HomeScreen;
