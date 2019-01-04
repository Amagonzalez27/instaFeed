import React from 'react';
import {
  TextInput,
  TouchableOpacity,
  Text,
  View,
  Image,
  Alert,
} from 'react-native';
import { f, database } from '../../config/fbConfig';

import PhotoList from '../components/photoList';
import UserAuth from '../components/auth';

class Profile extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      loggedin: false,
      name: '',
      username: '',
      avatar: '',
      userId: '',
      editingProfile: false,
    };
  }

  fetchUserInfo = userId => {
    database
      .ref('users')
      .child(userId)
      .once('value')
      .then(snapshot => {
        const exists = snapshot.val() !== null;
        if (exists) {
          const data = snapshot.val();
          this.setState({
            username: data.username,
            name: data.name,
            avatar: data.avatar,
            loggedin: true,
            userId: userId,
          });
        }
      });
  };

  componentDidMount = () => {
    f.auth().onAuthStateChanged(user => {
      if (user) {
        // Logged in
        this.fetchUserInfo(user.uid);
      } else {
        // Not Logged in
        this.setState({
          loggedin: false,
        });
      }
    });
  };

  saveProfile = () => {
    const { name, username, userId } = this.state;

    if (name !== '') {
      database
        .ref('users')
        .child(userId)
        .child('name')
        .set(name);
    }
    if (username !== '') {
      database
        .ref('users')
        .child(userId)
        .child('username')
        .set(username);
    }
    this.setState({ editingProfile: false });
  };

  logoutUser = () => {
    f.auth().signOut();
    Alert.alert('Logged Out');
  };

  editProfile = () => {
    this.setState({ editingProfile: true });
  };

  render() {
    if (!this.state.loggedin) {
      return <UserAuth message="Please login to view your profile" />;
    }
    return (
      <View style={{ flex: 1 }}>
        <View style={{ flex: 1 }}>
          <View
            style={{
              height: 70,
              paddingTop: 30,
              backgroundColor: 'white',
              borderColor: 'lightgrey',
              borderBottomWidth: 0.5,
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <Text>Profile</Text>
          </View>
          <View
            style={{
              justifyContent: 'space-evenly',
              alignItems: 'center',
              flexDirection: 'row',
              paddingVertical: 10,
            }}
          >
            <Image
              source={{
                uri: this.state.avatar,
              }}
              style={{
                marginLeft: 10,
                width: 100,
                height: 100,
                borderRadius: 50,
              }}
            />
            <View style={{ marginRight: 10 }}>
              <Text>{this.state.name}</Text>
              <Text>{this.state.username}</Text>
            </View>
          </View>

          {this.state.editingProfile ? (
            <View
              style={{
                alignItems: 'center',
                justifyContent: 'center',
                paddingBottom: 20,
                borderBottomWidth: 1,
              }}
            >
              <TouchableOpacity
                onPress={() => this.setState({ editingProfile: false })}
              >
                <Text style={{ fontWeight: 'bold' }}>Cancel Editing</Text>
              </TouchableOpacity>
              <Text>Name:</Text>
              <TextInput
                editable={true}
                placeholder="Enter your name"
                onChangeText={text => this.setState({ name: text })}
                value={this.state.name}
                style={{
                  width: 250,
                  marginVertical: 10,
                  padding: 5,
                  borderColor: 'grey',
                  borderWidth: 1,
                }}
              />
              <Text>Username:</Text>
              <TextInput
                editable={true}
                placeholder="Enter your username"
                onChangeText={text => this.setState({ username: text })}
                value={this.state.username}
                style={{
                  width: 250,
                  marginVertical: 10,
                  padding: 5,
                  borderColor: 'grey',
                  borderWidth: 1,
                }}
              />
              <TouchableOpacity
                style={{ backgroundColor: 'blue', padding: 10 }}
                onPress={() => this.saveProfile()}
              >
                <Text style={{ color: 'white', fontWeight: 'bold' }}>
                  Save Changes
                </Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={{ paddingBottom: 20, borderBottomWidth: 1 }}>
              <TouchableOpacity
                onPress={() => this.logoutUser()}
                style={{
                  marginTop: 10,
                  marginHorizontal: 40,
                  paddingVertical: 15,
                  borderRadius: 20,
                  borderColor: 'grey',
                  borderWidth: 1.5,
                }}
              >
                <Text
                  style={{
                    textAlign: 'center',
                    color: 'grey',
                  }}
                >
                  Loggout
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => this.editProfile()}
                style={{
                  marginTop: 10,
                  marginHorizontal: 40,
                  paddingVertical: 15,
                  borderRadius: 20,
                  borderColor: 'grey',
                  borderWidth: 1.5,
                }}
              >
                <Text
                  style={{
                    textAlign: 'center',
                    color: 'grey',
                  }}
                >
                  Edit Profile
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => this.props.navigation.navigate('Upload')}
                style={{
                  marginTop: 10,
                  marginHorizontal: 40,
                  paddingVertical: 35,
                  borderRadius: 20,
                  borderColor: 'grey',
                  borderWidth: 1.5,
                  backgroundColor: 'grey',
                }}
              >
                <Text
                  style={{
                    textAlign: 'center',
                    color: 'white',
                  }}
                >
                  Upload New +
                </Text>
              </TouchableOpacity>
            </View>
          )}
          <PhotoList
            isUser={true}
            userId={this.state.userId}
            navigation={this.props.navigation}
          />
        </View>
      </View>
    );
  }
}

export default Profile;
