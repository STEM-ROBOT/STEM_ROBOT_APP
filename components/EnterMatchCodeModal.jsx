import React, { useState } from 'react';
import { View, Text, StyleSheet, Modal, TextInput, Button } from 'react-native';
import PropTypes from 'prop-types';
import { useNavigation } from 'expo-router';

const EnterMatchCodeModal = ({id, visible, onClose, onSubmit }) => {
    console.log(id)
  const [code, setCode] = useState('');
  const navigation = useNavigation();

  const handleSubmit = () => {
    onSubmit(code);
    setCode('');
    onClose();
    navigation.navigate('match', { matchId: id });
  };

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Nhập mã để vào trận</Text>
          <TextInput
            style={styles.input}
            placeholder="Nhập mã trận đấu"
            value={code}
            onChangeText={setCode}
          />
          <View style={styles.modalButtons}>
            <Button title="Hủy" onPress={onClose} color="#888" />
            <Button title="Xác nhận" onPress={handleSubmit} color="#007BFF" />
          </View>
        </View>
      </View>
    </Modal>
  );
};

EnterMatchCodeModal.propTypes = {
  visible: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
};

export default EnterMatchCodeModal;

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    width: 300,
    padding: 20,
    backgroundColor: 'white',
    borderRadius: 8,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  input: {
    height: 40,
    width: '100%',
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 10,
    marginBottom: 15,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
});
