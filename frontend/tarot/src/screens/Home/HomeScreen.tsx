import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, SafeAreaView, ActivityIndicator, Alert } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { RootStackParamList } from '../../navigation/AppNavigator';
import Button from '../../components/Button';
import { getUserInfo } from '../../utils/authStorage';
import apiService from '../../utils/apiService';
import { clearAuthData } from '../../utils/authStorage';

type HomeScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'Home'
>;

type HomeScreenRouteProp = RouteProp<RootStackParamList, 'Home'>;

/**
 * Màn hình Home đơn giản
 */
const HomeScreen = () => {
  const navigation = useNavigation<HomeScreenNavigationProp>();
  const route = useRoute<HomeScreenRouteProp>();
  
  // State cho thông tin người dùng
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Lấy thông tin người dùng khi component được render
  useEffect(() => {
    fetchUserData();
  }, []);

  // Lấy thông tin người dùng từ API
  const fetchUserData = async () => {
    try {
      setLoading(true);
      // Lấy thông tin người dùng từ bộ nhớ đệm
      const storedUser = await getUserInfo();
      
      if (storedUser && storedUser.id) {
        console.log('Đang lấy thông tin người dùng với ID:', storedUser.id);
        
        // Gọi API để lấy thông tin cập nhật nhất
        const userData = await apiService.getUserInfo(storedUser.id);
        
        console.log('Lấy thông tin người dùng thành công:', userData);
        setUser(userData);
      } else {
        console.error('Không tìm thấy thông tin người dùng trong bộ nhớ đệm');
        setError('Không tìm thấy thông tin người dùng');
        Alert.alert(
          'Lỗi',
          'Không tìm thấy thông tin người dùng. Vui lòng đăng nhập lại.'
        );
      }
    } catch (error) {
      console.error('Lỗi khi lấy thông tin người dùng:', error);
      setError('Không thể lấy thông tin người dùng');
      Alert.alert(
        'Lỗi',
        'Không thể lấy thông tin người dùng. Vui lòng thử lại sau.'
      );
    } finally {
      setLoading(false);
    }
  };

  // Hàm xử lý đăng xuất
  const handleLogout = async () => {
    console.log('Đăng xuất');
    
    try {
      // Xóa tất cả dữ liệu xác thực
      await clearAuthData();
      
      // Chuyển về màn hình đăng nhập
      navigation.reset({
        index: 0,
        routes: [{ name: 'Login' }],
      });
    } catch (error) {
      console.error('Lỗi khi đăng xuất:', error);
      Alert.alert('Lỗi', 'Không thể đăng xuất. Vui lòng thử lại sau.');
    }
  };

  // Hàm điều hướng đến trang Settings
  const navigateToSettings = () => {
    navigation.navigate('Settings');
  };

  // Hàm điều hướng đến trang danh sách chuyên gia
  const navigateToExperts = () => {
    console.log('Điều hướng đến danh sách chuyên gia');
    navigation.navigate('ExpertsList');
  };

  // Hiển thị loading khi đang lấy dữ liệu
  if (loading) {
    return (
      <SafeAreaView style={[styles.container, styles.loadingContainer]}>
        <ActivityIndicator size="large" color="#6A11CB" />
        <Text style={styles.loadingText}>Đang tải thông tin...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Tarot Online</Text>
        <View style={styles.userInfoHeader}>
          {user && (
            <>
              <Text style={styles.coinBalanceText}>{user.coinBalance || 0} xu</Text>
              <TouchableOpacity 
                style={styles.profileButton}
                onPress={navigateToSettings}
              >
                <Text style={styles.profileButtonText}>
                  {user.fullName ? user.fullName.split(' ').pop() : 'Tài khoản'}
                </Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.welcomeCard}>
          <Text style={styles.welcomeText}>
            {user ? `Chào mừng, ${user.fullName || 'Người dùng'}!` : 'Chào mừng đến với Tarot Online!'}
          </Text>
          <Text style={styles.welcomeDescription}>
            Khám phá những điều huyền bí và nhận thông điệp từ Tarot mỗi ngày.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Dịch vụ xem bói của chúng tôi</Text>
          
          <View style={styles.serviceCard}>
            <Text style={styles.serviceTitle}>Xem Tarot với chuyên gia</Text>
            <Text style={styles.serviceDescription}>
              Chat 1-1 với chuyên gia để nhận được những lời khuyên phù hợp nhất.
            </Text>
            <Button 
              title="Tìm chuyên gia" 
              onPress={navigateToExperts} 
            />
          </View>
          
          <View style={styles.serviceCard}>
            <Text style={styles.serviceTitle}>Thông điệp hàng ngày</Text>
            <Text style={styles.serviceDescription}>
              Nhận một lá bài và thông điệp Tarot mỗi ngày.
            </Text>
            <Button 
              title="Xem thông điệp" 
              onPress={() => console.log('Bấm nút xem thông điệp')} 
            />
          </View>
        </View>

        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>Lượt xem miễn phí của bạn</Text>
          <Text style={styles.infoValue}>2 lượt</Text>
          <Text style={styles.infoDescription}>
            Bạn có thể dùng lượt xem miễn phí để trò chuyện với chuyên gia.
          </Text>
          <Button 
            title="Mua thêm lượt xem" 
            onPress={() => console.log('Bấm nút mua thêm lượt xem')}
            style={styles.infoButton} 
          />
        </View>

        <Button 
          title="Cài đặt tài khoản" 
          onPress={navigateToSettings}
          style={styles.settingsButton} 
        />

        <Button 
          title="Đăng xuất" 
          onPress={handleLogout}
          style={styles.logoutButton} 
        />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F0FE',
  },
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6A11CB',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#6A11CB',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  userInfoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  coinBalanceText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    marginRight: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    overflow: 'hidden',
  },
  profileButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  profileButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  content: {
    padding: 16,
  },
  welcomeCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#6A11CB',
    marginBottom: 8,
  },
  welcomeDescription: {
    fontSize: 16,
    color: '#666666',
    lineHeight: 24,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 16,
  },
  serviceCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  serviceTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 8,
  },
  serviceDescription: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 16,
    lineHeight: 22,
  },
  infoCard: {
    backgroundColor: 'rgba(106, 17, 203, 0.1)',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: 'rgba(106, 17, 203, 0.2)',
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 8,
  },
  infoValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#6A11CB',
    marginBottom: 8,
  },
  infoDescription: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 16,
    lineHeight: 22,
  },
  infoButton: {
    backgroundColor: '#6A11CB',
  },
  settingsButton: {
    backgroundColor: '#6A11CB',
    marginTop: 16,
  },
  logoutButton: {
    backgroundColor: '#FF6B6B',
    marginTop: 16,
  },
});

export default HomeScreen;