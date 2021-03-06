import React from 'react'
import { View, Text, Image, ScrollView, TextInput, Button, TouchableOpacity, StyleSheet, KeyboardAvoidingView, TouchableWithoutFeedback, Keyboard } from 'react-native'
import { SafeAreaView } from 'react-navigation';
import * as firebase from 'firebase';
import {usersDB} from '../../src/db'
import 'firebase/firestore';


export default class RegisterScreen extends React.Component {
  static navigationOptions = ({ navigation }) => {
    return {
      headerTitle: 'Registration',
      headerTintColor: '#a41034',
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
    firstName: '',
    lastName: '',
    preferredName: '',
  };

  // functions
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
      db.collection(usersDB).doc(userData.user.uid).set({
        firstName: this.state.firstName,
        lastName: this.state.lastName,
        preferredName: this.state.preferredName,
        email: userData.user.email,
        profilePictureURL: null,
        created_at: Date.now(),
        subscribedInterests: [],
        likedEvents:[],
      }).catch(function (error) {
        console.log("Error adding document: ", error);
      });

      //navigate
      this.props.navigation.navigate('Loading');

    } catch (error) {
      alert(error.toString());
    }
  };
  _signin = () => {
    this.props.navigation.goBack()
  };

  // state updates
  _emailUpdate = email => {
    this.setState({ email })
  }
  _passwordUpdate = password => {
    this.setState({ password })
  }
  _confirmPassUpdate = confirmpass => {
    this.setState({ confirmpass })
  }
  _firstNameUpdate = firstName => {
    this.setState({ firstName })
  }
  _lastNameUpdate = lastName => {
    this.setState({ lastName })
  }
  _preferredNameUpdate = preferredName => {
    this.setState({ preferredName })
  }

  /**
   * Render()
   */
  render() {
    return (

      <KeyboardAvoidingView style={styles.container} behavior="padding" keyboardVerticalOffset={65}>
        <ScrollView style={styles.container}>
          <TouchableWithoutFeedback style={styles.container} onPress={Keyboard.dismiss} >
            <View style={styles.container}>
              <View style={styles.loginInfo}>
                <TextInput
                  style={styles.textinput}
                  placeholder="First Name"
                  returnKeyType='next'
                  autoCorrect={false}
                  value={this.state.firstName}
                  onChangeText={this._firstNameUpdate}
                  autoCapitalize="none"
                  onSubmitEditing={() => this.refs.txtLastName.focus()}
                />
                <TextInput
                  style={styles.textinput}
                  placeholder="Last Name"
                  returnKeyType='next'
                  autoCorrect={false}
                  value={this.state.lastName}
                  onChangeText={this._lastNameUpdate}
                  autoCapitalize="none"
                  ref={"txtLastName"}
                  onSubmitEditing={() => this.refs.txtPreferredName.focus()}
                />
                <TextInput
                  style={styles.textinput}
                  placeholder="Preferred Name"
                  returnKeyType='next'
                  autoCorrect={false}
                  value={this.state.preferredName}
                  onChangeText={this._preferredNameUpdate}
                  autoCapitalize="none"
                  ref={"txtPreferredName"}
                  onSubmitEditing={() => this.refs.txtEmail.focus()}
                />
                <TextInput
                  style={styles.textinput}
                  placeholder="Email"
                  keyboardType='email-address'
                  returnKeyType='next'
                  autoCorrect={false}
                  value={this.state.email}
                  onChangeText={this._emailUpdate}
                  autoCapitalize="none"
                  ref={"txtEmail"}
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
                <Button title="Have an account?" onPress={this._signin} color='#a41034' />
              </View>
            </View>
          </TouchableWithoutFeedback>
        </ScrollView>
      </KeyboardAvoidingView>

    )
  }
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#e8e8e8',
  },
  loginInfo: {
    padding: 20,
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