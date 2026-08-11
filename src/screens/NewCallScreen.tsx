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

export default function NewCallScreen() {
  // Estados: "caixinhas" que guardam o que o usuário digita ou a foto que escolhe
  const [description, setDescription] = useState('');
  const [photoUri, setPhotoUri] = useState<string | null>(null);

  // Função para tirar foto com a câmera
  async function handleTakePhoto() {
    // 1. Pede permissão para usar a câmera
    const permission = await ImagePicker.requestCameraPermissionsAsync();

    if (!permission.granted) {
      Alert.alert('Permissão negada', 'Precisamos da câmera para o chamado.');
      return;
    }

    // 2. Abre a câmera
    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true, // Permite cortar a foto
      aspect: [4, 3],      // Proporção da imagem
      quality: 0.7,        // Qualidade (70% para não pesar o app)
    });

    // 3. Se o usuário não cancelou, salva o endereço (URI) da foto
    if (!result.canceled) {
      setPhotoUri(result.assets[0].uri);
    }
  }

  // Função para escolher da galeria
  async function handlePickFromGallery() {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permission.granted) {
      Alert.alert('Permissão negada', 'Precisamos acessar suas fotos.');      return;
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
      {/*Renderização Condicional: Se tem foto, mostra a imagem. Se não, mostra o aviso.*/}
      {photoUri ? (
        <View>
          <Image source={{ uri: photoUri }} style={styles.photo} />
          <TouchableOpacity
            onPress={() => setPhotoUri(null)}
            style={styles.removeButton}>
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
      <TouchableOpacity
        style={[styles.button, styles.confirmButton, !description && styles.disabledButton]}
        disabled={!description}
        onPress={() => Alert.alert('Sucesso', 'Chamado registrado localmente!')}
      >
        <Text style={styles.buttonText}>Criar Chamado</Text>
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
});