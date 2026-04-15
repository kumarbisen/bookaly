import CustomerLogin from '@features/auth/CustomerLogin';
import CustomerSignup from '@features/auth/CustomerSignup';
import CustomerForgotPassword from '@features/auth/CustomerForgotPassword';
import Subscription from '@features/provider/Subscription';
import { useAuthStore } from '@state/authStore';
import { useEffect, useState } from 'react';

import ProviderLogin from '@features/auth/ProviderLogin';
import ProviderForgotPassword from '@features/auth/ProviderForgotPassword';
import BookToken from '@features/customer/BookToken'
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator, } from '@react-navigation/native-stack'
import { navigationRef, resetAndNavigate } from '@utils/NavigationUtils';
import React from 'react'


import Home from '@features/provider/Home';
import Customerdashboard from '@features/customer/Customerdashboard';
import ProfileScreen from '@features/customer/profileScreen';


import Favorate from '@features/customer/Favorate';
import ProviderProfile from '@features/provider/ProviderProfile';
import SearchActivity from '@features/customer/SearchActivity';
import ProviderSignUp from '@features/auth/ProviderSignUp';





const Stack = createNativeStackNavigator();


const Navigation = () => {
  const { user } = useAuthStore();

  const [storeReady, setStoreReady] = useState(useAuthStore.persist?.hasHydrated?.() ?? true)


  useEffect(() => {
    const unsub = useAuthStore.persist?.onFinishHydration?.(() => setStoreReady(true));
    return () => unsub?.();
  }, []);

  useEffect(() => {
    if (!storeReady) return;

    if (user?.role === 'Provider') {
      resetAndNavigate('ProviderHome');
    } else if (user?.role === 'Customer') {
      resetAndNavigate('Customerdashboard');
    } else {
      resetAndNavigate('CustomerLogin');
    }
  }, [storeReady, user?.role]);


  useEffect(() => {
    if (user?.role === 'Provider') {
      const checkSubscription = () => {
        const createdAt = user.created_at || user.createdAt;
        const isSubscribed = user.isSubscribed;
        const startTime = createdAt ? new Date(createdAt).getTime() : Date.now();
        const now = Date.now();
        const trialDurationMs = 30 * 24 * 60 * 60 * 1000;

        const isTrialExpired = (now - startTime) > trialDurationMs;

        if (isTrialExpired && !isSubscribed) {

          setTimeout(() => {
            if (navigationRef.isReady()) {
              const currentRoute = navigationRef.getCurrentRoute();
              if (currentRoute?.name !== 'SubscriptionScreen' && currentRoute?.name !== 'ProviderLogin') {
                resetAndNavigate('SubscriptionScreen');
              }
            }
          }, 1000);
        }
      };

      checkSubscription();
    }
  }, [user]);


  if (!storeReady) {
    // splash screen later
    return null;
  }

  return (

    <NavigationContainer ref={navigationRef} >
      <Stack.Navigator
        initialRouteName='CustomerLogin'
        screenOptions={{
          headerShown: false,
          animation: 'none',
        }}>

        <Stack.Screen name='CustomerLogin' component={CustomerLogin}></Stack.Screen>
        <Stack.Screen name='CustomerSignup' component={CustomerSignup}></Stack.Screen>
        <Stack.Screen name='CustomerForgotPassword' component={CustomerForgotPassword}></Stack.Screen>
        <Stack.Screen name='Subscription' component={Subscription}></Stack.Screen>

        <Stack.Screen name='ProviderSignUp' component={ProviderSignUp}></Stack.Screen>

        <Stack.Screen name='ProviderLogin' component={ProviderLogin}></Stack.Screen>
        <Stack.Screen name='ProviderForgotPassword' component={ProviderForgotPassword}></Stack.Screen>
        <Stack.Screen name='Customerdashboard' component={Customerdashboard} ></Stack.Screen>
        <Stack.Screen name='ProviderHome' component={Home}></Stack.Screen>
        <Stack.Screen name='BookToken' component={BookToken}></Stack.Screen>
        <Stack.Screen name='profileScreen' component={ProfileScreen}></Stack.Screen>
        <Stack.Screen name='Favorate' component={Favorate} ></Stack.Screen>
        <Stack.Screen name='SearchActivity' component={SearchActivity} ></Stack.Screen>
        <Stack.Screen name='ProviderProfile' component={ProviderProfile} options={{
          animation: 'slide_from_right'
        }}></Stack.Screen>

        <Stack.Screen name='SubscriptionScreen' component={Subscription} options={{
          headerShown: false,
          gestureEnabled: false
        }}></Stack.Screen>



      </Stack.Navigator>
    </NavigationContainer>

  )
}
export default Navigation;