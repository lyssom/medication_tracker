import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Card, Text, IconButton, ProgressBar } from 'react-native-paper';
import { Medication } from '../store/useMedStore';
import { formatTime, getComplianceColor } from '../utils/helpers';

interface MedCardProps {
  medication: Medication;
  checkedTimes?: number;
  onCheckIn?: () => void;
  onPress?: () => void;
  onEdit?: () => void;
  showStock?: boolean;
}

export const MedCard: React.FC<MedCardProps> = ({
  medication,
  checkedTimes = 0,
  onCheckIn,
  onPress,
  onEdit,
  showStock = true,
}) => {
  const stockPercent = Math.min(medication.stock / 30, 1); // 假设30天为满库存
  const times = medication.times || [];
  
  return (
    <Card style={styles.card} mode="elevated">
      <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
        <Card.Content>
          <View style={styles.header}>
            <View style={styles.titleRow}>
              <Text variant="titleMedium" style={styles.name}>
                {medication.name}
              </Text>
              {onEdit && (
                <IconButton
                  icon="pencil"
                  size={20}
                  onPress={onEdit}
                  style={styles.editButton}
                />
              )}
            </View>
            
            {medication.alias && (
              <Text variant="bodySmall" style={styles.alias}>
                {medication.alias}
              </Text>
            )}
          </View>
          
          <View style={styles.infoRow}>
            <View style={styles.infoItem}>
              <Text variant="bodySmall" style={styles.label}>
                服用时间
              </Text>
              <Text variant="bodyMedium">
                {times.map(t => formatTime(t)).join('、')}
              </Text>
            </View>
            
            {/* {showStock && (
              <View style={styles.infoItem}>
                <Text variant="bodySmall" style={styles.label}>
                  库存
                </Text>
                <Text variant="bodyMedium">
                  {medication.stock}{medication.unit}
                </Text>
              </View>
            )} */}
          </View>
          
          {/* {showStock && (
            <View style={styles.stockRow}>
              <ProgressBar
                progress={stockPercent}
                color={medication.stock < 7 ? '#EF4444' : '#10B981'}
                style={styles.stockBar}
              />
              <Text variant="bodySmall" style={styles.stockText}>
                {medication.stock < 7 ? '库存不足' : '库存充足'}
              </Text>
            </View>
          )} */}
          
          {/* {times.length > 0 && (
            <View style={styles.scheduleRow}>
              <Text variant="bodySmall" style={styles.label}>
                今日完成: {checkedTimes}/{times.length}
              </Text>
              {checkedTimes > 0 && checkedTimes < times.length && (
                <View
                  style={[
                    styles.complianceBadge,
                    { backgroundColor: getComplianceColor((checkedTimes / times.length) * 100) + '20' },
                  ]}
                >
                  <Text
                    variant="bodySmall"
                    style={{
                      color: getComplianceColor((checkedTimes / times.length) * 100),
                    }}
                  >
                    {(checkedTimes / times.length) * 100}%
                  </Text>
                </View>
              )}
            </View>
          )} */}
          
          {/* {onCheckIn && checkedTimes < times.length && (
            <TouchableOpacity
              style={styles.checkInButton}
              onPress={onCheckIn}
              activeOpacity={0.8}
            >
              <Text style={styles.checkInText}>立即打卡</Text>
            </TouchableOpacity>
          )} */}
        </Card.Content>
      </TouchableOpacity>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    marginBottom: 12,
    elevation: 2,
  },
  header: {
    marginBottom: 8,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  name: {
    fontWeight: '600',
  },
  editButton: {
    margin: -8,
  },
  alias: {
    color: '#6B7280',
    marginTop: 2,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  infoItem: {
    flex: 1,
  },
  label: {
    color: '#6B7280',
    marginBottom: 2,
  },
  stockRow: {
    marginTop: 4,
    marginBottom: 8,
  },
  stockBar: {
    height: 4,
    borderRadius: 2,
  },
  stockText: {
    color: '#6B7280',
    marginTop: 4,
    textAlign: 'right',
  },
  scheduleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  complianceBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  checkInButton: {
    backgroundColor: '#10B981',
    paddingVertical: 10,
    borderRadius: 8,
    marginTop: 12,
    alignItems: 'center',
  },
  checkInText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 14,
  },
});

export default MedCard;
