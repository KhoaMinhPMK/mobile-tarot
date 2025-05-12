import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  Image,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/AppNavigator';
import CallComponent from './CallComponent';

// Định nghĩa kiểu dữ liệu cho tin nhắn
interface Message {
  id: string;
  text: string;
  sender: 'user' | 'expert';
  timestamp: Date;
  status?: 'sending' | 'sent' | 'delivered' | 'read';
  isPaid?: boolean;
}

type ChatRoomRouteProp = RouteProp<RootStackParamList, 'ChatRoom'>;
type ChatRoomNavigationProp = NativeStackNavigationProp<RootStackParamList, 'ChatRoom'>;

/**
 * Màn hình chat với chuyên gia Tarot
 */
const ChatRoomScreen = () => {
  const navigation = useNavigation<ChatRoomNavigationProp>();
  const route = useRoute<ChatRoomRouteProp>();
  const { expertId, expertName, expertAvatar, price } = route.params;

  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [balance, setBalance] = useState(100000); // Số dư xu mẫu
  const [loading, setLoading] = useState(true);
  const [remainingCredits, setRemainingCredits] = useState(2); // Lượt xem còn lại mẫu
  const [isSending, setIsSending] = useState(false);
  
  const listRef = useRef<FlatList>(null);

  // Mô phỏng tải dữ liệu lịch sử chat
  useEffect(() => {
    console.log(`Đang tải dữ liệu chat với chuyên gia ID: ${expertId}`);
    
    // Giả lập thời gian tải dữ liệu
    const timer = setTimeout(() => {
      // Tin nhắn mẫu
      const initialMessages: Message[] = [
        {
          id: '1',
          text: `Xin chào, tôi là ${expertName}. Tôi có thể giúp gì cho bạn hôm nay?`,
          sender: 'expert',
          timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 ngày trước
          status: 'read',
          isPaid: true,
        },
      ];
      
      setMessages(initialMessages);
      setLoading(false);
      
      console.log('Đã tải xong dữ liệu chat');
    }, 1500);
    
    return () => clearTimeout(timer);
  }, [expertId, expertName]);

  // Cuộn xuống tin nhắn mới nhất khi có tin nhắn mới
  useEffect(() => {
    if (messages.length > 0 && !loading) {
      setTimeout(() => {
        listRef.current?.scrollToEnd({ animated: true });
      }, 200);
    }
  }, [messages, loading]);

  // Hàm kiểm tra và tính phí cho tin nhắn
  const checkAndChargeFee = (): boolean => {
    if (remainingCredits > 0) {
      console.log(`Sử dụng lượt xem miễn phí. Còn lại: ${remainingCredits - 1} lượt`);
      setRemainingCredits(prev => prev - 1);
      return true;
    } else if (balance >= price) {
      console.log(`Trừ ${price} đồng cho tin nhắn này. Số dư còn lại: ${balance - price} đồng`);
      setBalance(prev => prev - price);
      return true;
    } else {
      console.log('Không đủ xu để gửi tin nhắn');
      Alert.alert(
        'Không đủ xu',
        'Bạn không còn đủ xu để gửi tin nhắn. Vui lòng nạp thêm để tiếp tục trò chuyện.',
        [
          { text: 'Hủy', style: 'cancel' },
          { text: 'Nạp xu', onPress: () => console.log('Chuyển hướng đến màn hình nạp xu') }
        ]
      );
      return false;
    }
  };

  // Hàm xử lý gửi tin nhắn
  const handleSendMessage = () => {
    if (!inputText.trim()) return;
    
    if (!checkAndChargeFee()) return;
    
    setIsSending(true);
    
    // Tạo tin nhắn mới từ người dùng
    const newUserMessage: Message = {
      id: Date.now().toString(),
      text: inputText.trim(),
      sender: 'user',
      timestamp: new Date(),
      status: 'sending',
      isPaid: true,
    };
    
    // Cập nhật danh sách tin nhắn với tin nhắn của người dùng
    setMessages(prev => [...prev, newUserMessage]);
    
    // Xóa text trong input
    setInputText('');
    
    console.log(`Đã gửi tin nhắn: "${newUserMessage.text}"`);
    
    // Giả lập độ trễ mạng
    setTimeout(() => {
      // Cập nhật trạng thái tin nhắn thành đã gửi
      setMessages(prev => 
        prev.map(msg => 
          msg.id === newUserMessage.id 
            ? { ...msg, status: 'sent' } 
            : msg
        )
      );
      
      // Giả lập tin nhắn phản hồi từ chuyên gia
      setTimeout(() => {
        // Cập nhật trạng thái tin nhắn thành đã đọc
        setMessages(prev => 
          prev.map(msg => 
            msg.id === newUserMessage.id 
              ? { ...msg, status: 'read' } 
              : msg
          )
        );
        
        // Mảng các câu trả lời mẫu từ chuyên gia
        const expertReplies = [
          'Tôi đang xem lá bài Tarot của bạn. Hãy thả lỏng và suy nghĩ về vấn đề bạn muốn giải đáp.',
          'Lá bài Tháp Sụp - The Tower cho thấy bạn đang trải qua những thay đổi lớn. Đừng lo lắng, sau cơn mưa trời sẽ sáng.',
          'Tôi nhìn thấy lá bài Mặt Trời - The Sun. Đây là dấu hiệu tốt cho thấy sắp tới bạn sẽ có niềm vui và thành công.',
          'Lá bài Mặt Trăng - The Moon xuất hiện. Bạn đang có những cảm xúc phức tạp và lo lắng về tương lai. Hãy tin vào trực giác của mình.',
          'Tôi thấy lá Hoàng Đế - The Emperor. Đây là thời điểm tốt để cơ cấu lại và đưa ra các quyết định quan trọng.',
        ];
        
        // Chọn ngẫu nhiên một câu trả lời
        const randomReply = expertReplies[Math.floor(Math.random() * expertReplies.length)];
        
        // Tạo tin nhắn phản hồi từ chuyên gia
        const newExpertMessage: Message = {
          id: (Date.now() + 1).toString(),
          text: randomReply,
          sender: 'expert',
          timestamp: new Date(),
          status: 'sent',
          isPaid: true,
        };
        
        // Cập nhật danh sách tin nhắn với tin nhắn từ chuyên gia
        setMessages(prev => [...prev, newExpertMessage]);
        console.log(`Nhận tin nhắn từ chuyên gia: "${randomReply}"`);
        
        setIsSending(false);
      }, 1500);
    }, 1000);
  };

  // Xử lý khi cuộc gọi kết thúc
  const handleCallEnd = () => {
    console.log('Cuộc gọi đã kết thúc, quay lại màn hình chat');
  };

  // Hiển thị mỗi tin nhắn
  const renderMessageItem = ({ item }: { item: Message }) => {
    const isUserMessage = item.sender === 'user';
    
    return (
      <View style={[
        styles.messageContainer,
        isUserMessage ? styles.userMessageContainer : styles.expertMessageContainer,
      ]}>
        {!isUserMessage && (
          <Image source={{ uri: expertAvatar }} style={styles.messageAvatar} />
        )}
        
        <View style={[
          styles.messageBubble,
          isUserMessage ? styles.userMessageBubble : styles.expertMessageBubble,
        ]}>
          <Text style={[
            styles.messageText,
            isUserMessage && { color: '#FFFFFF' }
          ]}>{item.text}</Text>
          
          <Text style={[
            styles.messageTime,
            isUserMessage && { color: 'rgba(255, 255, 255, 0.7)' }
          ]}>
            {item.timestamp.toLocaleTimeString('vi-VN', { 
              hour: '2-digit', 
              minute: '2-digit',
            })}
            {isUserMessage && item.status && (
              <Text style={[
                styles.messageStatus,
                isUserMessage && { color: 'rgba(255, 255, 255, 0.7)' }
              ]}>
                {' '}{item.status === 'sending' ? '⌛' : item.status === 'sent' ? '✓' : item.status === 'delivered' ? '✓✓' : '✓✓'}
              </Text>
            )}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        
        <View style={styles.expertInfo}>
          <Image source={{ uri: expertAvatar }} style={styles.expertAvatar} />
          <View>
            <Text style={styles.expertName}>{expertName}</Text>
            <Text style={styles.expertStatus}>
              <View style={styles.onlineIndicator} />
              <Text style={styles.onlineText}>Trực tuyến</Text>
            </Text>
          </View>
        </View>
        
        <TouchableOpacity 
          style={styles.infoButton}
          onPress={() => Alert.alert('Thông tin', `Giá chat: ${price.toLocaleString('vi-VN')} đ/tin nhắn\nGiá gọi: ${(price * 2).toLocaleString('vi-VN')} đ/phút\nSố dư: ${balance.toLocaleString('vi-VN')} đ\nLượt miễn phí: ${remainingCredits}`)}
        >
          <Text style={styles.infoButtonText}>ℹ️</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#6A11CB" />
          <Text style={styles.loadingText}>Đang tải cuộc trò chuyện...</Text>
        </View>
      ) : (
        <>
          <FlatList
            ref={listRef}
            data={messages}
            renderItem={renderMessageItem}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.messagesList}
            showsVerticalScrollIndicator={true}
            ListHeaderComponent={
              <View style={styles.chatInfo}>
                <Text style={styles.chatInfoText}>
                  Giá chat: {price.toLocaleString('vi-VN')} đ/tin nhắn
                </Text>
                <Text style={styles.chatInfoText}>
                  Giá gọi: {(price * 2).toLocaleString('vi-VN')} đ/phút
                </Text>
                <Text style={styles.chatInfoText}>
                  Số dư: {balance.toLocaleString('vi-VN')} đ
                </Text>
                {remainingCredits > 0 && (
                  <Text style={styles.chatInfoBonusText}>
                    Bạn còn {remainingCredits} lượt xem miễn phí!
                  </Text>
                )}

                <View style={styles.callButtonsContainer}>
                  <CallComponent
                    expertId={expertId}
                    expertName={expertName}
                    expertAvatar={expertAvatar}
                    price={price * 2} // Giá gọi cao hơn giá chat
                    isVideoCall={false}
                    onEndCall={handleCallEnd}
                  />
                  
                  <CallComponent
                    expertId={expertId}
                    expertName={expertName}
                    expertAvatar={expertAvatar}
                    price={price * 3} // Giá video call cao hơn nữa
                    isVideoCall={true}
                    onEndCall={handleCallEnd}
                  />
                </View>
              </View>
            }
          />

          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
          >
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                value={inputText}
                onChangeText={setInputText}
                placeholder="Nhập tin nhắn..."
                placeholderTextColor="#999"
                multiline
              />
              <TouchableOpacity
                style={[styles.sendButton, !inputText.trim() && styles.sendButtonDisabled]}
                onPress={handleSendMessage}
                disabled={!inputText.trim() || isSending}
              >
                {isSending ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Text style={styles.sendButtonText}>Gửi</Text>
                )}
              </TouchableOpacity>
            </View>
          </KeyboardAvoidingView>
        </>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#6A11CB',
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  backButton: {
    padding: 8,
  },
  backButtonText: {
    fontSize: 24,
    color: '#FFFFFF',
  },
  expertInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 8,
  },
  expertAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  expertName: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  expertStatus: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  onlineIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#4CAF50',
    marginRight: 4,
  },
  onlineText: {
    color: '#E0E0E0',
    fontSize: 12,
  },
  infoButton: {
    padding: 8,
  },
  infoButtonText: {
    fontSize: 20,
    color: '#FFFFFF',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666666',
  },
  messagesList: {
    padding: 16,
    paddingBottom: 16,
  },
  chatInfo: {
    backgroundColor: 'rgba(106, 17, 203, 0.1)',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  chatInfoText: {
    color: '#666',
    fontSize: 14,
    marginBottom: 4,
  },
  chatInfoBonusText: {
    color: '#6A11CB',
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  callButtonsContainer: {
    marginTop: 16,
  },
  messageContainer: {
    flexDirection: 'row',
    marginBottom: 16,
    maxWidth: '80%',
  },
  userMessageContainer: {
    alignSelf: 'flex-end',
    marginLeft: 'auto',
  },
  expertMessageContainer: {
    alignSelf: 'flex-start',
    marginRight: 'auto',
  },
  messageAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 8,
    alignSelf: 'flex-end',
  },
  messageBubble: {
    padding: 12,
    borderRadius: 16,
    maxWidth: '100%',
  },
  userMessageBubble: {
    backgroundColor: '#6A11CB',
    borderBottomRightRadius: 4,
  },
  expertMessageBubble: {
    backgroundColor: '#FFFFFF',
    borderBottomLeftRadius: 4,
  },
  messageText: {
    fontSize: 15,
    marginBottom: 4,
    color: '#333333',
  },
  messageTime: {
    fontSize: 11,
    color: '#888888',
    alignSelf: 'flex-end',
  },
  messageStatus: {
    fontSize: 11,
    color: '#888888',
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 8,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#EEEEEE',
  },
  input: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    maxHeight: 100,
    color: '#333333',
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#6A11CB',
    marginLeft: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: '#CCCCCC',
  },
  sendButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default ChatRoomScreen; 