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
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../../navigation/AppNavigator';
import Input from '../../components/Input';
import Button from '../../components/Button';
import SocialButton from '../../components/SocialButton';
import GoogleIcon from '../../components/GoogleIcon';
import { generateFunnyName } from '../../utils/nameGenerator';
import { saveAccessToken, saveRefreshToken, saveUserInfo } from '../../utils/authStorage';
import { 
  GoogleSignin, 
  statusCodes 
} from '@react-native-google-signin/google-signin';
import apiService from '../../utils/apiService';

type RegisterScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'Register'
>;

type RegisterScreenRouteProp = RouteProp<RootStackParamList, 'Register'>;

/**
 * Màn hình đăng ký tài khoản
 */
const RegisterScreen = () => {
  const navigation = useNavigation<RegisterScreenNavigationProp>();
  const route = useRoute<RegisterScreenRouteProp>();
  const googleUser = route.params?.googleUser;
  
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [funnyName, setFunnyName] = useState('');
  const [email, setEmail] = useState('');
  const [avatar, setAvatar] = useState('');
  const [errors, setErrors] = useState({
    phoneNumber: '',
    password: '',
    confirmPassword: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [authProvider, setAuthProvider] = useState('local');

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

  // Sử dụng thông tin từ Google nếu có
  useEffect(() => {
    if (route.params?.googleUser) {
      const googleUser = route.params.googleUser;
      console.log('[Register] Nhận thông tin từ Google:', JSON.stringify(googleUser, null, 2));
      
      // Kiểm tra cấu trúc dữ liệu từ Google
      if (googleUser) {
        // Cập nhật thông tin từ Google
        setFunnyName(googleUser.name || googleUser.givenName + ' ' + googleUser.familyName || '');
        setEmail(googleUser.email || '');
        setPassword('12345678'); // Mật khẩu mặc định cho đăng ký Google
        setConfirmPassword('12345678');
        
        // Nếu có avatar từ Google
        if (googleUser.photo) {
          setAvatar(googleUser.photo);
        }
        
        // Đánh dấu là đăng ký từ Google
        setAuthProvider('google');
      }
    }
  }, [route.params]);

  // Hàm kiểm tra dữ liệu nhập vào
  const validateInputs = () => {
    let valid = true;
    const newErrors = {
      phoneNumber: '',
      password: '',
      confirmPassword: '',
    };

    // Kiểm tra số điện thoại - bỏ qua nếu đăng ký với Google
    if (authProvider !== 'google') {
      if (!phoneNumber) {
        newErrors.phoneNumber = 'Vui lòng nhập số điện thoại';
        valid = false;
      } else if (!/^[0-9]{10}$/.test(phoneNumber)) {
        newErrors.phoneNumber = 'Số điện thoại không hợp lệ';
        valid = false;
      }
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
        console.log('- Email:', email);
        console.log('- Avatar:', avatar);
        console.log('- Auth Provider:', authProvider);

        // Chuẩn bị dữ liệu gửi lên API
        const userData = {
          fullName: funnyName,
          phoneNumber: phoneNumber,
          password: password,
          authProvider: authProvider,
          email: email || undefined,
          avatar: avatar || undefined
        };

        // Nếu đăng ký với Google, không gửi phoneNumber nếu trống
        if (authProvider === 'google' && !phoneNumber) {
          delete userData.phoneNumber;
        }

        console.log('[Register] Dữ liệu đăng ký:', JSON.stringify(userData, null, 2));

        // Gọi API đăng ký thông qua apiService
        const data = await apiService.register(userData);

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
      } catch (error: any) {
        // Xử lý lỗi
        console.error('Lỗi đăng ký:', error);
        Alert.alert(
          'Đăng ký thất bại',
          error.message || 'Có lỗi xảy ra khi đăng ký. Vui lòng thử lại sau.'
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
        // Log thông tin avatar
        console.log('[Google] Avatar URL từ Google:', googleUser.photo);
        
        // Thay vì điền thông tin vào form, tiến hành đăng ký ngay
        setIsLoading(true);
        
        try {
          // Chuẩn bị dữ liệu đăng ký
          const registerData = {
            fullName: googleUser.name || `${googleUser.givenName || ''} ${googleUser.familyName || ''}`.trim(),
            email: email,
            password: '12345678', // Mật khẩu mặc định cho đăng ký Google
            authProvider: 'google',
            avatar: googleUser.photo || undefined
            // Không gửi phoneNumber khi đăng ký với Google
          };
          
          console.log('[Google] Dữ liệu đăng ký tự động:', JSON.stringify(registerData, null, 2));
          
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
        } finally {
          setIsLoading(false);
        }
      } else {
        throw new Error('Không thể lấy thông tin từ tài khoản Google');
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
          <Text style={styles.title}>Đăng Ký</Text>
          <Text style={styles.subtitle}>
            {googleUser ? 'Hoàn tất đăng ký với Google' : 'Tạo tài khoản để trải nghiệm dịch vụ'}
          </Text>
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

          {email ? (
            <Input
              label="Email"
              value={email}
              editable={false}
              placeholder="Email từ Google"
            />
          ) : null}

          <Input
            label="Mật khẩu"
            value={password}
            onChangeText={setPassword}
            placeholder="Nhập mật khẩu"
            secureTextEntry
            error={errors.password}
            editable={!googleUser} // Không cho phép chỉnh sửa nếu đăng ký từ Google
          />

          <Input
            label="Xác nhận mật khẩu"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            placeholder="Nhập lại mật khẩu"
            secureTextEntry
            error={errors.confirmPassword}
            editable={!googleUser} // Không cho phép chỉnh sửa nếu đăng ký từ Google
          />

          <Button 
            title="Đăng Ký" 
            onPress={handleRegister} 
            loading={isLoading}
          />

          {!googleUser && (
            <>
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
            </>
          )}
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Đã có tài khoản? </Text>
          <TouchableOpacity onPress={() => navigation.navigate('Login')}>
            <Text style={styles.footerLink}>Đăng nhập</Text>
          </TouchableOpacity>
        </View>

        {funnyName ? (
          <View style={styles.nameContainer}>
            <Text style={styles.nameLabel}>
              {googleUser ? 'Tên từ Google:' : 'Tên vui nhộn của bạn:'}
            </Text>
            <Text style={styles.name}>{funnyName}</Text>
          </View>
        ) : null}

        {avatar ? (
          <View style={styles.avatarContainer}>
            <Text style={styles.nameLabel}>Ảnh đại diện:</Text>
            <Image source={{ uri: avatar }} style={styles.avatarImage} />
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
  avatarContainer: {
    marginTop: 20,
    padding: 16,
    backgroundColor: '#F8F0FE',
    borderRadius: 10,
    alignItems: 'center',
  },
  avatarImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginTop: 10,
  },
});

export default RegisterScreen; 