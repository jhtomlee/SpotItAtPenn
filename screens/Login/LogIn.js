import React from 'react'
import { View, Text, Image, TextInput, Button, TouchableOpacity, StyleSheet, TouchableWithoutFeedback, Keyboard } from 'react-native'
import { SafeAreaView } from 'react-navigation';
import {usersDB} from '../../src/db'
import * as firebase from 'firebase';

export default class LogIn extends React.Component {
  static navigationOptions = ({ navigation }) => {
    return {
      header: null,
    }
  }

  state = {
    username: '',
    password: '',
  };

  // functions
  _emailSignin = async () => {
    try {
      const userData = await firebase.auth().signInWithEmailAndPassword(this.state.username, this.state.password);
      const db = await firebase.firestore();
      db.collection(usersDB).doc(userData.user.uid).update({
        last_logged_in: Date.now()
      }).catch(function (error) {
        console.log("Error updating document: ", error);
      });
      this.props.navigation.navigate('Loading');

    } catch (error) {
      alert(error.toString());
    }
  };
  _forgot = () => {
    this.props.navigation.push('ForgotPassword')
  };
  _register = () => {
    this.props.navigation.push('Register')
  };

  //state updates
  _usernameUpdate = username => {
    this.setState({ username })
  }
  _passwordUpdate = password => {
    this.setState({ password })
  }

  /**
   * Render function
   */
  render() {
    return (
      <SafeAreaView style={styles.container}>
        <TouchableWithoutFeedback style={styles.container} onPress={Keyboard.dismiss} >
          <View style={styles.container}>
            <View style={styles.logoContainer}>
              <Image style={styles.logo}
                source={require('../../src/sPOTiT.png')}>
              </Image>
            </View>
            <View style={styles.loginInfo}>
              <TextInput
                style={styles.textinput}
                placeholder="Email"
                keyboardType='email-address'
                returnKeyType='next'
                autoCorrect={false}
                value={this.state.username}
                onChangeText={this._usernameUpdate}
                autoCapitalize="none"
                onSubmitEditing={() => this.refs.txtPassword.focus()}
              />
              <TextInput
                style={styles.textinput}
                placeholder="Password"
                value={this.state.password}
                onChangeText={this._passwordUpdate}
                secureTextEntry={true}
                returnKeyType='go'
                autoCorrect={false}
                ref={"txtPassword"}
              />
              <Button title="Forgot Password?" onPress={this._forgot} color='#a41034' />
              <TouchableOpacity
                style={styles.bottonContainer}
                onPress={this._emailSignin}
              >
                <Text style={styles.bottonText}>SIGN IN</Text>
              </TouchableOpacity>
              <Button title="I don't have an account" onPress={this._register} color='#a41034' />
            </View>
          </View>
        </TouchableWithoutFeedback>
      </SafeAreaView>
    )
  }

}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#e8e8e8',
    flexDirection: 'column',
  },
  logoContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 50,
    //flex: 1.
  },
  logo: {
    width: 200,
    height: 200,
  },
  loginInfo: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 440,
    padding: 20,
    //backgroundColor: 'red',
  },
  textinput: {
    height: 40,
    backgroundColor: '#f2f3f4',
    paddingHorizontal: 10,
    marginTop: 20,
  },
  bottonContainer: {
    backgroundColor: '#a41034',
    paddingVertical: 15,
    marginBottom: 20,
  },
  botton2Container: {
    backgroundColor: '#a41034',
    paddingVertical: 10,
    marginBottom: 10,
  },
  orText: {
    marginBottom: 20,
    textAlign: 'center',
    fontSize: 18,
    color: 'gray',
  },
  bottonText: {
    textAlign: 'center',
    color: 'white',
    fontWeight: 'bold',
    fontSize: 18,
  }

},
)

