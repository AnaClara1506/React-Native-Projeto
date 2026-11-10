import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { Platform } from 'react-native';
import { NavigationContainer, createNavigationContainerRef } from '@react-navigation/native';
import * as Notifications from 'expo-notifications';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import NewCallScreen from './src/screens/NewCallScreen';
import CallListScreen from './src/screens/CallListScreen';
import CallDetailScreen from './src/screens/CallDetailScreen';

const Stack = createNativeStackNavigator();

export const navigationRef = createNavigationContainerRef<any>();

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export default function App() {
  useEffect(() => {
    // 1. Cria o canal de notificações do Android
    if (Platform.OS === 'android') {
      Notifications.setNotificationChannelAsync('chamados', {
        name: 'Atualizações de chamados',
        importance: Notifications.AndroidImportance.HIGH,
        sound: 'default',
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF2D55',
      }).catch((err) => console.log('Erro ao registrar canal:', err));
    }
  }, []);

  useEffect(() => {
    // Função auxiliar para tentar navegar garantindo que o navigationRef está pronto
    function navegarParaDetalhe(chamadoId: string) {
      if (navigationRef.isReady()) {
        navigationRef.navigate('CallDetail', { chamadoId });
      } else {
        // Tenta novamente a cada 100ms até o NavigationContainer estar 100% pronto
        const timer = setTimeout(() => {
          navegarParaDetalhe(chamadoId);
        }, 100);
        return () => clearTimeout(timer);
      }
    }

    // A. Reage ao toque na notificação com o app aberto ou em background
    const subscription = Notifications.addNotificationResponseReceivedListener((response) => {
      const data = response.notification.request.content.data as { chamadoId?: string };
      const chamadoId = data?.chamadoId;

      if (chamadoId) {
        navegarParaDetalhe(chamadoId);
      }
    });

    // B. Reage ao toque com o app totalmente fechado (killed state)
    async function checkInitialNotification() {
      const response = await Notifications.getLastNotificationResponseAsync();
      const data = response?.notification.request.content.data as { chamadoId?: string } | undefined;
      const chamadoId = data?.chamadoId;

      if (chamadoId) {
        navegarParaDetalhe(chamadoId);
      }
    }

    checkInitialNotification();

    return () => subscription.remove();
  }, []);

  return (
    <NavigationContainer ref={navigationRef}>
      <StatusBar style="auto" />
      <Stack.Navigator initialRouteName="CallList">
        <Stack.Screen name="CallList" component={CallListScreen} options={{ title: 'Chamados' }} />
        <Stack.Screen name="NewCall" component={NewCallScreen} options={{ title: 'Novo Chamado' }} />
        <Stack.Screen name="CallDetail" component={CallDetailScreen} options={{ title: 'Detalhes do Chamado' }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}