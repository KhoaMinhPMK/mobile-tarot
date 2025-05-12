import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Image, ActivityIndicator } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/AppNavigator';
import { useNavigation } from '@react-navigation/native';

type SplashScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'Splash'
>;

/**
 * Màn hình Splash hiển thị khi mở ứng dụng
 */
const SplashScreen = () => {
  const navigation = useNavigation<SplashScreenNavigationProp>();

  useEffect(() => {
    // Chờ 2 giây rồi chuyển sang màn hình Login
    const timer = setTimeout(() => {
      console.log('Chuyển từ SplashScreen đến LoginScreen');
      navigation.replace('Login');
    }, 2000);

    // Cleanup function
    return () => clearTimeout(timer);
  }, [navigation]);

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Tarot Online</Text>
        <Text style={styles.subtitle}>Khám phá bí ẩn cuộc sống</Text>
        <ActivityIndicator size="large" color="#6A11CB" style={styles.loading} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F0FE',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    alignItems: 'center',
  },
  logo: {
    width: 120,
    height: 120,
    marginBottom: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#6A11CB',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 18,
    color: '#666',
    marginBottom: 30,
    textAlign: 'center',
  },
  loading: {
    marginTop: 20,
  },
});

export default SplashScreen; 