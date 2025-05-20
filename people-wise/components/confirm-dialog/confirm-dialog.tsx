import React from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet } from 'react-native';

type ConfirmDialogProps = {
  visible: boolean;
  message: string;
  buttonText?: string;
  onCancel: () => void;
  onConfirm: () => void;
};

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  visible, message, buttonText, onCancel, onConfirm
}) => (
  <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
    <View style={styles.overlay}>
      <View style={styles.box}>
        <Text style={styles.text}>{message}</Text>
        <View style={styles.buttons}>
          <TouchableOpacity onPress={onCancel} style={styles.btn}><Text>Отмена</Text></TouchableOpacity>
          <TouchableOpacity onPress={onConfirm} style={[styles.btn, styles.confirmBtn]}><Text style={{ color: '#fff' }}>{buttonText || 'ОК'}</Text></TouchableOpacity>
        </View>
      </View>
    </View>
  </Modal>
);

const styles = StyleSheet.create ({
    overlay: { ...StyleSheet.absoluteFillObject, justifyContent: 'center', alignItems: 'center' },
    box: { width: 200, backgroundColor: '#fff', borderRadius: 8, padding: 16, alignItems: 'center' },
    text: { marginBottom: 16, fontSize: 16 },
    buttons: { flexDirection: 'row', justifyContent: 'space-between', width: '100%' },
    btn: { padding: 8 },
    confirmBtn: { padding: 8, backgroundColor: '#f00', borderRadius: 5 },
})
