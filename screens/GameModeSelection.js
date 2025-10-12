import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Modal,
  ScrollView,
  Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

const GameModeSelection = ({ onSelectMode, onBack }) => {
  const [savedDecks, setSavedDecks] = useState([]);
  const [showDeckSelector, setShowDeckSelector] = useState(false);
  const [currentDeck, setCurrentDeck] = useState(null);

  // 載入保存的棋組
  useEffect(() => {
    const loadSavedDecks = async () => {
      try {
        const saved = await AsyncStorage.getItem('savedDecks');
        if (saved) {
          const decks = JSON.parse(saved);
          setSavedDecks(decks);
        }
        
        // 載入當前選擇的棋組
        const currentDeckId = await AsyncStorage.getItem('currentDeckId');
        if (currentDeckId && saved) {
          const decks = JSON.parse(saved);
          const deck = decks.find(d => d.id === currentDeckId);
          if (deck) {
            setCurrentDeck(deck);
          }
        }
      } catch (error) {
        console.log('載入保存棋組失敗:', error);
      }
    };
    loadSavedDecks();
  }, []);

  const selectDeck = async (deck) => {
    try {
      // 保存當前選擇的棋組ID
      await AsyncStorage.setItem('currentDeckId', deck.id);
      setCurrentDeck(deck);
      setShowDeckSelector(false);
    } catch (error) {
      console.log('保存當前棋組失敗:', error);
    }
  };

  return (
    <LinearGradient
      colors={['#1a1a1a', '#2d2d2d', '#1a1a1a']}
      style={styles.container}
    >
      {/* 返回按鈕 */}
      <TouchableOpacity style={styles.backButton} onPress={onBack}>
        <View style={styles.backIcon}>
          <Text style={styles.backIconText}>←</Text>
        </View>
        <Text style={styles.backText}>返回</Text>
      </TouchableOpacity>

      <View style={styles.content}>
        {/* 標題 */}
        <View style={styles.titleContainer}>
          <Text style={styles.title}>選擇對戰模式</Text>
          <Text style={styles.subtitle}>Select Game Mode</Text>
          <View style={styles.titleUnderline} />
        </View>

        {/* 模式選擇按鈕 */}
        <View style={styles.modeContainer}>
          {/* AI對戰 */}
          <TouchableOpacity
            style={styles.modeButton}
            onPress={() => onSelectMode('ai', currentDeck)}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={['#FF6B6B', '#FF8E53', '#FF6B35']}
              style={styles.buttonGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Text style={styles.modeIcon}>🤖</Text>
              <Text style={styles.modeTitle}>AI 對戰</Text>
              <Text style={styles.modeSubtitle}>挑戰人工智慧</Text>
              <Text style={styles.modeDescription}>
                與聰明的AI對手進行策略對決
              </Text>
            </LinearGradient>
          </TouchableOpacity>

          {/* 雙人對戰 */}
          <TouchableOpacity
            style={styles.modeButton}
            onPress={() => onSelectMode('multiplayer', currentDeck)}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={['#4ECDC4', '#44A08D', '#2E8B57']}
              style={styles.buttonGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Text style={styles.modeIcon}>👥</Text>
              <Text style={styles.modeTitle}>雙人對戰</Text>
              <Text style={styles.modeSubtitle}>與朋友對戰</Text>
              <Text style={styles.modeDescription}>
                在同一設備上輪流操作進行對戰
              </Text>
            </LinearGradient>
          </TouchableOpacity>

          {/* 棋組選擇按鈕 */}
          <TouchableOpacity
            style={styles.deckSelectButton}
            onPress={() => setShowDeckSelector(true)}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={['#9B59B6', '#8E44AD', '#7D3C98']}
              style={styles.deckSelectGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Text style={styles.deckSelectIcon}>🎯</Text>
              <Text style={styles.deckSelectTitle}>
                {currentDeck ? `當前棋組: ${currentDeck.name}` : '選擇棋組'}
              </Text>
              <Text style={styles.deckSelectSubtitle}>
                {currentDeck 
                  ? '點擊更換棋組' 
                  : `選擇您的戰鬥棋組 (${savedDecks.length} 個可用)`}
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </View>

      {/* 棋組選擇Modal */}
      <Modal
        visible={showDeckSelector}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowDeckSelector(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <LinearGradient
              colors={['#2c3e50', '#34495e', '#2c3e50']}
              style={styles.modalGradient}
            >
              {/* 標題 */}
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>選擇棋組</Text>
                <TouchableOpacity
                  style={styles.modalCloseButton}
                  onPress={() => setShowDeckSelector(false)}
                >
                  <Text style={styles.modalCloseText}>×</Text>
                </TouchableOpacity>
              </View>

              {/* 棋組列表 */}
              <View style={styles.deckList}>
                {savedDecks.length === 0 ? (
                  <View style={styles.emptyDecksContainer}>
                    <Text style={styles.emptyDecksText}>暫無保存的棋組</Text>
                    <Text style={styles.emptyDecksSubText}>請先前往牌組構建器創建棋組</Text>
                  </View>
                ) : (
                  <ScrollView showsVerticalScrollIndicator={false}>
                    {savedDecks.map((deck) => (
                      <TouchableOpacity
                        key={deck.id}
                        style={styles.deckItem}
                        onPress={() => selectDeck(deck)}
                        activeOpacity={0.8}
                      >
                        <LinearGradient
                          colors={['#3498DB', '#2980B9', '#1F618D']}
                          style={styles.deckItemGradient}
                          start={{ x: 0, y: 0 }}
                          end={{ x: 1, y: 1 }}
                        >
                          <Text style={styles.deckItemName}>{deck.name}</Text>
                          <Text style={styles.deckItemDescription}>
                            點擊選擇此棋組
                          </Text>
                        </LinearGradient>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                )}
              </View>

              {/* 底部按鈕 */}
              <View style={styles.modalFooter}>
                <TouchableOpacity
                  style={styles.modalCancelButton}
                  onPress={() => setShowDeckSelector(false)}
                >
                  <Text style={styles.modalCancelText}>取消</Text>
                </TouchableOpacity>
              </View>
            </LinearGradient>
          </View>
        </View>
      </Modal>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backButton: {
    position: 'absolute',
    top: 50,
    left: 20,
    zIndex: 10,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 15,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderRadius: 25,
  },
  backIcon: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  backIconText: {
    fontSize: 18,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  backText: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '500',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 30,
    paddingTop: 100,
  },
  titleContainer: {
    alignItems: 'center',
    marginBottom: 60,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFD700',
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 4,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#C0C0C0',
    textAlign: 'center',
    marginBottom: 16,
    letterSpacing: 1,
  },
  titleUnderline: {
    width: 100,
    height: 3,
    backgroundColor: '#FFD700',
    borderRadius: 2,
  },
  modeContainer: {
    width: '100%',
    gap: 30,
  },
  modeButton: {
    width: '100%',
    height: 140,
    borderRadius: 20,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  buttonGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
    paddingVertical: 20,
  },
  modeIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  modeTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
    marginBottom: 4,
  },
  modeSubtitle: {
    fontSize: 16,
    color: '#F0F0F0',
    textAlign: 'center',
    marginBottom: 8,
  },
  modeDescription: {
    fontSize: 14,
    color: '#E0E0E0',
    textAlign: 'center',
    paddingHorizontal: 20,
    lineHeight: 20,
  },
  // 棋組選擇按鈕樣式
  deckSelectButton: {
    width: '100%',
    height: 100,
    borderRadius: 15,
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    marginTop: 15,
  },
  deckSelectGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 15,
    paddingVertical: 15,
  },
  deckSelectIcon: {
    fontSize: 24,
    marginBottom: 4,
  },
  deckSelectTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 4,
  },
  deckSelectSubtitle: {
    fontSize: 12,
    color: '#E0E0E0',
    textAlign: 'center',
  },
  // Modal樣式
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: screenWidth * 0.9,
    height: screenHeight * 0.7,
    borderRadius: 20,
    overflow: 'hidden',
  },
  modalGradient: {
    flex: 1,
    borderRadius: 20,
    paddingVertical: 10,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  modalCloseButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalCloseText: {
    fontSize: 20,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  deckList: {
    flex: 1,
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  emptyDecksContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyDecksText: {
    fontSize: 18,
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 8,
  },
  emptyDecksSubText: {
    fontSize: 14,
    color: '#C0C0C0',
    textAlign: 'center',
  },
  deckItem: {
    marginVertical: 8,
    borderRadius: 12,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  deckItemGradient: {
    paddingVertical: 20,
    paddingHorizontal: 20,
    borderRadius: 12,
    alignItems: 'center',
  },
  deckItemName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 8,
  },
  deckItemDescription: {
    fontSize: 12,
    color: '#C0C0C0',
    textAlign: 'center',
  },
  modalFooter: {
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  modalCancelButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 25,
    alignItems: 'center',
  },
  modalCancelText: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '500',
  },
});

export default GameModeSelection;
