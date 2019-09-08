import React from 'react';
import { View, Text, Image, ScrollView, TextInput, FlatList, AsyncStorage, Alert, TouchableOpacity, StyleSheet, KeyboardAvoidingView, TouchableWithoutFeedback, Keyboard } from 'react-native'
import { ListItem } from 'react-native-elements'
import firebase from 'firebase';
import { usersDB, eventsDB } from '../../../src/db'

export default class Create extends React.Component {
  static navigationOptions = ({ navigation }) => {
    return {
      headerTitle: "Create an event",
      headerTintColor: '#a41034',
    }
  }

  constructor(props) {
    super(props);
    this.selected = new Set();
    this.state = {
      title: '',
      host: '',
      time: '',
      location: '',
      summary: '',
      cost: null,
      registrationSite: null,
      websiteSource: null,
      keyWords: [],
      keywordList: ['Social', 'Food', 'Sports', 'Academic', 'Student Organization']
    };
  }

  async componentDidMount() {
    const preferredName = await AsyncStorage.getItem('preferredName');
    this.setState({ host: preferredName })
  }

  //state updates
  title = title => {
    this.setState({ title })
  }
  host = host => {
    this.setState({ host })
  }
  time = time => {
    this.setState({ time })
  }
  location = location => {
    this.setState({ location })
  }
  summary = summary => {
    this.setState({ summary })
  }
  cost = cost => {
    this.setState({ cost })
  }
  registrationSite = registrationSite => {
    this.setState({ registrationSite })
  }
  websiteSource = websiteSource => {
    this.setState({ websiteSource })
  }
  keyWords = keyWords => {
    this.setState({ keyWords })
  }

  //functions
  _create = async () => {
    if (this.state.title === '' || this.state.host === ''
      || this.state.time === '' || this.state.location === '' || this.state.summary === ''
      || this.selected.size === 0) {
      alert("Required field is missing")
    } else {
      const userId = await AsyncStorage.getItem('userId')
      const db = await firebase.firestore();
      const arr = Array.from(this.selected);

      db.collection(eventsDB).add({
        title: this.state.title,
        host: this.state.host,
        time: this.state.time,
        location: this.state.location,
        summary: this.state.summary,
        cost: this.state.cost,
        registrationSite: this.state.registrationSite,
        websiteSource: this.state.websiteSource,
        keywords: arr,
        likedBy: [],
        likesCount: 0,
      })
        .then((docRef) => {
          console.warn(docRef.id)
          db.collection(usersDB).doc(userId).update({
            myEvents: firebase.firestore.FieldValue.arrayUnion(docRef.id),
          }).catch((error) => {
            console.log("Error updating document: ", error);
          });

        })
        .catch(function (error) {
          console.log("Error adding document: ", error);
        });
      Alert.alert(
        'Success!',
        'Event has been created!',
        [
          {
            text: 'Ok',
            onPress: async () => {
              this.props.navigation.goBack();
            },
          }
        ],
        { cancelable: false }
      );
    }

  }

  /**
   * Functions
   */
  _renderRow = item => {
    const interest = item.item;
    return (
      <ListItem
        containerStyle={{ backgroundColor: '#e8e8e8' }}
        title={interest}
        onPress={() => {
          {
            this.selected.has(interest)
              ? this.selected.delete(interest)
              : this.selected.add(interest);
          }
          const { toggle } = this.state;
          this.setState({ toggle: !toggle });
        }}
        containerStyle={
          this.selected.has(interest)
            ? { backgroundColor: 'dimgrey', borderRadius: 5 }
            : { backgroundColor: '#e8e8e8' }
        }
        titleStyle={
          this.selected.has(interest)
            ? { fontSize: 14, color: 'white' }
            : { fontSize: 14, color: 'dimgrey' }
        }
      />
    );
  };
  render() {
    return (
      <KeyboardAvoidingView style={styles.container} behavior="padding" keyboardVerticalOffset={65}>
        <ScrollView style={styles.container}>
          <TouchableWithoutFeedback style={styles.container} onPress={Keyboard.dismiss} >
            <View style={styles.container}>
              <View style={styles.loginInfo}>
                <TextInput
                  style={styles.textinput}
                  placeholder="Title"
                  returnKeyType='next'
                  autoCorrect={false}
                  value={this.state.title}
                  onChangeText={this.title}
                />
                <TextInput
                  style={styles.textinput}
                  placeholder="Host"
                  returnKeyType='next'
                  autoCorrect={false}
                  value={this.state.host}
                // onChangeText={this.host}
                />
                <TextInput
                  style={styles.textinput}
                  placeholder="Time"
                  returnKeyType='next'
                  autoCorrect={false}
                  value={this.state.time}
                  onChangeText={this.time}
                />
                <TextInput
                  style={styles.textinput}
                  placeholder="Location"
                  returnKeyType='next'
                  autoCorrect={false}
                  value={this.state.location}
                  onChangeText={this.location}
                />
                <TextInput
                  style={styles.textinput}
                  placeholder="Summary"
                  value={this.state.summary}
                  onChangeText={this.summary}
                />
                <TextInput
                  style={styles.textinput}
                  placeholder="Cost"
                  value={this.state.cost}
                  onChangeText={this.cost}
                />
                <TextInput
                  style={styles.textinput}
                  placeholder="Registration Site"
                  value={this.state.registrationSite}
                  onChangeText={this.registrationSite}
                />
                <TextInput
                  style={{
                    height: 40,
                    backgroundColor: '#f2f3f4',
                    paddingHorizontal: 10,
                    marginTop: 20,
                    marginBottom: 20
                  }}
                  placeholder="Website"
                  value={this.state.websiteSource}
                  onChangeText={this.websiteSource}
                />
                <View stye={{ marginTop: 20, }}>
                  <Text>Select Event Type: </Text>
                  <FlatList
                    keyExtractor={(item, index) => index.toString()}
                    data={this.state.keywordList}
                    renderItem={this._renderRow}
                    extraData={this.state}
                  />
                </View>



                <TouchableOpacity
                  style={styles.bottonContainer}
                  onPress={this._create}
                >
                  <Text style={styles.bottonText}>CREATE EVENT</Text>
                </TouchableOpacity>
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