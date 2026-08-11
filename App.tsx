import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View } from 'react-native';
import NewCallScreen from './src/screens/NewCallScreen';

export default function App() {
  return (
    <View  style={styles.container}>
      <StatusBar style="auto" />
      <NewCallScreen />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
});
