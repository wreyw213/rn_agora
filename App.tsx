/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * Generated with the TypeScript template
 * https://github.com/react-native-community/react-native-template-typescript
 *
 * @format
 */

import React, { useEffect, useState } from 'react';
import {
  SafeAreaView,
  SectionList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Keyboard,
} from 'react-native';

import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import {
  createAgoraRtcEngine,
  SDKBuildInfo,
  isDebuggable,
  setDebuggable,
} from 'react-native-agora';

import Basic from './src/examples/basic';
import Advanced from './src/examples/advanced';
import Hooks from './src/examples/hooks';
import JoinChannelVideoScreen from './src/container/JoinVideoScreen';

const Stack = createStackNavigator();

const DATA = [Basic, Advanced, Hooks];

const App = () => {
  const [version, setVersion] = useState<SDKBuildInfo>({});

  // useEffect(() => {
  //   console.log("heere");

  //   const engine = createAgoraRtcEngine();
  //   // setVersion(engine.getVersion());
  //   engine.release();
  // }, []);

  return (
    <NavigationContainer>

      <SafeAreaView
        style={styles.container}
        onStartShouldSetResponder={(_) => {
          Keyboard.dismiss();
          return false;
        }}
      >
        <Stack.Navigator screenOptions={{ gestureEnabled: false }}>
          {/* <Stack.Screen name={'APIExample'} component={Home} /> */}
          {/* {DATA.map((value) =>
            value.data.map(({ name, component }) =>
              component ? (
                // @ts-ignore
                <Stack.Screen name={name} component={component} />
              ) : undefined
            )
          )} */}
          <Stack.Screen name={'JoinChannelVideoScreen'} component={JoinChannelVideoScreen} />
        </Stack.Navigator>

      </SafeAreaView>
    </NavigationContainer>
  );
};

// @ts-ignore
const Home = ({ navigation }) => {
  return (
    <SectionList
      // @ts-ignore
      sections={DATA}
      keyExtractor={(item, index) => item.name + index}
      renderItem={({ item }) => <Item item={item} navigation={navigation} />}
      renderSectionHeader={({ section: { title } }) => (
        <Text style={styles.header}>{title}</Text>
      )}
    />
  );
};

// @ts-ignore
const Item = ({ item, navigation }) => (
  <View style={styles.item}>
    <TouchableOpacity onPress={() => navigation.navigate(item.name)}>
      <Text style={styles.title}>{item.name}</Text>
    </TouchableOpacity>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 10,
    fontSize: 24,
    color: 'white',
    backgroundColor: 'grey',
  },
  item: {
    padding: 15,
  },
  title: {
    fontSize: 24,
    color: 'black',
  },
  version: {
    backgroundColor: '#ffffffdd',
    textAlign: 'center',
  },
});

export default App;
