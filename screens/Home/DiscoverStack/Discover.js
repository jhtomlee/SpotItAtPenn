import React from 'react';
import { StyleSheet, SafeAreaView, AsyncStorage, FlatList, Linking, View, TouchableWithoutFeedback, ScrollView, Text } from 'react-native';
import { ListItem, Overlay, Icon } from 'react-native-elements'
import firebase from 'firebase';

export default class Discover extends React.Component {
  static navigationOptions = ({ navigation }) => {
    return {
      headerTitle: "Discover",
      headerTintColor: '#2bb5bc',
      headerStyle: {
        // backgroundColor: '#e8e8e8',
        borderBottomWidth: 0,
      },
    }
  }
  constructor(props) {
    super(props);
    this.selected = new Set();
    this.state = {
      subscribedInterests: [],
      eventsData: [],
      eventOverlayVisible: false,
      pressedItem: null
    };
  }

  async componentDidMount() {
    if (this.state.subscribedInterests.length === 0) {
      const subscribedInterestsArray = await AsyncStorage.getItem('subscribedInterestsArray');
      console.warn(subscribedInterestsArray)
      const subscribedInterests = JSON.parse(subscribedInterestsArray)
      this.setState({ subscribedInterests })
    }
    this.fetchEvents();
  }

  fetchEvents = async () => {
    const db = await firebase.firestore();
    const eventsRef = await db.collection("events");

    this.state.subscribedInterests.map(async (interest) => {
      const query = await eventsRef.where("keywords", "array-contains", interest)
      query
        .get()
        .then((querySnapshot) => {
          querySnapshot.forEach((doc) => {
            const eventElement = doc.data();
            const eventsData = this.state.eventsData;
            eventsData.push(eventElement)
            this.setState({ eventsData })
          });
        })
        .catch(function (error) {
          console.warn("Error getting documents: ", error);
        });
    })
  }

  _renderRow = item => {
    return (
      <ListItem
        title={item.item.title}
        titleStyle={{ fontSize: 16, color: 'black' }}
        subtitle={item.item.host}
        subtitleStyle={{ fontSize: 14, color: 'dimgrey' }}
        onPress={() => this._toggleEventDetails(item.item)}

      />
    );
  };

  _toggleEventDetails = item => {
    const { eventOverlayVisible } = this.state;
    this.setState({ eventOverlayVisible: !eventOverlayVisible });
    this.setState({ pressedItem: item });
  };




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
                  color="#2bb5bc"
                />
              </TouchableWithoutFeedback>
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
              <Text>{}</Text>
            </View>

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
              {`When? \n${this.state.pressedItem.time}`}
            </Text>

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