import React from 'react';
import { View, ActivityIndicator, StyleSheet, Text } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

import { useAuth } from '../context/AuthContext';
import { useChat } from '../context/ChatContext';
import { COLORS, FONT_SIZES } from '../theme/theme';

// Auth Screens
import LoginScreen from '../screens/auth/LoginScreen';
import SignupScreen from '../screens/auth/SignupScreen';

// User Screens
import HomeScreen from '../screens/user/HomeScreen';
import ExploreScreen from '../screens/user/ExploreScreen';
import CourseDetailScreen from '../screens/user/CourseDetailScreen';
import VideoPlayerScreen from '../screens/user/VideoPlayerScreen';
import ProfileScreen from '../screens/user/ProfileScreen';
import SupportScreen from '../screens/user/SupportScreen';
import EditProfileScreen from '../screens/user/EditProfileScreen';

import DownloadSettingsScreen from '../screens/user/DownloadSettingsScreen';
import AboutScreen from '../screens/user/AboutScreen';

// Admin Screens
import AdminDashboard from '../screens/admin/AdminDashboard';
import AddCourseScreen from '../screens/admin/AddCourseScreen';
import ManageCoursesScreen from '../screens/admin/ManageCoursesScreen';
import AdminChatsScreen from '../screens/admin/AdminChatsScreen';
import AdminChatDetailScreen from '../screens/admin/AdminChatDetailScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const screenOptions = {
  headerShown: false,
  contentStyle: { backgroundColor: COLORS.background },
  animation: 'slide_from_right',
};

function TabIcon({ name, color, size, focused, badge }) {
  return (
    <View style={styles.tabIconContainer}>
      {focused && <View style={styles.tabIconDot} />}
      <Ionicons name={name} size={size} color={color} />
      {badge > 0 && (
        <View style={styles.tabBadge}>
          <Text style={styles.tabBadgeText}>{badge > 9 ? '9+' : badge}</Text>
        </View>
      )}
    </View>
  );
}

function HomeTabs() {
  const { user } = useAuth();
  const { getUserUnread } = useChat();
  const unreadCount = getUserUnread(user?.uid);

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.textMuted,
        tabBarLabelStyle: styles.tabBarLabel,
        tabBarIcon: ({ color, size, focused }) => {
          let iconName;
          let badge = 0;
          if (route.name === 'Home') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Explore') {
            iconName = focused ? 'compass' : 'compass-outline';
          } else if (route.name === 'Profile') {
            iconName = focused ? 'person' : 'person-outline';
          }
          return <TabIcon name={iconName} color={color} size={22} focused={focused} badge={badge} />;
        },
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} options={{ tabBarLabel: 'Home' }} />
      <Tab.Screen name="Explore" component={ExploreScreen} options={{ tabBarLabel: 'Explore' }} />
      <Tab.Screen name="Profile" component={ProfileScreen} options={{ tabBarLabel: 'Profile' }} />
    </Tab.Navigator>
  );
}

function AuthStack() {
  return (
    <Stack.Navigator screenOptions={screenOptions}>
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Signup" component={SignupScreen} />
    </Stack.Navigator>
  );
}

function MainStack() {
  return (
    <Stack.Navigator screenOptions={screenOptions}>
      <Stack.Screen name="HomeTabs" component={HomeTabs} />
      <Stack.Screen name="CourseDetail" component={CourseDetailScreen} />
      <Stack.Screen
        name="VideoPlayer"
        component={VideoPlayerScreen}
        options={{ animation: 'slide_from_bottom' }}
      />
      <Stack.Screen name="Support" component={SupportScreen} />
      <Stack.Screen name="EditProfile" component={EditProfileScreen} />

      <Stack.Screen name="DownloadSettings" component={DownloadSettingsScreen} />
      <Stack.Screen name="About" component={AboutScreen} />
      <Stack.Screen name="AdminDashboard" component={AdminDashboard} />
      <Stack.Screen name="AddCourse" component={AddCourseScreen} />
      <Stack.Screen name="ManageCourses" component={ManageCoursesScreen} />
      <Stack.Screen name="AdminChats" component={AdminChatsScreen} />
      <Stack.Screen name="AdminChatDetail" component={AdminChatDetailScreen} />
    </Stack.Navigator>
  );
}

function LoadingScreen() {
  return (
    <View style={styles.loadingContainer}>
      <LinearGradient
        colors={COLORS.gradientPrimary}
        style={styles.loadingGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <ActivityIndicator size="large" color={COLORS.white} />
      </LinearGradient>
    </View>
  );
}

export default function AppNavigator({ navigationRef }) {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <NavigationContainer
      ref={navigationRef}
      theme={{
        dark: true,
        colors: {
          primary: COLORS.primary,
          background: COLORS.background,
          card: COLORS.surface,
          text: COLORS.text,
          border: COLORS.divider,
          notification: COLORS.accent,
        },
        fonts: {
          regular: { fontFamily: 'System', fontWeight: '400' },
          medium: { fontFamily: 'System', fontWeight: '500' },
          bold: { fontFamily: 'System', fontWeight: '700' },
          heavy: { fontFamily: 'System', fontWeight: '800' },
        },
      }}
    >
      {user ? <MainStack /> : <AuthStack />}
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: COLORS.surface,
    borderTopColor: COLORS.divider,
    borderTopWidth: 0.5,
    height: 65,
    paddingBottom: 8,
    paddingTop: 8,
    elevation: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  tabBarLabel: {
    fontSize: FONT_SIZES.xs,
    fontWeight: '600',
    marginTop: 2,
  },
  tabIconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  tabIconDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: COLORS.primary,
    position: 'absolute',
    top: -6,
  },
  tabBadge: {
    position: 'absolute',
    top: -6,
    right: -10,
    backgroundColor: COLORS.error,
    borderRadius: 8,
    minWidth: 16,
    height: 16,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
  },
  tabBadgeText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },
  loadingGradient: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
