import React from 'react';
import { StyleSheet, SafeAreaView, AsyncStorage, FlatList, Linking, View, TouchableWithoutFeedback, ScrollView, Text } from 'react-native';
import { ListItem, Overlay, Icon } from 'react-native-elements'
import firebase from 'firebase';
import { eventsDB, usersDB } from '../../../src/db'
import moment from 'moment';


export default class Discover extends React.Component {
  static navigationOptions = ({ navigation }) => {
    return {
      headerTitle: "Discover",
      headerTintColor: '#2bb5bc',
    }
  }
  constructor(props) {
    super(props);
    this.likedEvent = new Set();
    this.likesCounts = {};
    this.state = {
      userId: null,
      subscribedInterests: [],
      eventsData: [],
      likedBy: [],
      eventOverlayVisible: false,
      pressedItem: null,
      pressedItemId: null,
      toggle: false
    };
  }

  async componentDidMount() {
    if (!this.state.userId) {
      const userId = await AsyncStorage.getItem('userId');
      this.setState({ userId })
    }
    if (this.state.subscribedInterests.length === 0) {
      const subscribedInterestsArray = await AsyncStorage.getItem('subscribedInterestsArray');
      const subscribedInterests = JSON.parse(subscribedInterestsArray)
      this.setState({ subscribedInterests })
    }
    this.fetchEvents();
  }

  fetchEvents = async () => {
    const db = await firebase.firestore();
    const eventsRef = await db.collection(eventsDB);

    this.state.subscribedInterests.map(async (interest) => {
      const query = await eventsRef.where("keywords", "array-contains", interest)
      query
        .get()
        .then((querySnapshot) => {
          querySnapshot.forEach((doc) => {
            const eventElement = doc;
            const eventsData = this.state.eventsData;
            eventsData.push(eventElement)
            eventsData.sort((a, b) => {
              return a.data().time - b.data().time;
            });
            this.setState({ eventsData })

            //store like counts
            this.likesCounts[doc.id] = eventElement.data().likesCount

            //store liked events by user
            const nose = eventElement.data().likedBy
            if (nose && nose.length > 0) {
              nose.map((id) => {
                if (id === this.state.userId) {
                  this.likedEvent.add(doc.id)
                  const { toggle } = this.state;
                  this.setState({ toggle: !toggle });
                }
              })
            }
          });
        })
        .catch(function (error) {
          console.warn("Error getting documents: ", error);
        });
    })
  }

  _likedAction = async (userId, eventId) => {
    const db = await firebase.firestore();
    if (!this.likedEvent.has(eventId)) {
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
  _toggleEventDetails = (item, id) => {
    const { eventOverlayVisible } = this.state;
    this.setState({ eventOverlayVisible: !eventOverlayVisible });
    this.setState({ pressedItem: item });
    this.setState({ pressedItemId: id });
  };




  /**
   * Render
   */
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

            <View style={{ flexDirection: 'row',alignItems: 'center', justifyContent: 'space-between' }}>
              <TouchableWithoutFeedback
                onPress={() => {
                  this.setState({ eventOverlayVisible: false })

                }}
              >
                <Icon
                  containerStyle={{ paddingTop: 30, }}
                  name="chevron-left"
                  size={32}
                  color="#2bb5bc"
                />
              </TouchableWithoutFeedback>
              <View style ={{paddingRight: 20}}>
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
              <Text>    </Text>
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
          </ScrollView>
        ) : (
            <View></View>
          )}
      </Overlay>
    )
  }
  _renderRow = item => {
    const element = item.item.data()
    const eventId = item.item.id
    const dateString = moment.unix(element.time).format("YYYY-MM-DD HH:mm");

    return (
      <ListItem
        title={element.title}
        titleStyle={{ fontSize: 16, color: 'black' }}
        subtitle={`${element.host}\n${dateString}`}
        subtitleStyle={{ fontSize: 14, color: 'dimgrey' }}
        onPress={() => this._toggleEventDetails(element, item.item.id)}
        rightIcon={
          <View style={{ flexDirection: 'row' }}>
            <Icon
              name={
                this.likedEvent.has(eventId) ? 'heart' : 'heart-outline'
              }
              type="material-community"
              size={25}
              iconStyle={
                this.likedEvent.has(eventId)
                  ? { color: 'red', }
                  : { color: '#a9a9a9' }
              }
              onPress={() => this._likedAction(this.state.userId, item.item.id)}

            />
            <Text>  x {this.likesCounts[eventId]}</Text>
          </View>
        }

      />
    );
  };
  render() {
    return (
      <SafeAreaView style={styles.container}>
        {this.renderEventOverlay()}
        <FlatList
          keyExtractor={(item, index) => index.toString()}
          data={this.state.eventsData}
          renderItem={this._renderRow}
          extraData={this.state}
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