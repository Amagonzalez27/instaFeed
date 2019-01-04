import React from 'react';
import { TouchableOpacity, TextInput, Text, View, Alert } from 'react-native';
import { auth, database } from '../../config/fbConfig';

class UserAuth extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      authStep: 0,
      email: '',
      password: '',
      moveScreen: false,
    };
  }

  componentDidMount = () => {
    if (this.props.moveScreen === true) {
      this.setState({ moveScreen: true });
    }
  };

  login = async () => {
    const { email, password } = this.state;

    if (email !== '' && password !== '') {
      // force user to login
      try {
        await auth.signInWithEmailAndPassword(email, password);
      } catch (error) {
        Alert.alert(error);
        console.log(error);
      }
    } else {
      Alert.alert('Please fill in email & password');
    }
  };

  createUserObj = (userObj, email) => {
    const uObj = {
      name: 'Enter name',
      username: '@name',
      avatar: 'http://www.gravatar.com/avatar',
      email: email,
    };

    database
      .ref('users')
      .child(userObj.uid)
      .set(uObj);
  };

  signUp = async () => {
    const { email, password } = this.state;

    if (email !== '' && password !== '') {
      // force user to login
      try {
        auth
          .createUserWithEmailAndPassword(email, password)
          .then(userObj => this.createUserObj(userObj.user, email))
          .catch(error => Alert.alert(error));
      } catch (error) {
        Alert.alert(error);
        console.log(error);
      }
    } else {
      Alert.alert('email or password is empty');
    }
  };

  showLogin = () => {
    if (this.state.moveScreen === true) {
      this.props.navigation.navigate('Profile');
      return false;
    }
    this.setState({ authStep: 1 });
  };

  showSignUp = () => {
    if (this.state.moveScreen === true) {
      this.props.navigation.navigate('Profile');
      return false;
    }
    this.setState({ authStep: 2 });
  };

  render() {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>You are not logged in</Text>
        <Text>{this.props.message}</Text>

        {this.state.authStep === 0 ? (
          <View style={{ marginVertical: 20, flexDirection: 'row' }}>
            <TouchableOpacity onPress={() => this.showLogin()}>
              <Text style={{ fontWeight: 'bold', color: 'green' }}>Login</Text>
            </TouchableOpacity>
            <Text style={{ marginHorizontal: 10 }}>Or</Text>
            <TouchableOpacity onPress={() => this.showSignUp()}>
              <Text style={{ fontWeight: 'bold', color: 'blue' }}>Sign Up</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={{ marginVertical: 20 }}>
            {this.state.authStep === 1 ? (
              <View>
                <TouchableOpacity
                  onPress={() => this.setState({ authStep: 0 })}
                  style={{
                    borderBottomWidth: 1,
                    paddingVertical: 5,
                    marginBottom: 10,
                    borderBottomColor: 'black',
                  }}
                >
                  <Text style={{ fontWeight: 'bold' }}>← Cancel</Text>
                </TouchableOpacity>
                <Text style={{ fontWeight: 'bold', marginBottom: 20 }}>
                  Login
                </Text>
                <Text>Email Address:</Text>
                <TextInput
                  editable={true}
                  keyboardType="email-address"
                  placeholder="Enter your email address"
                  onChangeText={text => this.setState({ email: text })}
                  value={this.state.email}
                  style={{
                    width: 250,
                    marginVertical: 10,
                    padding: 5,
                    borderColor: 'grey',
                    borderRadius: 3,
                    borderWidth: 1,
                  }}
                />
                <Text>Password:</Text>
                <TextInput
                  editable={true}
                  secureTextEntry={true}
                  placeholder="Enter your password"
                  onChangeText={text => this.setState({ password: text })}
                  value={this.state.password}
                  style={{
                    width: 250,
                    marginVertical: 10,
                    padding: 5,
                    borderColor: 'grey',
                    borderRadius: 3,
                    borderWidth: 1,
                  }}
                />

                <TouchableOpacity
                  onPress={() => this.login()}
                  style={{
                    backgroundColor: 'green',
                    paddingVertical: 10,
                    paddingHorizontal: 20,
                    borderRadius: 5,
                  }}
                >
                  <Text style={{ color: 'white' }}>Login</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View>
                <TouchableOpacity
                  onPress={() => this.setState({ authStep: 0 })}
                  style={{
                    borderBottomWidth: 1,
                    paddingVertical: 5,
                    marginBottom: 10,
                    borderBottomColor: 'black',
                  }}
                >
                  <Text style={{ fontWeight: 'bold' }}>← Cancel</Text>
                </TouchableOpacity>
                <Text style={{ fontWeight: 'bold', marginBottom: 20 }}>
                  Sign Up
                </Text>
                <Text>Email Address:</Text>
                <TextInput
                  editable={true}
                  keyboardType="email-address"
                  placeholder="Enter your email address"
                  onChangeText={text => this.setState({ email: text })}
                  value={this.state.email}
                  style={{
                    width: 250,
                    marginVertical: 10,
                    padding: 5,
                    borderColor: 'grey',
                    borderRadius: 3,
                    borderWidth: 1,
                  }}
                />
                <Text>Password:</Text>
                <TextInput
                  editable={true}
                  secureTextEntry={true}
                  placeholder="Enter your password"
                  onChangeText={text => this.setState({ password: text })}
                  value={this.state.password}
                  style={{
                    width: 250,
                    marginVertical: 10,
                    padding: 5,
                    borderColor: 'grey',
                    borderRadius: 3,
                    borderWidth: 1,
                  }}
                />

                <TouchableOpacity
                  onPress={() => this.signUp()}
                  style={{
                    backgroundColor: 'green',
                    paddingVertical: 10,
                    paddingHorizontal: 20,
                    borderRadius: 5,
                  }}
                >
                  <Text style={{ color: 'white' }}>Sign Up</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        )}
      </View>
    );
  }
}

export default UserAuth;
