import React from 'react';
import {
  View,
  Image,
  TouchableOpacity,
  Text,
  StyleSheet,
  ViewStyle,
  Alert,
  Platform,
} from 'react-native';
import { launchImageLibrary, launchCamera, ImagePickerResponse } from 'react-native-image-picker';

interface AvatarProps {
  source?: string;
  size?: number;
  onPress?: () => void;
  onImageSelected?: (uri: string) => void;
  containerStyle?: ViewStyle;
  editable?: boolean;
}

/**
 * Component Avatar để hiển thị và thay đổi ảnh đại diện
 * 
 * Chức năng:
 * - Hiển thị ảnh đại diện từ URL
 * - Cho phép người dùng thay đổi ảnh bằng cách chụp ảnh mới hoặc chọn từ thư viện
 * - Gửi URI của ảnh được chọn trở lại thông qua callback onImageSelected
 */
const Avatar: React.FC<AvatarProps> = ({
  source,
  size = 100,
  onPress,
  onImageSelected,
  containerStyle,
  editable = true,
}) => {
  // Tạo biến style với kích thước tùy chỉnh
  const sizeStyle = {
    width: size,
    height: size,
    borderRadius: size / 2,
  };

  // Hàm xử lý khi người dùng bấm vào ảnh đại diện
  const handleAvatarPress = () => {
    if (onPress) {
      onPress();
      return;
    }

    if (editable) {
      showImagePickerOptions();
    }
  };

  // Hiển thị các tùy chọn chọn ảnh
  const showImagePickerOptions = () => {
    Alert.alert(
      'Thay đổi ảnh đại diện',
      'Chọn nguồn ảnh',
      [
        {
          text: 'Chụp ảnh',
          onPress: takePhotoFromCamera,
        },
        {
          text: 'Chọn từ thư viện',
          onPress: chooseFromLibrary,
        },
        {
          text: 'Hủy',
          style: 'cancel',
        },
      ],
      { cancelable: true }
    );
  };

  // Hàm xử lý kết quả khi chọn ảnh
  const handleImagePickerResponse = (response: ImagePickerResponse) => {
    if (response.didCancel) {
      console.log('Hủy chọn ảnh');
    } else if (response.errorCode) {
      console.log('Lỗi khi chọn ảnh:', response.errorMessage);
      Alert.alert('Lỗi', 'Không thể chọn ảnh. Vui lòng thử lại.');
    } else if (response.assets && response.assets.length > 0 && response.assets[0].uri) {
      const uri = response.assets[0].uri;
      console.log('Ảnh đã chọn:', uri);
      
      // Gọi hàm callback khi có onImageSelected
      if (onImageSelected) {
        onImageSelected(uri);
      }
    }
  };

  // Hàm chọn ảnh từ thư viện
  const chooseFromLibrary = () => {
    const options = {
      mediaType: 'photo',
      maxWidth: 500,
      maxHeight: 500,
      quality: 0.8,
      includeBase64: false,
    };
    
    launchImageLibrary(options, handleImagePickerResponse);
  };

  // Hàm chụp ảnh từ camera
  const takePhotoFromCamera = () => {
    const options = {
      mediaType: 'photo',
      maxWidth: 500,
      maxHeight: 500,
      quality: 0.8,
      saveToPhotos: true,
      includeBase64: false,
    };
    
    launchCamera(options, handleImagePickerResponse);
  };

  return (
    <View style={[styles.container, containerStyle]}>
      <TouchableOpacity
        disabled={!editable}
        style={[styles.avatarContainer, sizeStyle]}
        onPress={handleAvatarPress}
      >
        {source ? (
          <Image
            source={{ uri: source }}
            style={[styles.avatarImage, sizeStyle]}
            resizeMode="cover"
          />
        ) : (
          <View style={[styles.placeholderContainer, sizeStyle]}>
            <Text style={styles.placeholderText}>Ảnh</Text>
          </View>
        )}
        
        {editable && (
          <View style={styles.editButton}>
            <Text style={styles.editButtonText}>+</Text>
          </View>
        )}
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginVertical: 15,
  },
  avatarContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  avatarImage: {
    borderWidth: 2,
    borderColor: '#fff',
  },
  placeholderContainer: {
    backgroundColor: '#DDD',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },
  placeholderText: {
    color: '#888',
    fontSize: 16,
    fontWeight: 'bold',
  },
  editButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#6A11CB',
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },
  editButtonText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
});

export default Avatar; 