import React from 'react';
import { Modal, View, StyleSheet, Linking, Alert } from 'react-native';
import { Text, Button } from 'react-native-paper';
import { AppVersion } from '../services/api';

interface UpdateModalProps {
  visible: boolean;
  version: AppVersion | null;
  mandatory: boolean;
  onDismiss: () => void;
}

const UpdateModal: React.FC<UpdateModalProps> = ({
  visible,
  version,
  mandatory,
  onDismiss,
}) => {
  if (!version) return null;

  const handleUpdate = async () => {
    const url = version.download_url;
    if (!url) {
      Alert.alert('更新', '下载链接无效，请稍后再试。');
      return;
    }
    try {
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
      } else {
        Alert.alert('更新', '无法打开下载链接，请手动复制：' + url);
      }
    } catch (e: any) {
      Alert.alert('更新', '打开链接失败：' + (e?.message ?? e));
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={mandatory ? undefined : onDismiss}
    >
      <View style={styles.backdrop}>
        <View style={styles.card}>
          <Text variant="titleLarge" style={styles.title}>
            发现新版本
          </Text>
          <Text variant="bodyMedium" style={styles.versionLine}>
            v{version.version} (build {version.build})
          </Text>
          {version.notes ? (
            <View style={styles.notesBox}>
              <Text variant="bodySmall">{version.notes}</Text>
            </View>
          ) : null}

          <View style={styles.btnRow}>
            {!mandatory && (
              <Button
                mode="outlined"
                onPress={onDismiss}
                style={styles.btn}
              >
                稍后
              </Button>
            )}
            <Button
              mode="contained"
              onPress={handleUpdate}
              style={styles.btn}
            >
              {mandatory ? '立即更新' : '立即下载'}
            </Button>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    width: '100%',
    maxWidth: 400,
  },
  title: {
    fontWeight: '700',
    marginBottom: 8,
  },
  versionLine: {
    color: '#666',
    marginBottom: 12,
  },
  notesBox: {
    backgroundColor: '#f5f5f5',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  btnRow: {
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'flex-end',
  },
  btn: {
    minWidth: 100,
  },
});

export default UpdateModal;
