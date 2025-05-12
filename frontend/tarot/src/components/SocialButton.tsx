import React, { ReactNode } from 'react';
import { TouchableOpacity, Text, StyleSheet, Image, ViewStyle, ImageSourcePropType } from 'react-native';

interface SocialButtonProps {
  title: string;
  onPress: () => void;
  icon?: ImageSourcePropType | ReactNode;
  style?: ViewStyle;
}

/**
 * Component nút đăng nhập bằng mạng xã hội (Google, Facebook, Apple)
 */
const SocialButton: React.FC<SocialButtonProps> = ({
  title,
  onPress,
  icon,
  style,
}) => {
  return (
    <TouchableOpacity 
      style={[styles.button, style]}
      onPress={onPress}
    >
      {icon && typeof icon === 'object' && !('uri' in icon) ? (
        icon // Nếu là ReactNode
      ) : icon ? (
        <Image source={icon as ImageSourcePropType} style={styles.icon} />
      ) : null}
      <Text style={styles.text}>{title}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginVertical: 10,
    borderWidth: 1,
    borderColor: '#DDDDDD',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  icon: {
    width: 24,
    height: 24,
    marginRight: 12,
  },
  text: {
    color: '#333333',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default SocialButton; 