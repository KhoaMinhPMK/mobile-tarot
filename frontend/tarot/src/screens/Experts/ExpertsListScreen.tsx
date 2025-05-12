import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/AppNavigator';

// Định nghĩa kiểu dữ liệu cho chuyên gia
interface Expert {
  id: string;
  name: string;
  avatar: string;
  specialization: string;
  rating: number;
  price: number;
  isOnline: boolean;
}

type ExpertsListNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'ExpertsList'
>;

/**
 * Màn hình hiển thị danh sách các chuyên gia Tarot
 */
const ExpertsListScreen = () => {
  const navigation = useNavigation<ExpertsListNavigationProp>();
  const [experts, setExperts] = useState<Expert[]>([]);
  const [loading, setLoading] = useState(true);

  // Giả lập tải dữ liệu chuyên gia từ API
  useEffect(() => {
    // Ghi log thông báo đang tải dữ liệu
    console.log('Đang tải danh sách chuyên gia...');
    
    // Giả lập thời gian tải dữ liệu
    const timer = setTimeout(() => {
      // Dữ liệu mẫu
      const mockExperts: Expert[] = [
        {
          id: '1',
          name: 'Nguyễn Thị Minh',
          avatar: 'https://randomuser.me/api/portraits/women/1.jpg',
          specialization: 'Tarot & Tử vi',
          rating: 4.8,
          price: 50000,
          isOnline: true,
        },
        {
          id: '2',
          name: 'Trần Văn Hùng',
          avatar: 'https://randomuser.me/api/portraits/men/2.jpg',
          specialization: 'Tarot & Phong thủy',
          rating: 4.6,
          price: 45000,
          isOnline: true,
        },
        {
          id: '3',
          name: 'Lê Thanh Hà',
          avatar: 'https://randomuser.me/api/portraits/women/3.jpg',
          specialization: 'Tarot & Chiêm tinh',
          rating: 4.9,
          price: 60000,
          isOnline: false,
        },
        {
          id: '4',
          name: 'Phạm Đức Thành',
          avatar: 'https://randomuser.me/api/portraits/men/4.jpg',
          specialization: 'Tarot',
          rating: 4.5,
          price: 40000,
          isOnline: true,
        },
        {
          id: '5',
          name: 'Hoàng Thị Linh',
          avatar: 'https://randomuser.me/api/portraits/women/5.jpg',
          specialization: 'Tarot & Năng lượng',
          rating: 4.7,
          price: 55000,
          isOnline: false,
        },
      ];
      
      setExperts(mockExperts);
      setLoading(false);
      
      // Ghi log thông báo đã tải xong
      console.log(`Đã tải ${mockExperts.length} chuyên gia`);
    }, 1500);
    
    return () => clearTimeout(timer);
  }, []);

  // Xử lý khi chọn một chuyên gia để chat
  const handleSelectExpert = (expert: Expert) => {
    console.log(`Đã chọn chuyên gia: ${expert.name}`);
    
    // Điều hướng đến màn hình chat với chuyên gia đã chọn
    navigation.navigate('ChatRoom', { 
      expertId: expert.id,
      expertName: expert.name,
      expertAvatar: expert.avatar,
      price: expert.price,
    });
  };

  // Hiển thị mỗi item chuyên gia
  const renderExpertItem = ({ item }: { item: Expert }) => (
    <TouchableOpacity
      style={styles.expertCard}
      onPress={() => handleSelectExpert(item)}
    >
      <View style={styles.expertHeader}>
        <Image source={{ uri: item.avatar }} style={styles.avatar} />
        <View style={styles.expertInfo}>
          <Text style={styles.expertName}>{item.name}</Text>
          <Text style={styles.expertSpecialization}>{item.specialization}</Text>
          <View style={styles.ratingContainer}>
            <Text style={styles.rating}>⭐ {item.rating.toFixed(1)}</Text>
          </View>
        </View>
        <View style={[styles.statusIndicator, { backgroundColor: item.isOnline ? '#4CAF50' : '#9E9E9E' }]} />
      </View>
      
      <View style={styles.expertFooter}>
        <Text style={styles.price}>
          {item.price.toLocaleString('vi-VN')} đ<Text style={styles.priceUnit}>/phút</Text>
        </Text>
        <TouchableOpacity 
          style={[styles.chatButton, !item.isOnline && styles.chatButtonDisabled]}
          disabled={!item.isOnline}
          onPress={() => handleSelectExpert(item)}
        >
          <Text style={styles.chatButtonText}>
            {item.isOnline ? 'Bắt đầu chat' : 'Không khả dụng'}
          </Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backButton}>← Quay lại</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Chuyên gia Tarot</Text>
        <View style={{ width: 50 }} />
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#6A11CB" />
          <Text style={styles.loadingText}>Đang tải danh sách chuyên gia...</Text>
        </View>
      ) : (
        <FlatList
          data={experts}
          renderItem={renderExpertItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={
            <Text style={styles.listHeaderText}>
              {experts.filter(e => e.isOnline).length} chuyên gia đang trực tuyến
            </Text>
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>Không có chuyên gia nào khả dụng</Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F0FE',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#6A11CB',
  },
  backButton: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
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
  listContainer: {
    padding: 16,
    paddingBottom: 24,
  },
  listHeaderText: {
    fontSize: 16,
    color: '#666666',
    marginBottom: 16,
  },
  expertCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  expertHeader: {
    flexDirection: 'row',
    marginBottom: 16,
    position: 'relative',
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    marginRight: 16,
  },
  expertInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  expertName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 4,
  },
  expertSpecialization: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 4,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rating: {
    fontSize: 14,
    color: '#FF9800',
    fontWeight: '600',
  },
  statusIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    position: 'absolute',
    top: 4,
    right: 4,
  },
  expertFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  price: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#6A11CB',
  },
  priceUnit: {
    fontSize: 14,
    fontWeight: 'normal',
    color: '#666666',
  },
  chatButton: {
    backgroundColor: '#6A11CB',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  chatButtonDisabled: {
    backgroundColor: '#CCCCCC',
  },
  chatButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 14,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  emptyText: {
    fontSize: 16,
    color: '#666666',
    textAlign: 'center',
  },
});

export default ExpertsListScreen; 