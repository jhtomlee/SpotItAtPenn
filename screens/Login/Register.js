import React from 'react'
import { View, Text, Image, TextInput, Button, TouchableOpacity, StyleSheet, KeyboardAvoidingView, TouchableWithoutFeedback, Keyboard } from 'react-native'
import { SafeAreaView } from 'react-navigation';
import * as firebase from 'firebase';
import 'firebase/firestore';


export default class RegisterScreen extends React.Component {
  static navigationOptions = ({ navigation }) => {
    return {
      headerTitle: 'Registration',
      headerTintColor: '#2bb5bc',
      headerStyle: {
        backgroundColor: '#e8e8e8',
        height: 100,
        borderBottomWidth: 0,
      },
    }
  }
  state = {
    email: '',
    password: '',
    confirmpass: '',
  };

  _signup = async () => {

    try {
      if (this.state.password !== this.state.confirmpass) {
        alert("Check your password!");
        return;
      }
      if (this.state.password.length < 6) {
        alert("Longer password!");
        return;
      }
      const userData = await firebase.auth().createUserWithEmailAndPassword(this.state.email.trim(), this.state.password);

      // create data database
      const db = await firebase.firestore();
      db.collection("users").doc(userData.user.uid).set({
        firstName: "",
        lastName: "",
        preferredName: "",
        email: userData.user.email,
        profilePictureURL: null,
        created_at: Date.now(),
        subscribedInterests: [],
      }).catch(function (error) {
        console.log("Error adding document: ", error);
      });

      this.props.navigation.navigate('Loading');

    } catch (error) {
      alert(error.toString());
    }
  };

  _signin = () => {
    this.props.navigation.goBack()
  };

  _emailUpdate = email => {
    this.setState({ email })
  }
  _passwordUpdate = password => {
    this.setState({ password })
  }
  _confirmPassUpdate = confirmpass => {
    this.setState({ confirmpass })
  }
  render() {
    return (
      <SafeAreaView style={styles.container}>
        <TouchableWithoutFeedback style={styles.container} onPress={Keyboard.dismiss} >
          <View style={styles.container}>
            <View style={styles.loginInfo}>
              <TextInput
                style={styles.textinput}
                placeholder="Email"
                keyboardType='email-address'
                returnKeyType='next'
                autoCorrect={false}
                value={this.state.email}
                onChangeText={this._emailUpdate}
                autoCapitalize="none"
                onSubmitEditing={() => this.refs.txtPassword.focus()}
              />
              <TextInput
                style={styles.textinput}
                placeholder="Password"
                value={this.state.password}
                onChangeText={this._passwordUpdate}
                secureTextEntry={true}
                returnKeyType='next'
                autoCorrect={false}
                ref={"txtPassword"}
                onSubmitEditing={() => this.refs.txtConfirmPassword.focus()}
              />
              <TextInput
                style={styles.textinput}
                placeholder="Confirm Password"
                value={this.state.confirmpass}
                onChangeText={this._confirmPassUpdate}
                secureTextEntry={true}
                returnKeyType='go'
                autoCorrect={false}
                ref={"txtConfirmPassword"}
              />
              
              <TouchableOpacity
                style={styles.bottonContainer}
                onPress={this._signup}
              >
                <Text style={styles.bottonText}>SIGN UP</Text>
              </TouchableOpacity>
              <Button title="Have an account?" onPress={this._signin} color='#2bb5bc' />
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
  loginInfo: {
    position: 'absolute',
    left: 0,
    right: 0,
    padding: 20,
  },
  textinput: {
    height: 40,
    backgroundColor: '#f2f3f4',
    paddingHorizontal: 10,
    marginTop: 20,
  },
  bottonContainer: {
    backgroundColor: '#2bb5bc',
    paddingVertical: 15,
    marginTop: 20,
    marginBottom: 20,
  },
  bottonText: {
    textAlign: 'center',
    color: 'white',
    fontWeight: 'bold',
    fontSize: 18,
  }

},
)