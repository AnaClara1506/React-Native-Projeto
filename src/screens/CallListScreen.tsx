import React, { useState, useCallback } from 'react';
import {
    ActivityIndicator,
    Alert,
    FlatList,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { collection, getDocs, orderBy, query } from 'firebase/firestore';
import { db, ALUNO_ID } from '../firebase/config';
type Chamado = {
    id: string;
    description: string;
    photoUri?: string | null;
    address?: string | null;
    status: string;
};
export default function CallListScreen({ navigation }: any) {
    const [chamados, setChamados] = useState<Chamado[]>([]);
    const [loading, setLoading] = useState(true);
    useFocusEffect(
        useCallback(() => {
            let ativo = true;
            async function carregarChamados() {
                setLoading(true);
                try {
                    const q = query(
                    collection(db, 'alunos', ALUNO_ID, 'chamados'),
                    orderBy('criadoEm', 'desc')
                );
                const snapshot = await getDocs(q);
                const lista = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Chamado));
                    if (ativo) setChamados(lista);
                } catch (error) {
                    console.log('Erro ao carregar chamados', error);
                } finally {
                    if (ativo) setLoading(false);
                }
            }

            carregarChamados();
            return () => {
            ativo = false;
            };
        }, [])
    );
    if (loading) {
        return (
            <View style={styles.center}>
                <ActivityIndicator size="large" />
            </View>
        );
    }
    return (
        <View style={styles.screen}>
            <FlatList
                data={chamados}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.list}
                ListEmptyComponent={
                    <Text style={styles.placeholderText}>Nenhum chamado registrado ainda</Text>
                }
                renderItem={({ item }) => (
                    <TouchableOpacity
                        style={styles.card}
                        onPress={() => navigation.navigate('CallDetail', { chamadoId: item.id })}
                    >
                        <Text style={styles.cardTitle}>{item.description}</Text>
                        <Text style={styles.cardStatus}>{item.status}</Text>
                    </TouchableOpacity>
                )}
            />
            <TouchableOpacity style={styles.newButton} onPress={() => navigation.navigate('NewCall')}>
                <Text style={styles.newButtonText}>+ Novo Chamado</Text>
            </TouchableOpacity>
        </View>
    );
}
const styles = StyleSheet.create({
    screen: { flex: 1, backgroundColor: '#f5f5f5', padding: 16 },
    center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
    list: { paddingBottom: 80 },
    placeholderText: { color: '#999', textAlign: 'center', marginTop: 40 },
    card: { backgroundColor: '#fff', borderRadius: 8, padding: 16, marginBottom: 10,
    borderWidth: 1, borderColor: '#eee' },
    cardTitle: { fontSize: 16, fontWeight: '600' },
    cardStatus: { fontSize: 13, color: '#666', marginTop: 4, textTransform: 'uppercase' },
    newButton: { position: 'absolute', bottom: 16, left: 16, right: 16, backgroundColor:
    '#2e7d32', borderRadius: 8, padding: 16, alignItems: 'center' },
    newButtonText: { color: '#fff', fontWeight: 'bold' },
});