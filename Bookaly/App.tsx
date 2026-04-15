
import Navigation from '@navigation/Navigation';
import { NavigationContainer } from '@react-navigation/native';
import ScanStore from '@state/scanStore';

import React from 'react';
import { StatusBar, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

const App = () => {
  return (
    <SafeAreaProvider>
      <StatusBar barStyle="dark-content" backgroundColor="#F9FAFB" />
      <ScanStore>
        <View style={{ flex: 1 }}>
          <Navigation />
        </View>
      </ScanStore>
    </SafeAreaProvider>
  );
};
export default App;
