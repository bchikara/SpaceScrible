/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import React from 'react';
import type {PropsWithChildren} from 'react';
import { View, Text, StyleSheet } from 'react-native';


import SensorView from './src/views/SensorView';



function App(): React.JSX.Element {


  return (
    <View style={styles.container}>
      <Text style={styles.centeredText}>Space Scribe</Text>
      <SensorView />
    </View>
  );
}


const styles = StyleSheet.create({
  container: {
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center', 
    backgroundColor: 'white',
  },
  centeredText: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center', 
  },
});

export default App;
