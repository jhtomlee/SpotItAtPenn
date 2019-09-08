import React from 'react';
import { StyleSheet, SafeAreaView, View, AsyncStorage, Text, Alert, FlatList, TouchableWithoutFeedback, ScrollView, Linking } from 'react-native'
import { ListItem, Overlay, Icon } from 'react-native-elements'
import { eventsDB, usersDB, keywordsDB } from '../../../src/db'
import firebase from 'firebase';
import moment from 'moment';
import Swipeout from 'react-native-swipeout';

export default class Schedule extends React.Component {
  static navigationOptions = ({ navigation }) => {
    return {
      headerTitle: "My Schedule",
      headerTintColor: '#a41034',
      headerRight: (
        <Icon containerStyle={{ paddingRight: 14, }}
          name="logout"
          type="material-community"
          size={25}
          color="blue"
          onPress={navigation.getParam('handleHeaderRight')} />

      ),
    }
  }
  constructor(props) {
    super(props);
    this.likedEvent = new Set();
    this.likesCounts = {};
    this.state = {
      userId: null,
      eventsData: [],
      refreshing: false,
      activeRowKey: null, //delete - Swipeout component
      eventOverlayVisible: false, //event overlay
      pressedItem: null,
      pressedItemId: null,
      erased: null
    };
  }
  async componentDidMount() {
    const userId = await AsyncStorage.getItem('userId');
    if (!this.state.userId) {
      this.setState({ userId })
    }
    this.props.navigation.setParams({
      handleHeaderRight: this._logout,
    });

    await this.fetchMyEvents();

  }
  _logout = () => {
    Alert.alert(
      'Would you like to logout?',
      'Press "Ok" to return to the login screen',
      [
        {
          text: 'Ok',
          onPress: async () => {
            try {
              firebase.auth().signOut();
              this.props.navigation.navigate('Loading');
            } catch (error) {
              console.log(error);
              alert(error.toString());
            }
          },
        },
        {
          text: 'Cancel',
          onPress: async () => {
            console.log('logout cancelled')
          },
        },
      ],
      { cancelable: true }
    );
  }
  fetchMyEvents = async () => {
    const db = await firebase.firestore();
    const doc = await db.collection(usersDB).doc(this.state.userId).get();
    const eventIds = doc.data().likedEvents;

    if (eventIds) {
      eventIds.map(async eventId => {
        const eventElement = await db.collection(eventsDB).doc(eventId).get();
        const eventsData = this.state.eventsData;
        eventsData.push(eventElement)
        eventsData.sort((a, b) => {
          return a.data().time - b.data().time;
        });
        this.setState({ eventsData })
      })
    }
    this.setState({ refreshing: false })
  }
  _deleteEvent = async (eventId) => {

    const newData = this.state.eventsData.filter(item => {
      const itemData = item.id;
      return itemData.indexOf(eventId) === -1;
    });
    this.setState({ eventsData: newData });

    const db = await firebase.firestore();
    //event database
    const decrement = firebase.firestore.FieldValue.increment(-1);
    db.collection(eventsDB).doc(eventId).update({
      likedBy: firebase.firestore.FieldValue.arrayRemove(this.state.userId),
      likesCount: decrement
    }).catch(function (error) {
      console.log("Error updating document: ", error);
    });

    //userDB
    db.collection(usersDB).doc(this.state.userId).update({
      likedEvents: firebase.firestore.FieldValue.arrayRemove(eventId),
    }).catch(function (error) {
      console.log("Error updating document: ", error);
    });

  }
  _toggleEventDetails = async (item, id) => {
    const { eventOverlayVisible } = this.state;
    this.setState({ eventOverlayVisible: !eventOverlayVisible });
    this.setState({ pressedItem: item });
    this.setState({ pressedItemId: id });

    //fetch event likes info
    const db = await firebase.firestore();
    db.collection(eventsDB).doc(id).get()
      .then((doc) => {

        if (doc.exists) {
          const eventElement = doc;

          //store like counts
          this.likesCounts[doc.id] = eventElement.data().likesCount

          //store liked events by user
          const nose = eventElement.data().likedBy
          if (nose && nose.length > 0) {
            nose.map((id) => {
              if (id === this.state.userId) {
                this.likedEvent.add(doc.id)

              }
            })
          }
          const { toggle } = this.state;
          this.setState({ toggle: !toggle });

          console.log("Document data:", doc.data());
        } else {
          // doc.data() will be undefined in this case
          console.log("No such document!");
        }
      }).catch((error) => {
        console.log("Error getting document:", error);
      });
  };
  _likedAction = async (userId, eventId) => {
    const db = await firebase.firestore();
    if (!this.likedEvent.has(eventId)) {
      //erase from local array
      const newData = this.state.eventsData
      newData.push(this.state.erased)
      newData.sort((a, b) => {
        return a.data().time - b.data().time;
      });
      this.setState({ eventsData: newData })

      //event database
      const increment = firebase.firestore.FieldValue.increment(1);
      db.collection(eventsDB).doc(eventId).update({
        likedBy: firebase.firestore.FieldValue.arrayUnion(userId),
        likesCount: increment
      }).catch(function (error) {
        console.log("Error updating document: ", error);
      });
      this.likedEvent.add(eventId)
      const count = this.likesCounts[eventId]
      this.likesCounts[eventId] = count + 1;

      //userDB
      db.collection(usersDB).doc(this.state.userId).update({
        likedEvents: firebase.firestore.FieldValue.arrayUnion(eventId),
      }).catch(function (error) {
        console.log("Error updating document: ", error);
      });
    } else {
      //erase from local array
      const newData = this.state.eventsData.filter(item => {
        const itemData = item.id;
        if (itemData.indexOf(eventId) === -1) {
          return true;
        } else {
          this.setState({ erased: item })
          return false;
        }
      });
      this.setState({ eventsData: newData });

      //event database
      const decrement = firebase.firestore.FieldValue.increment(-1);
      db.collection(eventsDB).doc(eventId).update({
        likedBy: firebase.firestore.FieldValue.arrayRemove(userId),
        likesCount: decrement
      }).catch(function (error) {
        console.log("Error updating document: ", error);
      });
      this.likedEvent.delete(eventId)
      const count = this.likesCounts[eventId]
      this.likesCounts[eventId] = count - 1;

      //userDB
      db.collection(usersDB).doc(this.state.userId).update({
        likedEvents: firebase.firestore.FieldValue.arrayRemove(eventId),
      }).catch(function (error) {
        console.log("Error updating document: ", error);
      });
    }
    const { toggle } = this.state;
    this.setState({ toggle: !toggle });

  }
  _handleRefresh = async () => {
    this.setState({ eventsData: [] })
    this.likedEvent = new Set();
    this.likesCounts = {};
    this.setState({ refreshing: true }, async () => {
      await this.fetchMyEvents();
    });
  };

