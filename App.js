import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { createSwitchNavigator, createAppContainer, } from 'react-navigation'
import * as firebase from 'firebase';
import {firebaseConfig} from './src/api';

import { LoginMain } from './screens/Login/LoginMain'
import { HomeMain } from './screens/Home/HomeMain'
import  LoginLoading  from './screens/LoginLoading'


//Initialize Firebase
firebase.initializeApp(firebaseConfig);

//Top main navigator
const AppNavigator = createSwitchNavigator({
  Login: LoginMain, 
  Loading: LoginLoading,
  Home: HomeMain,   
}, {
    initialRouteName: 'Loading',
  })
const AppContainer = createAppContainer(AppNavigator)


const App = () => (
  <AppContainer />
);
export default App;
