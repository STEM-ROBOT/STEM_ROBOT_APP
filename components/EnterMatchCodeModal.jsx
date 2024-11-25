import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Modal, TextInput, Button, TouchableOpacity, Alert } from 'react-native';
import PropTypes from 'prop-types';
import { router, useNavigation } from 'expo-router';
import api from '@/config/config';

const EnterMatchCodeModal = ({ id, visible, onClose, onSubmit }) => {
  const [code, setCode] = useState('');
  const [timeout, setTimeouts] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [placeholderText, setPlaceholderText] = useState('Nhập mã xác thực');
  const [attemptsLeft, setAttemptsLeft] = useState(3);
  const [statusMessage, setStatusMessage] = useState('Hết hạn sau');
  const navigation = useNavigation();

  useEffect(() => {
    let timer;
    if (countdown > 0) {
      timer = setInterval(() => {
        setCountdown((prevCountdown) => prevCountdown - 1);
      }, 1000);
    } else if (countdown === 0) {
      setTimeouts(false);
      setPlaceholderText('Nhấn nhận mã');
      clearInterval(timer);
    }
    return () => clearInterval(timer);
  }, [countdown]);

  const handleSendCode = () => {
    api
      .post(`/api/schedules/schedule-sendmail?scheduleId=${id}`)
      .then((response) => {
        setPlaceholderText(`Mã ${response.data.textView} ký tự đã gửi đến email của bạn!`);
        setCountdown(response.data.timeOut);
        setTimeouts(true);
      })
      .catch((error) => Alert.alert('Lỗi', 'Không thể gửi mã. Vui lòng thử lại sau.'));
  };

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${statusMessage} ${minutes.toString().padStart(2, '0')}:${remainingSeconds
      .toString()
      .padStart(2, '0')}s`;
  };

  const handleSubmit = () => {
    console.log(id,code)
    if (code.length === 0) {
      Alert.alert('Lỗi', 'Mã không được để trống.');
      return;
    }

    if (code.length !== 5) {
      Alert.alert('Lỗi', 'Mã xác thực phải đúng độ dài.');
      return;
    }
    api
      .post(`/api/schedules/schedule-sendcode?scheduleId=${id}&code=${code}`)
      .then((response) => {
        if (response.data.message.toLowerCase() === "success") {
          onSubmit(code);
          setCode('');
          onClose();        
          router.push({
            pathname: '/match/[id]',
            params: { id: id },
          });
        } else {
          setAttemptsLeft((prev) => prev - 1);
          if (attemptsLeft <= 1) {
            Alert.alert('Lỗi', 'Bạn đã hết lượt thử. Vui lòng yêu cầu mã mới.');
            onClose();
          } else {
            Alert.alert('Lỗi', `Sai mã. Bạn còn ${attemptsLeft - 1} lần thử.`);
          }
        }
      })
      .catch((error) => {
        console.error('Error:', error); // Log the entire error for debugging
        const errorMessage =
          error.response?.data?.message || // Extract the message from the server response
          error.message || // Use the message field if available
          'Đã xảy ra lỗi. Vui lòng thử lại.'; // Fallback error message
      
        Alert.alert('Lỗi', errorMessage);
      })

  }


  return (
    <Modal animationType="slide" transparent={true} visible={visible} onRequestClose={onClose}>
    <View style={styles.modalContainer}>
      <View style={styles.modalContent}>
        <Text style={styles.modalTitle}>Xác thực quyền truy cập</Text>
        <Text style={styles.description}>
          Hãy chắc chắn rằng bạn là trọng tài phụ của trận đấu này.
        </Text>
        <TextInput
          style={styles.input}
          placeholder={placeholderText}
          value={code}
          onChangeText={setCode}
          editable={timeout}
        />
        {timeout ? (
          <Text style={styles.timer}>{formatTime(countdown)}</Text>
        ) : (
          <TouchableOpacity onPress={handleSendCode}>
            <Text style={styles.sendCodeText}>Nhận mã</Text>
          </TouchableOpacity>
        )}
        <View style={styles.buttons}>
          <TouchableOpacity onPress={onClose} style={styles.cancelButton}>
            <Text style={styles.buttonText}>Hủy</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={handleSubmit} style={styles.confirmButton}>
            <Text style={styles.buttonText}>Xác nhận</Text>
          </TouchableOpacity>
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
  description: {
    textAlign: 'center',
    marginBottom: 10,
    color: '#555',
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
  timer: {
    marginBottom: 10,
    color: 'red',
  },
  sendCodeText: {
    color: '#007BFF',
    textDecorationLine: 'underline',
    marginBottom: 15,
    fontSize: 16,
  },
  buttons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  cancelButton: {
    padding: 10,
    backgroundColor: '#888',
    borderRadius: 5,
    flex: 1,
    marginRight: 10,
  },
  confirmButton: {
    padding: 10,
    backgroundColor: '#007BFF',
    borderRadius: 5,
    flex: 1,
  },
  buttonText: {
    color: 'white',
    textAlign: 'center',
    fontWeight: 'bold',
  },
});
