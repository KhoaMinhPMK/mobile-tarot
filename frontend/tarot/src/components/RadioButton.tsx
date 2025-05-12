import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ViewStyle,
  TextStyle,
} from 'react-native';

interface Option {
  label: string;
  value: string;
}

interface RadioButtonProps {
  label?: string;
  options: Option[];
  selectedValue: string;
  onSelect: (value: string) => void;
  containerStyle?: ViewStyle;
  labelStyle?: TextStyle;
  error?: string;
  errorStyle?: TextStyle;
  horizontal?: boolean;
}

/**
 * Component RadioButton cho việc chọn giới tính hoặc các lựa chọn khác
 */
const RadioButton: React.FC<RadioButtonProps> = ({
  label,
  options,
  selectedValue,
  onSelect,
  containerStyle,
  labelStyle,
  error,
  errorStyle,
  horizontal = false,
}) => {
  return (
    <View style={[styles.container, containerStyle]}>
      {label && <Text style={[styles.label, labelStyle]}>{label}</Text>}
      
      <View style={[
        styles.optionsContainer, 
        horizontal && styles.horizontalContainer
      ]}>
        {options.map((option) => (
          <TouchableOpacity
            key={option.value}
            style={[
              styles.option,
              horizontal && styles.horizontalOption,
            ]}
            onPress={() => onSelect(option.value)}
          >
            <View style={[
              styles.radioOuter,
              selectedValue === option.value && styles.radioOuterSelected,
            ]}>
              {selectedValue === option.value && (
                <View style={styles.radioInner} />
              )}
            </View>
            <Text style={styles.optionLabel}>{option.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {error && <Text style={[styles.errorText, errorStyle]}>{error}</Text>}
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
  optionsContainer: {
    flexDirection: 'column',
  },
  horizontalContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  horizontalOption: {
    marginRight: 20,
  },
  radioOuter: {
    height: 20,
    width: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#ddd',
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioOuterSelected: {
    borderColor: '#6A11CB',
  },
  radioInner: {
    height: 10,
    width: 10,
    borderRadius: 5,
    backgroundColor: '#6A11CB',
  },
  optionLabel: {
    marginLeft: 10,
    fontSize: 16,
    color: '#333',
  },
  errorText: {
    color: '#FF3B30',
    fontSize: 14,
    marginTop: 5,
  },
});

export default RadioButton; 