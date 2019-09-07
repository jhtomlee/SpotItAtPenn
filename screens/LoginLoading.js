import React, { Component } from 'react';
import { View, StyleSheet, ActivityIndicator, AsyncStorage,Alert } from 'react-native';
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

      if (user &&(!user.emailVerified)){
        Alert.alert(
          'Email needs to be verified',
          'Press "Ok" to receive a verification email',
          [
            {
              text: 'Ok',
              onPress: async () => {
                await user.sendEmailVerification();
                await firebase.auth().signOut();
                this.props.navigation.navigate('LoginMain');
              },
            },
            {
              text: 'Cancel',
              onPress: async () => {
                await firebase.auth().signOut();
                this.props.navigation.navigate('LoginMain');
              },
            },
          ],
          { cancelable: false }
        );
      } else if (user) {
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

          const stringfiedArray = JSON.stringify(subscribedInterests)
          await AsyncStorage.setItem('subscribedInterestsArray', stringfiedArray);

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