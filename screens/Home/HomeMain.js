import React from 'react';
import {createBottomTabNavigator,} from 'react-navigation-tabs'
import Ionicons from 'react-native-vector-icons/Ionicons'

import Discover from "./Discover";
import Search from "./Search";
import Schedule from "./Schedule";

export const HomeMain = createBottomTabNavigator(
    {
    Discover: Discover,
    Search: Search,
    Schedule: Schedule,
    }, 
    {
    defaultNavigationOptions: ({navigation}) => ({
      tabBarIcon: ({focused, tintColor}) => {
        const{ routeName} = navigation.state;
        let iconName;
        if (routeName==='Discover'){
          iconName = `ios-home`
        } else if (routeName==='Search'){
          iconName = `ios-search`
        } else if (routeName==='Schedule'){
          iconName = `ios-contact`
        }
        return <Ionicons name ={iconName} size={25} color={tintColor} />
        }
    })
    },
    {
      tabBarOptions: {
        activeTintColor: '#a41034',
        inactiveTintColor: 'gray',
      },
    }
  )