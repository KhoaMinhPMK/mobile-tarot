import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Platform,
  ViewStyle,
  TextStyle,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';

interface DatePickerProps {
  label?: string;
  value: Date | undefined;
  onChange: (date: Date) => void;
  placeholder?: string;
  containerStyle?: ViewStyle;
  labelStyle?: TextStyle;
  error?: string;
  errorStyle?: TextStyle;
  maximumDate?: Date;
  minimumDate?: Date;
}

/**
 * Component DatePicker tùy chỉnh
 */
const DatePickerComponent: React.FC<DatePickerProps> = ({
  label,
  value = new Date(),
  onChange,
  placeholder = 'Chọn ngày',
  containerStyle,
  labelStyle,
  error,
  errorStyle,
  maximumDate = new Date(),
  minimumDate = new Date(1900, 0, 1),
}) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [tempDate, setTempDate] = useState(value || new Date());
  const [showPicker, setShowPicker] = useState(false);

  const formatDate = (date: Date) => {
    return date.toISOString().split('T')[0];
  };

  const showDatepicker = () => {
    if (Platform.OS === 'android') {
      setShowPicker(true);
    } else {
      setModalVisible(true);
    }
  };

  const handleChange = (event: any, selectedDate?: Date) => {
    if (Platform.OS === 'android') {
      setShowPicker(false);
      if (selectedDate) {
        onChange(selectedDate);
      }
    } else {
      setTempDate(selectedDate || tempDate);
    }
  };

  const handleConfirm = () => {
    onChange(tempDate);
    setModalVisible(false);
  };

  const handleCancel = () => {
    setModalVisible(false);
  };

  return (
    <View style={[styles.container, containerStyle]}>
      {label && <Text style={[styles.label, labelStyle]}>{label}</Text>}
      <TouchableOpacity
        style={[styles.input, error && styles.inputError]}
        onPress={showDatepicker}
      >
        <Text style={value ? styles.text : styles.placeholder}>
          {value ? formatDate(value) : placeholder}
        </Text>
      </TouchableOpacity>
      {error && <Text style={[styles.errorText, errorStyle]}>{error}</Text>}

      {showPicker && Platform.OS === 'android' && (
        <DateTimePicker
          testID="dateTimePicker"
          value={value || new Date()}
          mode="date"
          display="default"
          onChange={handleChange}
          maximumDate={maximumDate}
          minimumDate={minimumDate}
        />
      )}

      {Platform.OS === 'ios' && (
        <Modal
          animationType="slide"
          transparent={true}
          visible={modalVisible}
          onRequestClose={handleCancel}
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <TouchableOpacity onPress={handleCancel}>
                  <Text style={styles.modalCancel}>Hủy</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={handleConfirm}>
                  <Text style={styles.modalConfirm}>Xác nhận</Text>
                </TouchableOpacity>
              </View>
              <DateTimePicker
                testID="dateTimePicker"
                value={tempDate}
                mode="date"
                display="spinner"
                onChange={(event, date) => date && setTempDate(date)}
                style={styles.datePicker}
                maximumDate={maximumDate}
                minimumDate={minimumDate}
                locale="vi"
              />
            </View>
          </View>
        </Modal>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 15,
    width: '100%',
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
    color: '#333',
    fontWeight: '500',
  },
  input: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingVertical: 12,
  },
  inputError: {
    borderColor: '#FF3B30',
  },
  text: {
    fontSize: 16,
    color: '#333',
  },
  placeholder: {
    fontSize: 16,
    color: '#A0A0A0',
  },
  errorText: {
    color: '#FF3B30',
    fontSize: 14,
    marginTop: 5,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: 'white',
    borderTopLeftRadius: 15,
    borderTopRightRadius: 15,
    paddingBottom: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  modalCancel: {
    color: '#FF3B30',
    fontSize: 16,
    fontWeight: '500',
  },
  modalConfirm: {
    color: '#6A11CB',
    fontSize: 16,
    fontWeight: '500',
  },
  datePicker: {
    height: 200,
  },
});

export default DatePickerComponent; 