import { StyleSheet, Text, View } from 'react-native';
import React from 'react';

const textStyle = StyleSheet.create({
    text: {
        fontSize: 20,
        color: 'white',
        textAlign: 'center',
        marginTop: 50,
    },
})

const containerStyle = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#000',
    },
})

const Home = () => {
  return (
    <View style={containerStyle.container}>
      <Text style={textStyle.text}>Hello from index!</Text>
    </View>
  );
}

export default Home;