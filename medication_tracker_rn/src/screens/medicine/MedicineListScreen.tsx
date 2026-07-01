// screens/home/MedicineListScreen.tsx
import React, { useEffect, useState } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  RefreshControl,
  Alert,
} from 'react-native';
import { Text, IconButton, Searchbar, FAB, Chip } from 'react-native-paper';
import { useMedStore, Medication } from '../../store/useMedStore';
import { MedCard } from '../../components/MedCard';

interface MedicineListScreenProps {
  onAddMed: () => void;
  onEditMed: (medication: Medication) => void;
}

const MedicineListScreen: React.FC<MedicineListScreenProps> = ({
  onAddMed,
  onEditMed,
}) => {
  const {
    medications,
    groups,
    fetchMedications,
    fetchGroups,
    deleteMedication,
  } = useMedStore();

  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGroup, setSelectedGroup] = useState<number | null>(null);
  const [filteredMeds, setFilteredMeds] = useState<Medication[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    filterMedications();
  }, [medications, searchQuery, selectedGroup]);

  const loadData = async () => {
    await Promise.all([fetchMedications(), fetchGroups()]);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const filterMedications = () => {
    let filtered = [...medications];

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (m) =>
          m.name.toLowerCase().includes(q) ||
          (m.alias && m.alias.toLowerCase().includes(q))
      );
    }

    if (selectedGroup !== null) {
      if (selectedGroup === 0) {
        filtered = filtered.filter((m) => !m.group_id);
      } else {
        filtered = filtered.filter((m) => m.group_id === selectedGroup);
      }
    }

    setFilteredMeds(filtered);
  };

  const handleDelete = (med: Medication) => {
    Alert.alert('确认删除', `确定删除 "${med.name}" 吗？`, [
      { text: '取消', style: 'cancel' },
      {
        text: '删除',
        style: 'destructive',
        onPress: async () => {
          await deleteMedication(med.id);
        },
      },
    ]);
  };

  return (
    <View style={styles.container}>
      {/* <Searchbar
        placeholder="搜索药物..."
        value={searchQuery}
        onChangeText={setSearchQuery}
        style={styles.search}
      /> */}
<ScrollView
  refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
>
  {filteredMeds.map((med) => (
    <View key={med.id} style={{ marginBottom: 12 }}>
      <View style={{ position: 'relative' }}>
        <MedCard
          medication={med}
          onPress={() => onEditMed(med)}
          onEdit={() => onEditMed(med)}
        />
        {/* 删除按钮浮在右下角 */}
        <IconButton
          icon="delete"
          iconColor="#EF4444"
          size={20}
          onPress={() => handleDelete(med)}
          style={{
            position: 'absolute',
            bottom: 8,   // 改成 bottom
            right: 4,    // 保持右对齐
            backgroundColor: 'rgba(255,255,255,0.8)',
            borderRadius: 12, // 圆角更好看
          }}
        />
      </View>
    </View>
  ))}
</ScrollView>



      <FAB
        icon="plus"
        label="添加药物"
        style={styles.fab}
        onPress={onAddMed}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  search: { margin: 16 },
  groups: { paddingHorizontal: 16 },
  fab: { position: 'absolute', right: 16, bottom: 80 },
});

export default MedicineListScreen;