  /**
   * Render
   */
  _renderRow = (item) => {
    const element = item.item.data()
    const eventId = item.item.id
    const dateString = moment.unix(element.time).format("YYYY-MM-DD HH:mm");

    const swipeSettings = {
      autoClose: true,
      right: [
        {
          onPress: () => {
            this._deleteEvent(eventId);
          },
          text: 'Delete',
          type: 'delete',
        },
      ],
      rowId: item.item.id,
      sectionId: 1,
    };

    return (
      <Swipeout {...swipeSettings}>
        <ListItem
          title={element.title}
          titleStyle={{ fontSize: 16, color: 'black' }}
          subtitle={`${element.host}\n${dateString}`}
          subtitleStyle={{ fontSize: 14, color: 'dimgrey' }}
          onPress={() => this._toggleEventDetails(element, item.item.id)}

        />
      </Swipeout>
    );

  }
  renderEventOverlay = () => {
    return (
      <Overlay
        isVisible={this.state.eventOverlayVisible}
        onBackdropPress={() => this.setState({ eventOverlayVisible: false })}
        fullScreen
      >

        {this.state.pressedItem ? (
          <ScrollView
            style={{ flex: 1 }}
            showsVerticalScrollIndicator="false"
          >

            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
              <TouchableWithoutFeedback
                onPress={() => {
                  this.setState({ eventOverlayVisible: false })

                }}
              >
                <Icon
                  containerStyle={{ paddingTop: 30, }}
                  name="chevron-left"
                  size={32}
                  color="#a41034"
                />
              </TouchableWithoutFeedback>
              <View style={{ paddingRight: 30 }}>
                <Text
                  style={{
                    paddingTop: 30,
                    color: 'black',
                    fontWeight: 'bold',
                    fontSize: 18,
                  }}
                >
                  {this.state.pressedItem.title}
                </Text>
              </View>
              <View>
                <Text>{}</Text>
              </View>
            </View>

            {this.state.pressedItem.host ?
              <View style={{ alignItems: 'center' }}>
                <Text
                  style={{
                    color: 'dimgrey',
                    fontSize: 16,
                    paddingTop: 0,
                    paddingBottom: 20,
                    paddingLeft: 15,
                    paddingRight: 15,
                    textAlign: 'justify',
                  }}
                >{`${this.state.pressedItem.host}`}</Text>
              </View>
              : <View></View>}

            {this.state.pressedItem.time ?
              <Text
                style={{
                  paddingLeft: 15,
                  paddingRight: 20,
                  paddingBottom: 20,
                  fontSize: 14,
                  color: 'grey',
                  // textAlign: 'justify',
                }}
              >
                {`When? \n${moment.unix(this.state.pressedItem.time).format("YYYY-MM-DD HH:mm")}`}
              </Text>
              : <View></View>}

            {this.state.pressedItem.location ?
              <Text
                style={{
                  paddingLeft: 15,
                  paddingRight: 20,
                  paddingBottom: 20,
                  fontSize: 14,
                  color: 'grey',
                  // textAlign: 'justify',
                }}
              >
                {`Where? \n${this.state.pressedItem.location}`}
              </Text>
              : <View></View>}

            {this.state.pressedItem.summary ?
              <Text
                style={{
                  paddingLeft: 15,
                  paddingRight: 20,
                  paddingBottom: 20,
                  fontSize: 14,
                  color: 'grey',
                  // textAlign: 'justify',
                }}
              >
                {`What?: \n${this.state.pressedItem.summary}`}
              </Text>
              : <View></View>}

            {this.state.pressedItem.cost ?
              <Text
                style={{
                  paddingLeft: 15,
                  paddingRight: 20,
                  paddingBottom: 20,
                  fontSize: 14,
                  color: 'grey',
                  // textAlign: 'justify',
                }}
              >
                {`cost: ${this.state.pressedItem.cost}`}
              </Text> : <View></View>}

            {this.state.pressedItem.registrationSite ?
              <TouchableWithoutFeedback
                onPress={() => {
                  Linking.openURL(this.state.pressedItem.registrationSite);
                }}
              >
                <View>
                  <Text
                    style={{
                      paddingLeft: 15,
                      paddingRight: 20,
                      fontSize: 14,
                      color: 'grey',
                    }}
                  >Registration:
                </Text>
                  <Text
                    style={{
                      paddingLeft: 15,
                      paddingRight: 20,
                      paddingBottom: 20,
                      fontSize: 14,
                      color: 'blue',
                    }}
                  >
                    {`${this.state.pressedItem.registrationSite}`}
                  </Text>
                </View>
              </TouchableWithoutFeedback> : <View></View>}

            {this.state.pressedItem.websiteSource ?
              <TouchableWithoutFeedback
                onPress={() => {
                  Linking.openURL(this.state.pressedItem.websiteSource);
                }}
              >
                <View>
                  <Text
                    style={{
                      paddingLeft: 15,
                      paddingRight: 20,
                      fontSize: 14,
                      color: 'grey',
                    }}
                  >Website:
                </Text>
                  <Text
                    style={{
                      paddingLeft: 15,
                      paddingRight: 20,
                      paddingBottom: 20,
                      fontSize: 14,
                      color: 'blue',
                    }}
                  >
                    {`${this.state.pressedItem.websiteSource}`}
                  </Text>
                </View>
              </TouchableWithoutFeedback> : <View></View>}

            <View style={{ justifyContent: 'center', alignItems: 'center', flexDirection: 'row' }}>
              <Icon
                name={
                  this.likedEvent.has(this.state.pressedItemId) ? 'heart' : 'heart-outline'
                }
                type="material-community"
                size={25}
                iconStyle={
                  this.likedEvent.has(this.state.pressedItemId)
                    ? { color: 'red', }
                    : { color: '#a9a9a9' }
                }
                onPress={() => this._likedAction(this.state.userId, this.state.pressedItemId)}
              />
              <Text>  x {this.likesCounts[this.state.pressedItemId]}</Text>
            </View>
          </ScrollView>
        ) : (
            <View></View>
          )}
      </Overlay>
    )
  }
  render() {
    return (
      <SafeAreaView style={styles.container}>
        {this.renderEventOverlay()}
        <FlatList
          keyExtractor={(item, index) => index.toString()}
          data={this.state.eventsData}
          renderItem={this._renderRow}
          extraData={this.state}
          refreshing={this.state.refreshing}
          onRefresh={this._handleRefresh}
        />

      </SafeAreaView>
    )
  }

}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    flexDirection: 'column',
    justifyContent: 'center',
  },
})