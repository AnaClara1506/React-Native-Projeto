import React, { useState } from 'react';
import {
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import { collection, addDoc, updateDoc, doc, serverTimestamp } from 'firebase/firestore';
import { db, ALUNO_ID } from '../firebase/config';
import * as Notifications from 'expo-notifications';

const SLA_SECONDS = 10;

export default function NewCallScreen({ navigation }: any) {
  // Estados
  const [description, setDescription] = useState('');
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [address, setAddress] = useState<string | null>(null);
  const [loadingLocation, setLoadingLocation] = useState(false);
  const [saving, setSaving] = useState(false);

  // Função para tirar foto com a câmera
  async function handleTakePhoto() {
    const permission = await ImagePicker.requestCameraPermissionsAsync();

    if (!permission.granted) {
      Alert.alert('Permissão negada', 'Precisamos da câmera para o chamado.');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.7,
    });

    if (!result.canceled) {
      setPhotoUri(result.assets[0].uri);
    }
  }

  // Função para escolher da galeria
  async function handlePickFromGallery() {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permission.granted) {
      Alert.alert('Permissão negada', 'Precisamos acessar suas fotos.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.7,
    });

    if (!result.canceled) {
      setPhotoUri(result.assets[0].uri);
    }
  }

  // Obter localização
  async function handleGetLocation() {
    const permission = await Location.requestForegroundPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Permissão negada', 'Precisamos da localização para o check-in');
      return;
    }
    setLoadingLocation(true);
    try {
      const gpsAtivo = await Location.hasServicesEnabledAsync();
      if (!gpsAtivo) {
        Alert.alert('GPS desligado', 'Ative a localização do aparelho e tente novamente');
        return;
      }
      const position = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      const [local] = await Location.reverseGeocodeAsync({
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
      });
      if (local) {
        const enderecoFormatado = `${local.street ?? 'Endereço não identificado'}, ${local.city ?? ''} - ${local.region ?? ''}`;
        setAddress(enderecoFormatado);
      } else {
        setAddress('Endereço não encontrado para esta coordenada.');
      }
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível obter a localização. Tente novamente');
    } finally {
      setLoadingLocation(false);
    }
  }

  // Criar chamado
  async function handleCreateCall() {
  setSaving(true);

  try {
    // 1. Cria o documento no Firestore
    const docRef = await addDoc(collection(db, 'alunos', ALUNO_ID, 'chamados'), {
      description,
      photoUri,
      address,
      status: 'aberto',
      criadoEm: serverTimestamp(),
    });

    // 2. Pede permissão e agenda a notificação de SLA
    const permission = await Notifications.requestPermissionsAsync();

    if (permission.granted) {
      const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title: 'TechCall - Alerta de SLA',
          body: 'O prazo de atendimento de um chamado expirou!',
          data: { chamadoId: docRef.id },
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
          seconds: SLA_SECONDS,
          channelId: 'chamados',
        },
      });

      // 3. Salva o id da notificação agendada no próprio chamado recém-criado
      await updateDoc(docRef, { 
        slaNotificationId: notificationId 
      });
    }

    // 4. Limpa o formulário e navega de volta
    Alert.alert('Sucesso', 'Chamado registrado!');
    setDescription('');
    setPhotoUri(null);
    setAddress(null);
    navigation.navigate('CallList');

  } catch (error) {
    console.error('Erro ao criar chamado:', error);
    Alert.alert('Erro', 'Não foi possível salvar o chamado. Tente novamente.');
  } finally {
    setSaving(false);
  }
}

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Novo Chamado</Text>
      
      <Text style={styles.label}>Descrição do problema</Text>
      <TextInput
        style={styles.input}
        placeholder="Ex.: Notebook não liga..."
        value={description}
        onChangeText={setDescription}
        multiline
      />

      <Text style={styles.label}>Foto do equipamento</Text>
      {photoUri ? (
        <View>
          <Image source={{ uri: photoUri }} style={styles.photo} />
          <TouchableOpacity onPress={() => setPhotoUri(null)} style={styles.removeButton}>
            <Text style={styles.removeButtonText}>Remover foto</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.placeholder}>
          <Text style={styles.placeholderText}>Nenhuma foto anexada</Text>
        </View>
      )}

      <View style={styles.buttonRow}>
        <TouchableOpacity style={[styles.button, styles.cameraButton]} onPress={handleTakePhoto}>
          <Text style={styles.buttonText}>Câmera</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.button, styles.galleryButton]} onPress={handlePickFromGallery}>
          <Text style={styles.buttonText}>Galeria</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.label}>Localização do chamado</Text>
      {loadingLocation ? (
        <Text style={styles.placeholderText}>Buscando localização...</Text>
      ) : address ? (
        <Text style={styles.addressText}>{address}</Text>
      ) : (
        <Text style={styles.placeholderText}>Nenhuma localização registrada</Text>
      )}
      <TouchableOpacity
        style={[styles.button, styles.locationButton]}
        onPress={handleGetLocation}
        disabled={loadingLocation}
      >
        <Text style={styles.buttonText}>
          {loadingLocation ? 'Buscando...' : 'Registrar localização'}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[
          styles.button,
          styles.confirmButton,
          (!description || saving) && styles.disabledButton,
        ]}
        disabled={!description || saving}
        onPress={handleCreateCall}
      >
        <Text style={styles.buttonText}>
          {saving ? 'Salvando...' : 'Criar Chamado'}
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#f5f5f5' },
  content: { padding: 20, paddingBottom: 40 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20 },
  label: { fontSize: 14, fontWeight: '600', marginTop: 16, marginBottom: 8 },
  input: { borderWidth: 1, borderColor: '#ccc', borderRadius: 8, backgroundColor: '#fff', padding: 12, minHeight: 80, textAlignVertical: 'top' },
  placeholder: { height: 160, borderRadius: 8, borderWidth: 1, borderColor: '#ccc', borderStyle: 'dashed', backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center' },
  placeholderText: { color: '#999' },
  photo: { width: '100%', height: 200, borderRadius: 8 },
  removeButton: { marginTop: 8, alignItems: 'center' },
  removeButtonText: { color: '#d32f2f', fontWeight: 'bold' },
  buttonRow: { flexDirection: 'row', marginTop: 16, gap: 10 },
  button: { flex: 1, borderRadius: 8, padding: 14, alignItems: 'center' },
  cameraButton: { backgroundColor: '#1565c0' },
  galleryButton: { backgroundColor: '#6a1b9a' },
  confirmButton: { backgroundColor: '#2e7d32', marginTop: 20 },
  disabledButton: { backgroundColor: '#a5d6a7' },
  buttonText: { color: '#fff', fontWeight: 'bold' },
  addressText: { fontSize: 14, color: '#333', marginBottom: 8 },
  locationButton: { backgroundColor: '#00695c', marginTop: 8 },
});