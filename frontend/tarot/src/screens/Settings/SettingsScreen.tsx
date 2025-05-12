import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Alert,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import { RootStackParamList } from '../../navigation/AppNavigator';
import Input from '../../components/Input';
import Button from '../../components/Button';
import Avatar from '../../components/Avatar';
import RadioButton from '../../components/RadioButton';
import DatePickerComponent from '../../components/DatePicker';
import { getUserInfo, saveUserInfo } from '../../utils/authStorage';
import apiService from '../../utils/apiService';

type SettingsScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'Settings'
>;

// Các tùy chọn giới tính
const genderOptions = [
  { label: 'Nam', value: 'male' },
  { label: 'Nữ', value: 'female' },
  { label: 'Khác', value: 'other' },
];

/**
 * Màn hình Settings để cập nhật thông tin cá nhân
 * 
 * Note: Trong tương lai, email sẽ chỉ được thay đổi khi có số điện thoại xác thực
 */
const SettingsScreen = () => {
  const navigation = useNavigation<SettingsScreenNavigationProp>();

  // State chứa thông tin người dùng
  const [userData, setUserData] = useState({
    fullName: '',
    phoneNumber: '',
    email: '',
    dateOfBirth: new Date(),
    gender: 'male',
    avatar: '',
    address: '',
    coinBalance: 0,
    id: 0,
  });

  // State cho mật khẩu
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  
  // State chứa thông báo lỗi
  const [errors, setErrors] = useState({
    fullName: '',
    email: '',
    address: '',
    oldPassword: '',
    newPassword: '',
    confirmNewPassword: '',
  });

  // State loading
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingUserData, setIsLoadingUserData] = useState(true);
  const [changePassword, setChangePassword] = useState(false);

  // Lấy thông tin người dùng khi component được render
  useEffect(() => {
    fetchUserData();
  }, []);

  // Lấy thông tin người dùng từ API
  const fetchUserData = async () => {
    try {
      setIsLoadingUserData(true);
      // Lấy thông tin người dùng từ bộ nhớ đệm
      const storedUser = await getUserInfo();
      
      if (storedUser && storedUser.id) {
        console.log('Đang lấy thông tin người dùng với ID:', storedUser.id);
        
        // Gọi API để lấy thông tin cập nhật nhất
        const userData = await apiService.getUserInfo(storedUser.id);
        
        console.log('Lấy thông tin người dùng thành công:', userData);
        
        // Cập nhật state với dữ liệu từ API
        setUserData({
          ...userData,
          // Chuyển đổi dateOfBirth từ string sang Date object nếu có
          dateOfBirth: userData.dateOfBirth ? new Date(userData.dateOfBirth) : new Date(),
        });
      } else {
        console.error('Không tìm thấy thông tin người dùng trong bộ nhớ đệm');
        Alert.alert(
          'Lỗi',
          'Không tìm thấy thông tin người dùng. Vui lòng đăng nhập lại.'
        );
      }
    } catch (error) {
      console.error('Lỗi khi lấy thông tin người dùng:', error);
      Alert.alert(
        'Lỗi',
        'Không thể lấy thông tin người dùng. Vui lòng thử lại sau.'
      );
    } finally {
      setIsLoadingUserData(false);
    }
  };

  // Hàm cập nhật thông tin
  const handleChange = (field: string, value: any) => {
    setUserData({
      ...userData,
      [field]: value,
    });
  };

  // Hàm kiểm tra email hợp lệ
  const isValidEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // Hàm kiểm tra dữ liệu nhập vào
  const validateInputs = () => {
    let valid = true;
    const newErrors = {
      fullName: '',
      email: '',
      address: '',
      oldPassword: '',
      newPassword: '',
      confirmNewPassword: '',
    };

    // Kiểm tra tên đầy đủ
    if (!userData.fullName.trim()) {
      newErrors.fullName = 'Vui lòng nhập họ tên';
      valid = false;
    }

    // Kiểm tra email
    if (!userData.email.trim()) {
      newErrors.email = 'Vui lòng nhập email';
      valid = false;
    } else if (!isValidEmail(userData.email)) {
      newErrors.email = 'Email không hợp lệ';
      valid = false;
    } else if (!userData.phoneNumber) {
      newErrors.email = 'Cần xác thực số điện thoại trước khi cập nhật email';
      valid = false;
    }

    // Kiểm tra địa chỉ
    if (!userData.address.trim()) {
      newErrors.address = 'Vui lòng nhập địa chỉ';
      valid = false;
    }
    
    // Kiểm tra ngày sinh có hợp lệ không (không được trong tương lai)
    if (userData.dateOfBirth && userData.dateOfBirth > new Date()) {
      // Nếu ngày sinh trong tương lai, cập nhật lại thành ngày hiện tại
      userData.dateOfBirth = new Date();
      console.warn('Ngày sinh đã được điều chỉnh vì không thể là ngày trong tương lai');
    }
    
    // Kiểm tra mật khẩu nếu người dùng muốn thay đổi
    if (changePassword) {
      if (!oldPassword.trim()) {
        newErrors.oldPassword = 'Vui lòng nhập mật khẩu hiện tại';
        valid = false;
      }
      
      if (!newPassword.trim()) {
        newErrors.newPassword = 'Vui lòng nhập mật khẩu mới';
        valid = false;
      } else if (newPassword.length < 8) {
        newErrors.newPassword = 'Mật khẩu phải có ít nhất 8 ký tự';
        valid = false;
      }
      
      if (!confirmNewPassword.trim()) {
        newErrors.confirmNewPassword = 'Vui lòng xác nhận mật khẩu mới';
        valid = false;
      } else if (newPassword !== confirmNewPassword) {
        newErrors.confirmNewPassword = 'Mật khẩu xác nhận không khớp';
        valid = false;
      }
    }

    setErrors(newErrors);
    return valid;
  };

  // Hàm xử lý khi ảnh đại diện được chọn
  const handleImageSelected = async (uri: string) => {
    try {
      // Hiển thị loading để người dùng biết đang xử lý
      setIsLoading(true);
      
      // Kiểm tra xem uri có phải là URL web hợp lệ không
      const isValidUrl = (url: string) => {
        try {
          if (!url) return false;
          const urlObj = new URL(url);
          return urlObj.protocol === 'http:' || urlObj.protocol === 'https:';
        } catch (e) {
          return false;
        }
      };
      
      // Nếu uri đã là URL web hợp lệ và giống với avatar hiện tại, không cần upload lại
      if (isValidUrl(uri) && uri === userData.avatar) {
        console.log('Ảnh đại diện không thay đổi, không cần upload lại');
        setIsLoading(false);
        return;
      }
      
      // Nếu uri không phải URL web hợp lệ, upload lên server
      if (!isValidUrl(uri)) {
        console.log('Đang tải ảnh lên server:', uri);
        
        try {
          // Upload ảnh lên server
          const uploadResult = await apiService.uploadAvatar(uri);
          
          if (uploadResult && uploadResult.url) {
            console.log('Upload thành công với URL:', uploadResult.url);
            
            // Cập nhật state với URL từ server
            setUserData({
              ...userData,
              avatar: uploadResult.url
            });
            
            Alert.alert(
              'Thành công',
              'Ảnh đại diện đã được tải lên thành công. Nhấn "Cập nhật thông tin" để lưu thay đổi.',
              [{ text: 'OK' }]
            );
          } else {
            throw new Error('Không nhận được URL từ server');
          }
        } catch (uploadError) {
          console.error('Lỗi khi upload ảnh:', uploadError);
          Alert.alert(
            'Lỗi',
            'Không thể tải ảnh lên server. Vui lòng thử lại sau.',
            [{ text: 'OK' }]
          );
        }
      } else {
        // Nếu là URL web hợp lệ nhưng khác với avatar hiện tại
        setUserData({
          ...userData,
          avatar: uri
        });
        
        Alert.alert(
          'Thành công',
          'Ảnh đại diện đã được cập nhật. Nhấn "Cập nhật thông tin" để lưu thay đổi.',
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      console.error('Lỗi khi xử lý ảnh đại diện:', error);
      Alert.alert(
        'Lỗi',
        'Không thể xử lý ảnh đại diện. Vui lòng thử lại sau.',
        [{ text: 'OK' }]
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Hàm xử lý cập nhật thông tin người dùng
  const handleUpdateProfile = async () => {
    if (validateInputs()) {
      setIsLoading(true);
      
      try {
        // Chuẩn bị dữ liệu để gửi lên API - chỉ gửi các trường đã thay đổi
        const updateData: any = {};
        
        // Lấy thông tin người dùng từ bộ nhớ đệm để so sánh
        const storedUser = await getUserInfo();
        
        // So sánh và chỉ gửi các trường đã thay đổi
        if (storedUser) {
          // Kiểm tra từng trường thông tin
          if (userData.fullName !== storedUser.fullName) {
            updateData.fullName = userData.fullName;
          }
          
          if (userData.email !== storedUser.email) {
            updateData.email = userData.email;
          }
          
          if (userData.gender !== storedUser.gender) {
            updateData.gender = userData.gender;
          }
          
          if (userData.address !== storedUser.address) {
            updateData.address = userData.address;
          }
          
          if (userData.avatar !== storedUser.avatar) {
            updateData.avatar = userData.avatar;
          }
          
          // Chuyển đổi dateOfBirth thành chuỗi ISO để so sánh
          const currentDateOfBirth = userData.dateOfBirth ? userData.dateOfBirth.toISOString().split('T')[0] : null;
          const storedDateOfBirth = storedUser.dateOfBirth ? new Date(storedUser.dateOfBirth).toISOString().split('T')[0] : null;
          
          if (currentDateOfBirth !== storedDateOfBirth) {
            updateData.dateOfBirth = currentDateOfBirth;
          }
          
          // Xử lý đổi mật khẩu
          if (changePassword) {
            if (oldPassword && newPassword && confirmNewPassword) {
              updateData.oldPassword = oldPassword;
              updateData.newPassword = newPassword;
            }
          }
        } else {
          // Nếu không có thông tin người dùng trong bộ nhớ đệm, gửi tất cả thông tin
          updateData.fullName = userData.fullName;
          updateData.email = userData.email || '';
          updateData.gender = userData.gender;
          updateData.address = userData.address || '';
          updateData.avatar = userData.avatar || '';
          updateData.dateOfBirth = userData.dateOfBirth ? userData.dateOfBirth.toISOString().split('T')[0] : null;
          
          if (changePassword) {
            if (oldPassword && newPassword && confirmNewPassword) {
              updateData.oldPassword = oldPassword;
              updateData.newPassword = newPassword;
            }
          }
        }
        
        // Kiểm tra xem có thông tin nào được cập nhật không
        if (Object.keys(updateData).length === 0) {
          Alert.alert(
            'Thông báo',
            'Không có thông tin nào được thay đổi.',
            [{ text: 'OK', onPress: () => navigation.goBack() }]
          );
          setIsLoading(false);
          return;
        }
        
        console.log('Đang gửi yêu cầu cập nhật thông tin người dùng');
        console.log('Dữ liệu gửi đi:', updateData);
        
        // Gọi API cập nhật thông tin người dùng
        const response = await apiService.updateUserProfile(updateData);
        
        console.log('Cập nhật thông tin thành công:', response);
        
        // Lấy thông tin người dùng mới nhất
        if (userData.id) {
          const updatedUserData = await apiService.getUserInfo(userData.id);
          
          // Cập nhật state với dữ liệu mới nhất
          setUserData({
            ...updatedUserData,
            dateOfBirth: updatedUserData.dateOfBirth ? new Date(updatedUserData.dateOfBirth) : new Date(),
          });
          
          // Lưu thông tin người dùng vào bộ nhớ đệm
          await saveUserInfo(updatedUserData);
        }
        
        Alert.alert(
          'Thành công',
          'Thông tin cá nhân đã được cập nhật',
          [{ text: 'OK', onPress: () => navigation.goBack() }]
        );
      } catch (error: any) {
        console.error('Lỗi khi cập nhật thông tin người dùng:', error);
        
        // Hiển thị thông báo lỗi cụ thể hơn nếu có
        let errorMessage = 'Có lỗi xảy ra khi xử lý thông tin. Vui lòng thử lại sau.';
        
        if (error.message) {
          if (error.message.includes('Validation failed')) {
            errorMessage = 'Dữ liệu không hợp lệ. Vui lòng kiểm tra lại thông tin đã nhập.';
          } else {
            errorMessage = error.message;
          }
        }
        
        Alert.alert('Lỗi', errorMessage);
      } finally {
        setIsLoading(false);
      }
    }
  };

  // Hiển thị loading khi đang lấy dữ liệu
  if (isLoadingUserData) {
    return (
      <SafeAreaView style={[styles.container, styles.loadingContainer]}>
        <ActivityIndicator size="large" color="#6A11CB" />
        <Text style={styles.loadingText}>Đang tải thông tin người dùng...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 0}
      >
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Text style={styles.backButtonText}>Quay lại</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Thông tin cá nhân</Text>
          <View style={styles.placeholder} />
        </View>

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <Avatar
            source={userData.avatar}
            size={100}
            onImageSelected={handleImageSelected}
            containerStyle={styles.avatarContainer}
            editable={true}
          />

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Thông tin cơ bản</Text>
            
            <Input
              label="Họ và tên"
              value={userData.fullName}
              onChangeText={(text) => handleChange('fullName', text)}
              placeholder="Nhập họ và tên"
              error={errors.fullName}
            />

            <Input
              label="Số điện thoại"
              value={userData.phoneNumber}
              onChangeText={() => {}}
              placeholder="Nhập số điện thoại"
              keyboardType="phone-pad"
              disabled={true}
              containerStyle={styles.disabledInput}
            />

            <Input
              label="Email"
              value={userData.email || ''}
              onChangeText={(text) => handleChange('email', text)}
              placeholder="Nhập email"
              keyboardType="email-address"
              error={errors.email}
            />

            <DatePickerComponent
              label="Ngày sinh"
              value={userData.dateOfBirth}
              onChange={(date) => handleChange('dateOfBirth', date)}
              placeholder="Chọn ngày sinh"
            />

            <RadioButton
              label="Giới tính"
              options={genderOptions}
              selectedValue={userData.gender}
              onSelect={(value) => handleChange('gender', value)}
              horizontal={true}
            />
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Thông tin liên hệ</Text>
            
            <Input
              label="Địa chỉ"
              value={userData.address || ''}
              onChangeText={(text) => handleChange('address', text)}
              placeholder="Nhập địa chỉ"
              error={errors.address}
            />
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Thông tin tài khoản</Text>
            
            <View style={styles.coinContainer}>
              <Text style={styles.coinLabel}>Số dư xu:</Text>
              <Text style={styles.coinValue}>{userData.coinBalance}</Text>
            </View>

            <TouchableOpacity
              style={styles.changePasswordToggle}
              onPress={() => setChangePassword(!changePassword)}
            >
              <Text style={styles.changePasswordText}>
                {changePassword ? 'Hủy đổi mật khẩu' : 'Đổi mật khẩu'}
              </Text>
            </TouchableOpacity>

            {changePassword && (
              <View style={styles.passwordSection}>
                <Input
                  label="Mật khẩu hiện tại"
                  value={oldPassword}
                  onChangeText={setOldPassword}
                  placeholder="Nhập mật khẩu hiện tại"
                  secureTextEntry
                  error={errors.oldPassword}
                />
                <Input
                  label="Mật khẩu mới"
                  value={newPassword}
                  onChangeText={setNewPassword}
                  placeholder="Nhập mật khẩu mới"
                  secureTextEntry
                  error={errors.newPassword}
                />
                <Input
                  label="Xác nhận mật khẩu mới"
                  value={confirmNewPassword}
                  onChangeText={setConfirmNewPassword}
                  placeholder="Xác nhận mật khẩu mới"
                  secureTextEntry
                  error={errors.confirmNewPassword}
                />
              </View>
            )}
          </View>

          <Button
            title="Cập nhật thông tin"
            onPress={handleUpdateProfile}
            loading={isLoading}
            style={styles.updateButton}
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
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
    paddingHorizontal: 16,
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  backButton: {
    padding: 8,
  },
  backButtonText: {
    color: '#6A11CB',
    fontSize: 16,
    fontWeight: '600',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333333',
  },
  placeholder: {
    width: 60,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  avatarContainer: {
    marginVertical: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  disabledInput: {
    opacity: 0.7,
  },
  coinContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
  },
  coinLabel: {
    fontSize: 16,
    color: '#333',
    marginRight: 8,
  },
  coinValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#6A11CB',
  },
  changePasswordToggle: {
    marginTop: 16,
    padding: 12,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
  },
  changePasswordText: {
    color: '#6A11CB',
    fontWeight: '600',
    textAlign: 'center',
  },
  passwordSection: {
    marginTop: 16,
    padding: 16,
    backgroundColor: '#fafafa',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#eeeeee',
  },
  updateButton: {
    marginTop: 20,
  },
});

export default SettingsScreen; 