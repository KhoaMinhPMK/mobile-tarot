import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import { RootStackParamList } from '../../navigation/AppNavigator';
import Input from '../../components/Input';
import Button from '../../components/Button';
import SocialButton from '../../components/SocialButton';
import GoogleIcon from '../../components/GoogleIcon';
import apiService from '../../utils/apiService';
import { saveAccessToken, saveRefreshToken, saveUserInfo } from '../../utils/authStorage';
import { 
  GoogleSignin, 
  statusCodes 
} from '@react-native-google-signin/google-signin';

type LoginScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList
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
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  // Khởi tạo Google Sign In khi component mount
  useEffect(() => {
    configureGoogleSignIn();
  }, []);

  // Cấu hình Google Sign In
  const configureGoogleSignIn = () => {
    try {
      // Cấu hình Google Sign In với Web Client ID từ google-services.json
      GoogleSignin.configure({
        // Web Client ID từ google-services.json
        webClientId: '201499845393-goer2of7nnb561ccbqmi2r9q1ne9r5ov.apps.googleusercontent.com',
        offlineAccess: true,
        forceCodeForRefreshToken: true,
      });
      
      console.log('[Google] Đã cấu hình Google Sign In');
    } catch (error) {
      console.error('[Google] Lỗi khi cấu hình Google Sign In:', error);
    }
  };

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
  const handleLogin = async () => {
    if (validateInputs()) {
      setIsLoading(true);
      
      try {
        console.log('Đang đăng nhập với số điện thoại:', phoneNumber);
        
        // Gọi API đăng nhập
        const response = await apiService.login(phoneNumber, undefined, password);
        
        // Lưu thông tin đăng nhập vào bộ nhớ
        await saveAccessToken(response.accessToken);
        await saveRefreshToken(response.refreshToken);
        await saveUserInfo(response.user);
        
        console.log('Đăng nhập thành công:', response.user);
        
        // Chuyển đến màn hình Home
        navigation.reset({
          index: 0,
          routes: [{ name: 'Home' }],
        });
      } catch (error: any) {
        console.error('Lỗi khi đăng nhập:', error);
        
        // Hiển thị thông báo lỗi
        Alert.alert(
          'Đăng nhập thất bại',
          error.message || 'Số điện thoại hoặc mật khẩu không chính xác',
          [{ text: 'OK' }]
        );
      } finally {
        setIsLoading(false);
      }
    }
  };

  // Xử lý đăng nhập bằng Google
  const handleGoogleSignIn = async () => {
    try {
      setIsGoogleLoading(true);
      console.log('[Google] Bắt đầu quá trình đăng nhập với Google');
      
      // Kiểm tra Play Services
      await GoogleSignin.hasPlayServices();
      
      // Đăng xuất trước để đảm bảo người dùng chọn tài khoản mới
      try {
        await GoogleSignin.signOut();
        console.log('[Google] Đã đăng xuất khỏi phiên đăng nhập Google trước đó');
      } catch (signOutError) {
        // Bỏ qua lỗi đăng xuất
        console.log('[Google] Không có phiên đăng nhập trước đó');
      }
      
      // Bắt đầu quy trình đăng nhập
      const userInfo: any = await GoogleSignin.signIn();
      
      // In thông tin người dùng ra log
      console.log('[Google] Đăng nhập thành công, thông tin người dùng:');
      console.log('[Google] Thông tin đầy đủ:', JSON.stringify(userInfo, null, 2));
      
      // Kiểm tra chi tiết cấu trúc dữ liệu trả về
      console.log('[Google] Kiểm tra cấu trúc dữ liệu:', {
        hasData: !!userInfo?.data,
        hasUser: !!userInfo?.user,
        hasUserData: !!userInfo?.data?.user,
        email: userInfo?.user?.email || userInfo?.data?.user?.email || null
      });
      
      // Trích xuất email từ thông tin người dùng Google - kiểm tra nhiều vị trí có thể
      let email = null;
      let googleUser = null;
      
      // Kiểm tra email trong cấu trúc cũ
      if (userInfo?.user?.email) {
        email = userInfo.user.email;
        googleUser = userInfo.user;
      } 
      // Kiểm tra email trong cấu trúc mới (data.user)
      else if (userInfo?.data?.user?.email) {
        email = userInfo.data.user.email;
        googleUser = userInfo.data.user;
      }
      
      if (email && googleUser) {
        const defaultPassword = '12345678'; // Mật khẩu mặc định cho đăng nhập Google
        
        console.log('[Google] Đăng nhập với email:', email);
        console.log('[Google] Sử dụng mật khẩu mặc định');
        
        try {
          // Gọi API đăng nhập với email và mật khẩu mặc định
          const response = await apiService.login(undefined, email, defaultPassword);
          
          // Lưu thông tin đăng nhập vào bộ nhớ
          await saveAccessToken(response.accessToken);
          await saveRefreshToken(response.refreshToken);
          await saveUserInfo(response.user);
          
          console.log('[Google] Đăng nhập thành công với email:', email);
          
          // Chuyển đến màn hình Home
          navigation.reset({
            index: 0,
            routes: [{ name: 'Home' }],
          });
        } catch (loginError: any) {
          // Không hiển thị lỗi đăng nhập, chỉ ghi log
          console.log('[Google] Tài khoản chưa tồn tại, tiến hành đăng ký tự động');
          
          try {
            // Chuẩn bị dữ liệu đăng ký
            const registerData = {
              fullName: googleUser.name || `${googleUser.givenName || ''} ${googleUser.familyName || ''}`.trim(),
              email: email,
              password: defaultPassword,
              authProvider: 'google',
              avatar: googleUser.photo || undefined
            };
            
            console.log('[Google] Dữ liệu đăng ký tự động:', JSON.stringify(registerData, null, 2));
            console.log('[Google] Avatar URL từ Google:', googleUser.photo);
            
            // Gọi API đăng ký
            const registerResponse = await apiService.register(registerData);
            
            // Lưu thông tin đăng nhập vào bộ nhớ
            await saveAccessToken(registerResponse.accessToken);
            await saveRefreshToken(registerResponse.refreshToken);
            await saveUserInfo(registerResponse.user);
            
            console.log('[Google] Đăng ký tự động thành công');
            
            // Chuyển đến màn hình Home mà không hiển thị thông báo
            navigation.reset({
              index: 0,
              routes: [{ name: 'Home' }],
            });
          } catch (registerError: any) {
            console.error('[Google] Lỗi khi đăng ký tự động:', registerError);
            
            Alert.alert(
              'Không thể đăng ký tự động',
              registerError.message || 'Có lỗi xảy ra khi đăng ký tài khoản. Vui lòng thử lại sau.',
              [{ text: 'OK' }]
            );
          }
        }
      } else {
        throw new Error('Không thể lấy email từ tài khoản Google');
      }
    } catch (error: any) {
      console.error('[Google] Lỗi khi đăng nhập với Google:', error);
      
      // Xử lý các loại lỗi
      if (error.code === statusCodes.SIGN_IN_CANCELLED) {
        console.log('[Google] Người dùng đã hủy đăng nhập');
      } else if (error.code === statusCodes.IN_PROGRESS) {
        console.log('[Google] Đăng nhập đang trong tiến trình');
      } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
        console.log('[Google] Play Services không khả dụng');
        Alert.alert(
          'Lỗi',
          'Google Play Services không khả dụng trên thiết bị này'
        );
      } else {
        Alert.alert(
          'Lỗi đăng nhập',
          error.message || 'Có lỗi xảy ra khi đăng nhập với Google'
        );
      }
    } finally {
      setIsGoogleLoading(false);
    }
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
            title={isGoogleLoading ? "Đang xử lý..." : "Tiếp tục với Google"}
            onPress={handleGoogleSignIn}
            icon={<GoogleIcon size={24} />}
          />
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Chưa có tài khoản? </Text>
          <TouchableOpacity onPress={() => (navigation as any).navigate('Register')}>
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