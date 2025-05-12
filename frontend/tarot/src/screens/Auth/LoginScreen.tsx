import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import { RootStackParamList } from '../../navigation/AppNavigator';
import Input from '../../components/Input';
import Button from '../../components/Button';
import SocialButton from '../../components/SocialButton';
import GoogleIcon from '../../components/GoogleIcon';

type LoginScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'Login'
>;

/**
 * Màn hình đăng nhập
 */
const LoginScreen = () => {
  const navigation = useNavigation<LoginScreenNavigationProp>();
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({
    phoneNumber: '',
    password: '',
  });
  const [isLoading, setIsLoading] = useState(false);

  // Hàm kiểm tra dữ liệu nhập vào
  const validateInputs = () => {
    let valid = true;
    const newErrors = {
      phoneNumber: '',
      password: '',
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
    }

    setErrors(newErrors);
    return valid;
  };

  // Hàm xử lý đăng nhập
  const handleLogin = () => {
    if (validateInputs()) {
      setIsLoading(true);
      
      // Giả lập xử lý đăng nhập
      setTimeout(() => {
        console.log('Thông tin đăng nhập:');
        console.log('- Số điện thoại:', phoneNumber);
        console.log('- Mật khẩu:', password);
        console.log('- Tên:', ''); // Tên để trống theo yêu cầu

        setIsLoading(false);
        
        // Chuyển đến màn hình Home
        navigation.navigate('Home', { name: '' });
      }, 1500);
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
          <Text style={styles.title}>Đăng Nhập</Text>
          <Text style={styles.subtitle}>Chào mừng quay trở lại</Text>
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

          <TouchableOpacity style={styles.forgotPassword}>
            <Text style={styles.forgotPasswordText}>Quên mật khẩu?</Text>
          </TouchableOpacity>

          <Button 
            title="Đăng Nhập" 
            onPress={handleLogin} 
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
          <Text style={styles.footerText}>Chưa có tài khoản? </Text>
          <TouchableOpacity onPress={() => navigation.navigate('Register')}>
            <Text style={styles.footerLink}>Đăng ký ngay</Text>
          </TouchableOpacity>
        </View>
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
  forgotPassword: {
    alignSelf: 'flex-end',
    marginBottom: 20,
  },
  forgotPasswordText: {
    color: '#6A11CB',
    fontSize: 14,
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
});

export default LoginScreen; 