import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import {
  createStackNavigator,
  createBottomTabNavigator,
  // createAppContainer,
} from 'react-navigation';
import { f, auth, database, storage } from './config/fbConfig';

import Feed from './app/screens/feed';
import Upload from './app/screens/upload';
import Profile from './app/screens/profile';
import UserProfile from './app/screens/userProfile';
import Comments from './app/screens/comments';

const TabStack = createBottomTabNavigator({
  Feed: { screen: Feed },
  Upload: { screen: Upload },
  Profile: { screen: Profile },
});

const Stack = createStackNavigator(
  {
    Home: { screen: TabStack },
    User: { screen: UserProfile },
    Comments: { screen: Comments },
  },
  {
    initialRouteName: 'Home',
    mode: 'modal',
    headerMode: 'none',
  }
);

// use createAppContainer when using React-Navgition V3
// const MainStack = createAppContainer(Stack);

export default class App extends React.Component {
  render() {
    return <Stack />;
  }
}
