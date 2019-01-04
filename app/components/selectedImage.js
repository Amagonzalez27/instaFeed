import React from 'react';
import { ActivityIndicator, Text, View, Image } from 'react-native';

export default class SelectedImage extends React.Component {
  render() {
    return (
      <View style={{ flex: 1 }}>
        {/**Check if user clicked the upload & publish button */}
        {this.props.uploading === true ? (
          <View style={{ marginTop: 10 }}>
            <Text>{this.props.progress}%</Text>
            {/*Check the progress */}
            {this.props.progress !== 100 ? (
              <ActivityIndicator size="small" color="blue" />
            ) : (
              <Text>Processing</Text>
            )}
          </View>
        ) : (
          <View>
            <Text>Something will go here</Text>
          </View>
        )}

        <Image
          source={{ uri: this.props.uri }}
          style={{
            marginTop: 10,
            resizeMode: 'cover',
            width: '100%',
            height: 275,
          }}
        />
      </View>
    );
  }
}
