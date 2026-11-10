import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import * as Notifications from 'expo-notifications'; // 1. Importação necessária
import { db, ALUNO_ID } from '../firebase/config';

type Chamado = {
  description: string;
  photoUri?: string | null;
  address?: string | null;
  status: string;
  slaNotificationId?: string | null; // 2. Incluído o ID da notificação na tipagem
};

export default function CallDetailScreen({ route }: any) {
  const { chamadoId } = route.params;
  const [chamado, setChamado] = useState<Chamado | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function carregarChamado() {
      try {
        setLoading(true);
        const docRef = doc(db, 'alunos', ALUNO_ID, 'chamados', chamadoId);
        const snapshot = await getDoc(docRef);

        if (snapshot.exists()) {
          setChamado(snapshot.data() as Chamado);
        } else {
          Alert.alert('Erro', 'Chamado não encontrado.');
        }
      } catch (error) {
        console.log('Erro ao carregar chamado:', error);
        Alert.alert('Erro', 'Não foi possível carregar os dados.');
      } finally {
        setLoading(false);
      }
    }

    carregarChamado();
  }, [chamadoId]);

  async function mudarStatus(novoStatus: string) {
    try {
      setLoading(true);
      const docRef = doc(db, 'alunos', ALUNO_ID, 'chamados', chamadoId);

      // 3. Cancela a notificação agendada se existir um ID salvo
      if (chamado?.slaNotificationId) {
        try {
          await Notifications.cancelScheduledNotificationAsync(chamado.slaNotificationId);
          console.log('Notificação de SLA cancelada com sucesso:', chamado.slaNotificationId);
        } catch (notifError) {
          console.log('Erro ao cancelar notificação:', notifError);
        }
      }

      // 4. Atualiza o status e remove/limpa o ID da notificação no banco
      await updateDoc(docRef, { 
        status: novoStatus,
        slaNotificationId: null // Remove o ID para não tentar cancelar duas vezes
      });

      // Atualiza o estado local para a tela refletir a mudança na hora
      setChamado((prev) => (prev ? { ...prev, status: novoStatus, slaNotificationId: null } : null));
    } catch (error) {
      console.log('Erro ao atualizar status:', error);
      Alert.alert('Erro', 'Não foi possível alterar o status.');
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (!chamado) {
    return (
      <View style={styles.center}>
        <Text>Nenhum dado encontrado.</Text>
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <Text style={styles.label}>Descrição:</Text>
      <Text style={styles.value}>{chamado.description}</Text>

      <Text style={styles.label}>Status:</Text>
      <Text style={styles.statusText}>{chamado.status.toUpperCase()}</Text>

      {chamado.address ? (
        <>
          <Text style={styles.label}>Endereço:</Text>
          <Text style={styles.value}>{chamado.address}</Text>
        </>
      ) : null}

      {chamado.photoUri ? (
        <>
          <Text style={styles.label}>Foto:</Text>
          <Image source={{ uri: chamado.photoUri }} style={styles.image} />
        </>
      ) : null}

      {/* Ações condicionais baseadas no status */}
      <View style={styles.actionsContainer}>
        {chamado.status === 'aberto' && (
          <>
            <TouchableOpacity
              style={[styles.button, styles.primaryButton]}
              onPress={() => mudarStatus('atendendo')}
            >
              <Text style={styles.buttonText}>Iniciar Atendimento</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, styles.dangerButton]}
              onPress={() => mudarStatus('cancelado')}
            >
              <Text style={styles.buttonText}>Cancelar Chamado</Text>
            </TouchableOpacity>
          </>
        )}

        {chamado.status === 'atendendo' && (
          <TouchableOpacity
            style={[styles.button, styles.successButton]}
            onPress={() => mudarStatus('concluido')}
          >
            <Text style={styles.buttonText}>Concluir Atendimento</Text>
          </TouchableOpacity>
        )}

        {(chamado.status === 'concluido' || chamado.status === 'cancelado') && (
          <Text style={styles.closedText}>Este chamado foi finalizado.</Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#f5f5f5', padding: 20 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  label: { fontSize: 14, fontWeight: 'bold', color: '#666', marginTop: 12 },
  value: { fontSize: 16, color: '#333', marginTop: 4 },
  statusText: { fontSize: 16, fontWeight: 'bold', color: '#2e7d32', marginTop: 4 },
  image: { width: '100%', height: 200, borderRadius: 8, marginTop: 8 },
  actionsContainer: { marginTop: 30 },
  button: { padding: 14, borderRadius: 8, alignItems: 'center', marginBottom: 10 },
  primaryButton: { backgroundColor: '#1976d2' },
  successButton: { backgroundColor: '#2e7d32' },
  dangerButton: { backgroundColor: '#d32f2f' },
  buttonText: { color: '#fff', fontWeight: 'bold' },
  closedText: { textAlign: 'center', color: '#888', fontStyle: 'italic', marginTop: 20 },
});