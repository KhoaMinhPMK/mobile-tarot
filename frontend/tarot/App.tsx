/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import React, { useEffect } from 'react';
import { StatusBar, LogBox } from 'react-native';
import AppNavigator from './src/navigation/AppNavigator';

// Bỏ qua cảnh báo không cần thiết
LogBox.ignoreLogs([
  'ViewPropTypes will be removed',
  'ColorPropType will be removed',
]);

/**
 * Ứng dụng Tarot Online
 */
const App = () => {
  return (
    <>
      <StatusBar
        barStyle="dark-content"
        backgroundColor="#FFFFFF"
        translucent
      />
      <AppNavigator />
    </>
  );
};

export default App;
