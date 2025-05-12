import React from 'react';
import { View, StyleSheet } from 'react-native';

interface GoogleIconProps {
  size?: number;
}

/**
 * Component biểu tượng Google tạo bằng View
 */
const GoogleIcon: React.FC<GoogleIconProps> = ({ size = 24 }) => {
  const scaledSize = {
    width: size,
    height: size,
    borderRadius: size / 2,
  };

  return (
    <View style={[styles.container, scaledSize]}>
      <View style={[styles.g, { width: size * 0.6, height: size * 0.6 }]}>
        <View style={[styles.gTop, { width: size * 0.3, height: size * 0.3 }]} />
        <View style={[styles.gBottom, { width: size * 0.3, height: size * 0.3 }]} />
        <View style={[styles.gRight, { width: size * 0.3, height: size * 0.3 }]} />
        <View style={[styles.gLeft, { width: size * 0.3, height: size * 0.3 }]} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#EEEEEE',
  },
  g: {
    position: 'relative',
  },
  gTop: {
    position: 'absolute',
    top: 0,
    left: 0,
    backgroundColor: '#4285F4',
    borderTopLeftRadius: 2,
  },
  gRight: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: '#EA4335',
    borderTopRightRadius: 2,
  },
  gBottom: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#34A853',
    borderBottomRightRadius: 2,
  },
  gLeft: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    backgroundColor: '#FBBC05',
    borderBottomLeftRadius: 2,
  },
});

export default GoogleIcon; 