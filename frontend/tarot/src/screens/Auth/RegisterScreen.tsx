import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Image,
  Alert,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import { RootStackParamList } from '../../navigation/AppNavigator';
import Input from '../../components/Input';
import Button from '../../components/Button';
import SocialButton from '../../components/SocialButton';
import GoogleIcon from '../../components/GoogleIcon';
import { generateFunnyName } from '../../utils/nameGenerator';
import { saveAccessToken, saveRefreshToken, saveUserInfo } from '../../utils/authStorage';

type RegisterScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'Register'
>;

// API Base URL
// Thay địa chỉ localhost bằng địa chỉ IP Wi-Fi của máy tính để thiết bị có thể kết nối được
const API_BASE_URL = 'http://192.168.69.106:3000';

/**
 * Màn hình đăng ký tài khoản
 */
const RegisterScreen = () => {
  const navigation = useNavigation<RegisterScreenNavigationProp>();
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [funnyName, setFunnyName] = useState('');
  const [errors, setErrors] = useState({
    phoneNumber: '',
    password: '',
    confirmPassword: '',
  });
  const [isLoading, setIsLoading] = useState(false);

  // Tạo tên vui nhộn khi component được render
  useEffect(() => {
    const generatedName = generateFunnyName();
    setFunnyName(generatedName);
    console.log('Tên vui nhộn được tạo:', generatedName);
  }, []);

  // Hàm kiểm tra dữ liệu nhập vào
  const validateInputs = () => {
    let valid = true;
    const newErrors = {
      phoneNumber: '',
      password: '',
      confirmPassword: '',
    };

    // Kiểm tra số điện thoại
    if (!phoneNumber) {
      newErrors.phoneNumber = 'Vui lòng nhập số điện thoại';
      valid = false;
    } else if (!/^[0-9]{10}$/.test(phoneNumber)) {
      newErrors.phoneNumber = 'Số điện thoại không hợp lệ';
      valid = false;
    }

    // Kiểm tra mật khẩu
    if (!password) {
      newErrors.password = 'Vui lòng nhập mật khẩu';
      valid = false;
    } else if (password.length < 6) {
      newErrors.password = 'Mật khẩu phải có ít nhất 6 ký tự';
      valid = false;
    }

    // Kiểm tra xác nhận mật khẩu
    if (!confirmPassword) {
      newErrors.confirmPassword = 'Vui lòng xác nhận mật khẩu';
      valid = false;
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Mật khẩu không khớp';
      valid = false;
    }

    setErrors(newErrors);
    return valid;
  };

  // Hàm xử lý đăng ký
  const handleRegister = async () => {
    if (validateInputs()) {
      setIsLoading(true);
      
      try {
        // Log thông tin đăng ký
        console.log('Đang gửi thông tin đăng ký:');
        console.log('- Số điện thoại:', phoneNumber);
        console.log('- Mật khẩu:', password);
        console.log('- Tên:', funnyName);

        // Chuẩn bị dữ liệu gửi lên API
        const userData = {
          fullName: funnyName,
          phoneNumber: phoneNumber,
          password: password,
          authProvider: 'local'
        };

        console.log('Gọi API với URL:', `${API_BASE_URL}/auth/signup`);
        
        // Gọi API đăng ký
        const response = await fetch(`${API_BASE_URL}/auth/signup`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(userData),
        });

        // Xử lý kết quả từ API
        const data = await response.json();

        if (response.ok) {
          console.log('Đăng ký thành công:', data);
          
          // Lưu thông tin vào bộ nhớ đệm
          try {
            await saveAccessToken(data.accessToken);
            await saveRefreshToken(data.refreshToken);
            await saveUserInfo(data.user);
            
            console.log('Đã lưu thông tin người dùng vào bộ nhớ đệm:');
            console.log('- accessToken:', data.accessToken);
            console.log('- refreshToken:', data.refreshToken.substring(0, 20) + '...');
            console.log('- user:', data.user);
          } catch (error) {
            console.error('Lỗi khi lưu thông tin xác thực:', error);
            // Tiếp tục mặc dù có lỗi khi lưu
          }
          
          // Hiển thị thông báo thành công
          Alert.alert(
            'Đăng ký thành công',
            'Tài khoản của bạn đã được tạo thành công!',
            [
              { 
                text: 'OK', 
                onPress: () => navigation.navigate('Home', {}) 
              }
            ]
          );
        } else {
          // Xử lý lỗi từ API
          console.error('Lỗi đăng ký:', data);
          Alert.alert(
            'Đăng ký thất bại',
            data.message || 'Có lỗi xảy ra khi đăng ký. Vui lòng thử lại sau.'
          );
        }
      } catch (error) {
        // Xử lý lỗi kết nối
        console.error('Lỗi kết nối:', error);
        Alert.alert(
          'Lỗi kết nối',
          'Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối mạng và thử lại.'
        );
      } finally {
        setIsLoading(false);
      }
    }
  };

  // Xử lý đăng nhập bằng Google
  const handleGoogleSignIn = () => {
    console.log('Đăng nhập bằng Google');
    // Xử lý đăng nhập Google sẽ được thêm sau
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={styles.title}>Đăng Ký</Text>
          <Text style={styles.subtitle}>Tạo tài khoản để trải nghiệm dịch vụ</Text>
        </View>

        <View style={styles.form}>
          <Input
            label="Số điện thoại"
            value={phoneNumber}
            onChangeText={setPhoneNumber}
            placeholder="Nhập số điện thoại"
            keyboardType="phone-pad"
            error={errors.phoneNumber}
          />

          <Input
            label="Mật khẩu"
            value={password}
            onChangeText={setPassword}
            placeholder="Nhập mật khẩu"
            secureTextEntry
            error={errors.password}
          />

          <Input
            label="Xác nhận mật khẩu"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            placeholder="Nhập lại mật khẩu"
            secureTextEntry
            error={errors.confirmPassword}
          />

          <Button 
            title="Đăng Ký" 
            onPress={handleRegister} 
            loading={isLoading}
          />

          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>Hoặc</Text>
            <View style={styles.dividerLine} />
          </View>

          <SocialButton
            title="Tiếp tục với Google"
            onPress={handleGoogleSignIn}
            icon={<GoogleIcon size={24} />}
          />
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Đã có tài khoản? </Text>
          <TouchableOpacity onPress={() => navigation.navigate('Login')}>
            <Text style={styles.footerLink}>Đăng nhập</Text>
          </TouchableOpacity>
        </View>

        {funnyName ? (
          <View style={styles.nameContainer}>
            <Text style={styles.nameLabel}>Tên vui nhộn của bạn:</Text>
            <Text style={styles.name}>{funnyName}</Text>
          </View>
        ) : null}
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 40,
  },
  header: {
    marginBottom: 40,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#6A11CB',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#666666',
  },
  form: {
    marginBottom: 30,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#DDDDDD',
  },
  dividerText: {
    paddingHorizontal: 15,
    color: '#888888',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
  },
  footerText: {
    color: '#666666',
    fontSize: 16,
  },
  footerLink: {
    color: '#6A11CB',
    fontSize: 16,
    fontWeight: 'bold',
  },
  nameContainer: {
    marginTop: 30,
    padding: 16,
    backgroundColor: '#F8F0FE',
    borderRadius: 10,
    alignItems: 'center',
  },
  nameLabel: {
    fontSize: 16,
    color: '#666666',
    marginBottom: 8,
  },
  name: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#6A11CB',
  },
});

export default RegisterScreen; 