import React, { Component } from 'react';
import { View, StyleSheet, ActivityIndicator } from 'react-native';
import firebase from 'firebase';

export default class LoginLoadingScreen extends Component {
  componentDidMount() {
    this.checkIfLoggedIn();
  }
  componentWillUnmount() {
    if (this.unsubscribe) this.unsubscribe();
  }

  checkIfLoggedIn = () => {
    this.unsubscribe = firebase.auth().onAuthStateChanged( (user) =>{
      
      if (user) {
        this.props.navigation.navigate('Home');
      } else {
        this.props.navigation.navigate('LogIn');
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