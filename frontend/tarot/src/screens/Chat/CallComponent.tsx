import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Image,
  Alert,
  ActivityIndicator,
} from 'react-native';

interface CallComponentProps {
  expertId: string;
  expertName: string;
  expertAvatar: string;
  price: number;
  isVideoCall?: boolean;
  onEndCall: () => void;
}

/**
 * Component xử lý cuộc gọi voice và video
 */
const CallComponent: React.FC<CallComponentProps> = ({
  expertId,
  expertName,
  expertAvatar,
  price,
  isVideoCall = false,
  onEndCall,
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [callStatus, setCallStatus] = useState<'connecting' | 'ongoing' | 'ended'>('connecting');
  const [callDuration, setCallDuration] = useState(0);
  const [interval, setIntervalState] = useState<NodeJS.Timeout | null>(null);
  const [cost, setCost] = useState(0);

  // Thiết lập và dọn dẹp timer đếm thời gian gọi
  useEffect(() => {
    if (isVisible && callStatus === 'ongoing') {
      // Bắt đầu đếm thời gian và tính phí
      const id = setInterval(() => {
        setCallDuration(prev => {
          const newDuration = prev + 1;
          // Tính phí mỗi phút
          if (newDuration % 60 === 0) {
            setCost(prev => prev + price);
            console.log(`Phút thứ ${newDuration / 60}, cộng thêm ${price}đ vào phí cuộc gọi`);
          }
          return newDuration;
        });
      }, 1000);
      
      setIntervalState(id);
      
      return () => clearInterval(id);
    }
  }, [isVisible, callStatus, price]);

  // Mô phỏng kết nối cuộc gọi sau khi mở modal
  useEffect(() => {
    if (isVisible) {
      console.log(`Đang kết nối ${isVideoCall ? 'video call' : 'voice call'} với chuyên gia ${expertName}`);
      
      // Giả lập thời gian kết nối
      const timer = setTimeout(() => {
        setCallStatus('ongoing');
        console.log(`Đã kết nối cuộc gọi với ${expertName}`);
      }, 2000);
      
      return () => clearTimeout(timer);
    }
  }, [isVisible, expertName, isVideoCall]);

  // Bắt đầu cuộc gọi
  const startCall = () => {
    setIsVisible(true);
    setCallStatus('connecting');
    setCallDuration(0);
    setCost(0);
  };

  // Kết thúc cuộc gọi
  const endCall = () => {
    console.log(`Kết thúc cuộc gọi với ${expertName}`);
    console.log(`Thời gian gọi: ${formatDuration(callDuration)}`);
    console.log(`Tổng phí: ${cost}đ`);
    
    setCallStatus('ended');
    
    if (interval) {
      clearInterval(interval);
      setIntervalState(null);
    }
    
    // Hiển thị thông báo tổng kết cuộc gọi
    Alert.alert(
      'Cuộc gọi đã kết thúc',
      `Thời gian: ${formatDuration(callDuration)}\nPhí: ${cost.toLocaleString('vi-VN')}đ`,
      [{ text: 'OK', onPress: () => {
        setIsVisible(false);
        onEndCall();
      }}]
    );
  };

  // Định dạng thời gian gọi
  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <>
      <TouchableOpacity
        style={[styles.callButton, isVideoCall ? styles.videoCallButton : styles.voiceCallButton]}
        onPress={startCall}
      >
        <Text style={styles.callButtonText}>
          {isVideoCall ? '📹 Video Call' : '📞 Voice Call'}
        </Text>
      </TouchableOpacity>

      <Modal
        visible={isVisible}
        animationType="slide"
        transparent={false}
        onRequestClose={endCall}
      >
        <View style={styles.modalContainer}>
          <View style={styles.callHeader}>
            <Text style={styles.callHeaderText}>
              {isVideoCall ? 'Video Call' : 'Voice Call'}
            </Text>
          </View>

          <View style={styles.expertInfoContainer}>
            <Image source={{ uri: expertAvatar }} style={styles.expertImage} />
            <Text style={styles.expertNameText}>{expertName}</Text>
            <Text style={styles.callStatusText}>
              {callStatus === 'connecting' ? 'Đang kết nối...' : 
               callStatus === 'ongoing' ? `Đang gọi... (${formatDuration(callDuration)})` : 
               'Cuộc gọi đã kết thúc'}
            </Text>
          </View>

          {/* Giả lập hiển thị video call */}
          {isVideoCall && callStatus === 'ongoing' && (
            <View style={styles.videoContainer}>
              <View style={styles.remoteVideo}>
                {/* Đây chỉ là giả lập video hiển thị */}
                <Text style={styles.videoText}>Video từ chuyên gia sẽ hiển thị ở đây</Text>
              </View>
              <View style={styles.localVideo}>
                <Text style={styles.localVideoText}>Video của bạn</Text>
              </View>
            </View>
          )}

          <View style={styles.callInfo}>
            <Text style={styles.priceText}>
              {price.toLocaleString('vi-VN')}đ/phút
            </Text>
            {callStatus === 'ongoing' && (
              <Text style={styles.costText}>
                Phí hiện tại: {cost.toLocaleString('vi-VN')}đ
              </Text>
            )}
          </View>

          <View style={styles.callControls}>
            {callStatus === 'connecting' && (
              <ActivityIndicator size="large" color="#FFFFFF" />
            )}
            
            <TouchableOpacity
              style={styles.endCallButton}
              onPress={endCall}
            >
              <Text style={styles.endCallText}>Kết thúc</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  callButton: {
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 8,
  },
  voiceCallButton: {
    backgroundColor: '#4CAF50',
  },
  videoCallButton: {
    backgroundColor: '#2196F3',
  },
  callButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#1E1E1E',
    padding: 16,
  },
  callHeader: {
    paddingTop: 48,
    paddingBottom: 16,
    alignItems: 'center',
  },
  callHeaderText: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: 'bold',
  },
  expertInfoContainer: {
    alignItems: 'center',
    marginVertical: 32,
  },
  expertImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 16,
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  expertNameText: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  callStatusText: {
    color: '#CCCCCC',
    fontSize: 16,
  },
  videoContainer: {
    flex: 1,
    position: 'relative',
    marginBottom: 20,
  },
  remoteVideo: {
    width: '100%',
    height: '100%',
    backgroundColor: '#333333',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  videoText: {
    color: '#FFFFFF',
    fontSize: 16,
  },
  localVideo: {
    position: 'absolute',
    width: 120,
    height: 160,
    backgroundColor: '#555555',
    borderRadius: 12,
    bottom: 16,
    right: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  localVideoText: {
    color: '#FFFFFF',
    fontSize: 14,
  },
  callInfo: {
    alignItems: 'center',
    marginVertical: 16,
  },
  priceText: {
    color: '#FFFFFF',
    fontSize: 16,
    marginBottom: 8,
  },
  costText: {
    color: '#FFD700',
    fontSize: 16,
    fontWeight: 'bold',
  },
  callControls: {
    alignItems: 'center',
    marginBottom: 40,
  },
  endCallButton: {
    backgroundColor: '#F44336',
    width: 70,
    height: 70,
    borderRadius: 35,
    justifyContent: 'center',
    alignItems: 'center',
  },
  endCallText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
});

export default CallComponent; 