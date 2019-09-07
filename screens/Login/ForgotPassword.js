import React from 'react'
import { View, Text, TextInput, TouchableWithoutFeedback, TouchableOpacity, Keyboard, StyleSheet } from 'react-native'
import { SafeAreaView } from 'react-navigation';


export default class ForgotPasswordScreen extends React.Component {
    static navigationOptions = ({ navigation }) => {
        return {
            headerTitle: "Forgot Password",
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
    }

    _emailUpdate = email => {
        this.setState({ email })
    }

    _emailMe = () =>{

    }

    render() {
        return (
            <SafeAreaView style={styles.container}>
                <TouchableWithoutFeedback style={styles.container} onPress={Keyboard.dismiss} >
                    <View style={styles.container}>
                        <View style={styles.emailContainer}>
                            <TextInput
                                style={styles.textinput}
                                placeholder="Email"
                                keyboardType='email-address'
                                returnKeyType='go'
                                autoCorrect={false}
                                value={this.state.email}
                                onChangeText={this._emailUpdate}
                                autoCapitalize="none"
                                onSubmitEditing={() => this.refs.txtPassword.focus()}
                            />
                        </View>
                        <View style={styles.buttonContainer}>
                            <TouchableOpacity
                                style={styles.button}
                                onPress={this._emailMe}
                            >
                                <Text style={styles.bottonText}>EMAIL ME</Text>
                            </TouchableOpacity>
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
    emailContainer: {
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: '70%',
        padding: 20,
    },
    textinput: {
        height: 40,
        backgroundColor: '#f2f3f4',
        paddingHorizontal: 10,
        marginTop: 20,
    },
    buttonContainer: {
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: '20%',
        padding: 20,
    },
    button: {
        backgroundColor: '#2bb5bc',
        paddingVertical: 15,
        marginBottom: 20,
    },
    bottonText: {
        textAlign: 'center',
        color: 'white',
        fontWeight: 'bold',
        fontSize: 18,
    }
})