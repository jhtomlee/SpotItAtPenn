import React from 'react';
import { createBottomTabNavigator, } from 'react-navigation-tabs'
import { createStackNavigator } from "react-navigation-stack";
import Ionicons from 'react-native-vector-icons/Ionicons'

import Discover from "./DiscoverStack/Discover";
import Search from "./SearchStack/Search";
import Schedule from "./ScheduleStack/Schedule";
import User from "./DiscoverStack/User";

const DiscoverStack = createStackNavigator({
  Discover: Discover,
  User: User,
});
DiscoverStack.navigationOptions = ({ navigation }) => {
  let tabBarVisible = true;
  if (navigation.state.index > 0) {
    tabBarVisible = false;
  }
  return {
    tabBarVisible,
  };
};

const SearchStack = createStackNavigator({
  Search: Search,
});
SearchStack.navigationOptions = ({ navigation }) => {
  let tabBarVisible = true;
  if (navigation.state.index > 0) {
    tabBarVisible = false;
  }
  return {
    tabBarVisible,
  };
};

const ScheduleStack = createStackNavigator({
  Schedule: Schedule,
});
ScheduleStack.navigationOptions = ({ navigation }) => {
  let tabBarVisible = true;
  if (navigation.state.index > 0) {
    tabBarVisible = false;
  }
  return {
    tabBarVisible,
  };
};


export const HomeMain = createBottomTabNavigator(
  {
    DiscoverStack: DiscoverStack,
    SearchStack: SearchStack,
    ScheduleStack: ScheduleStack,
  },
  {
    defaultNavigationOptions: ({ navigation }) => ({
      tabBarIcon: ({ focused, tintColor }) => {
        const { routeName } = navigation.state;
        let iconName;
        if (routeName === 'DiscoverStack') {
          iconName = `ios-home`
        } else if (routeName === 'SearchStack') {
          iconName = `ios-search`
        } else if (routeName === 'ScheduleStack') {
          iconName = `ios-calendar`
        }
        return <Ionicons name={iconName} size={25} color={tintColor} />
      }
    }),
  
    tabBarOptions: {
      showLabel: false,
      activeTintColor: '#a41034',
      inactiveTintColor: 'gray',
    },
  }
  
)