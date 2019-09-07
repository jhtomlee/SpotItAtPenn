import React, { Component } from 'react';
import { View, StyleSheet, ActivityIndicator, AsyncStorage } from 'react-native';
import { StackActions, NavigationActions } from 'react-navigation';
import firebase from 'firebase';
import {usersDB} from '../src/db'

export default class LoginLoadingScreen extends Component {
  componentDidMount() {
    this.checkIfLoggedIn();
  }
  componentWillUnmount() {
    if (this.unsubscribe) this.unsubscribe();
  }

  checkIfLoggedIn = async () => {
    this.unsubscribe = firebase.auth().onAuthStateChanged(async (user) => {

      if (user) {
        const userId = user.uid;
        await AsyncStorage.setItem('userId', userId);

        const db = await firebase.firestore();
        const doc = await db.collection(usersDB).doc(userId).get();
        const {
          subscribedInterests
        } = doc.data();

        if (subscribedInterests.length === 0){
          console.warn(0);
          const resetAction = StackActions.reset({
            index: 0,
            actions: [
              NavigationActions.navigate({
                routeName: 'Interests',
              }),
            ],
          });
          this.props.navigation.dispatch(resetAction);
        } else {
          const { navigate } = this.props.navigation;
          setTimeout(() => {
            if (this.unsubscribe) this.unsubscribe();
            // Logged In
            navigate('HomeMain');
          }, 1000);
        }

      } else {
        this.props.navigation.navigate('LogInMain');
      }
    })
  };

  render() {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center'
  }
});