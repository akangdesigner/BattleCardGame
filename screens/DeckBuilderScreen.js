import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  ScrollView,
  Alert,
  TextInput,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import PieceManager from './pieces/PieceManager';
import { getPieceCategory } from './pieceRules';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

// 可用棋子列表
const AVAILABLE_PIECES = [
  { id: 'S', name: '皇家護衛', description: '基礎近戰單位' },
  { id: 'A', name: '弓箭手', description: '遠程攻擊單位' },
  { id: 'M', name: '魔法師', description: '魔法攻擊單位' },
  { id: 'K', name: '騎士', description: '高機動性單位' },
  { id: 'P', name: '牧師', description: '治療與支援單位' },
  { id: 'AS', name: '刺客', description: '隱身與暗殺單位' },
  { id: 'MT', name: '心智扭曲者', description: '精神控制單位' },
  { id: 'CB', name: '弩手', description: '重型遠程單位' },
  { id: 'SM', name: '太刀武士', description: '劍術大師單位' },
  { id: 'WA', name: '戰爭建築師', description: '防禦建設單位' },
  { id: 'SD', name: '睏睏狗', description: '催眠控制單位' },
  { id: 'CC', name: '食人螃蟹', description: '兇猛近戰單位' },
  { id: 'CASTLE', name: '城堡', description: '不會動的防禦建築' },
];

// 根據規則分類棋子
const BASIC_PIECES = AVAILABLE_PIECES.filter(piece => getPieceCategory(piece.id) === 'basic');
const SPECIAL_PIECES = AVAILABLE_PIECES.filter(piece => getPieceCategory(piece.id) === 'special');
const HERO_PIECES = AVAILABLE_PIECES.filter(piece => getPieceCategory(piece.id) === 'hero');
const STRUCTURE_PIECES = AVAILABLE_PIECES.filter(piece => getPieceCategory(piece.id) === 'structure');

const DeckBuilderScreen = ({ onBack, onSaveDeck }) => {
  // 新的狀態管理：分為前排、中後排
  const [frontRowPieces, setFrontRowPieces] = useState(['S', 'SM']); // 前排棋子（基礎型，最多2個）
  const [backRowPieces, setBackRowPieces] = useState(['A', 'M', 'P', 'MT']); // 中後排棋子（3個特殊型 + 1個英雄型）
  const [selectedPiece, setSelectedPiece] = useState(null);
  const [savedDecks, setSavedDecks] = useState([]);
  const [showMyDecks, setShowMyDecks] = useState(false);
  const [editingDeck, setEditingDeck] = useState(null);
  const [newDeckName, setNewDeckName] = useState('');
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [tempSaveDeckName, setTempSaveDeckName] = useState('');
  
  // 點擊交換相關狀態
  const [selectedPieceIndex, setSelectedPieceIndex] = useState(null);
  const [selectedSection, setSelectedSection] = useState(null); // 'front' 或 'special'

  // 載入保存的棋組
  useEffect(() => {
    const loadSavedDecks = async () => {
      try {
        const saved = await AsyncStorage.getItem('savedDecks');
        if (saved) {
          setSavedDecks(JSON.parse(saved));
        }
      } catch (error) {
        console.log('載入保存棋組失敗:', error);
      }
    };
    loadSavedDecks();
  }, []);

  // 獲取所有選中的棋子（用於顯示和保存）
  const getAllSelectedPieces = () => {
    return [...frontRowPieces, ...backRowPieces];
  };

  // 選擇前排棋子（基礎型）
  const toggleFrontRowPiece = (pieceId) => {
    if (frontRowPieces.includes(pieceId)) {
      setFrontRowPieces(frontRowPieces.filter(id => id !== pieceId));
    } else {
      if (frontRowPieces.length < 2) {
        setFrontRowPieces([...frontRowPieces, pieceId]);
      } else {
        Alert.alert('提示', '前排最多只能選擇2個基礎型棋子！');
      }
    }
  };

  // 選擇中後排棋子（特殊型 + 英雄型）
  const toggleBackRowPiece = (pieceId) => {
    if (backRowPieces.includes(pieceId)) {
      setBackRowPieces(backRowPieces.filter(id => id !== pieceId));
    } else {
      // 檢查是否為英雄型
      const isHero = getPieceCategory(pieceId) === 'hero';
      const currentHeroCount = backRowPieces.filter(id => getPieceCategory(id) === 'hero').length;
      const currentSpecialCount = backRowPieces.filter(id => getPieceCategory(id) === 'special').length;
      
      if (isHero && currentHeroCount >= 1) {
        Alert.alert('提示', '中後排最多只能選擇1個英雄型棋子！');
      } else if (!isHero && currentSpecialCount >= 3) {
        Alert.alert('提示', '中後排最多只能選擇3個特殊型棋子！');
      } else if (backRowPieces.length >= 4) {
        Alert.alert('提示', '中後排最多只能選擇4個棋子（3個特殊型 + 1個英雄型）！');
      } else {
        setBackRowPieces([...backRowPieces, pieceId]);
      }
    }
  };

  const saveDeck = async () => {
    const allPieces = getAllSelectedPieces();
    if (allPieces.length !== 6) {
      Alert.alert('錯誤', '棋組必須包含6個棋子（前排2個基礎型 + 中後排3個特殊型1個英雄型）！');
      return;
    }

    setShowSaveDialog(true);
    setTempSaveDeckName(`棋組 ${savedDecks.length + 1}`);
  };

  const confirmSaveDeck = async () => {
    if (!tempSaveDeckName.trim()) {
      Alert.alert('錯誤', '棋組名稱不能為空！');
      return;
    }

    try {
      const allPieces = getAllSelectedPieces();
      const newDeck = {
        id: Date.now().toString(),
        name: tempSaveDeckName.trim(),
        pieces: allPieces,
        frontRowPieces: frontRowPieces,
        backRowPieces: backRowPieces,
        createdAt: new Date().toISOString()
      };
      
      const updatedDecks = [...savedDecks, newDeck];
      setSavedDecks(updatedDecks);
      
      await AsyncStorage.setItem('savedDecks', JSON.stringify(updatedDecks));
      onSaveDeck(allPieces);
      setShowSaveDialog(false);
      setTempSaveDeckName('');
      Alert.alert('成功', `棋組「${tempSaveDeckName.trim()}」已保存到「我的棋組」！`);
    } catch (error) {
      console.log('保存棋組失敗:', error);
      Alert.alert('錯誤', '保存棋組失敗！');
    }
  };

  const cancelSaveDeck = () => {
    setShowSaveDialog(false);
    setTempSaveDeckName('');
  };

  // 保存棋組到我的排組
  const saveToMyDecks = async () => {
    const allPieces = getAllSelectedPieces();
    if (allPieces.length !== 6) {
      Alert.alert('錯誤', '棋組必須包含6個棋子（前排2個基礎型 + 中後排3個特殊型1個英雄型）！');
      return;
    }

    try {
      const deckName = `棋組 ${savedDecks.length + 1}`;
      const newDeck = {
        id: Date.now().toString(),
        name: deckName,
        pieces: allPieces,
        frontRowPieces: frontRowPieces,
        backRowPieces: backRowPieces,
        createdAt: new Date().toISOString()
      };
      
      const updatedDecks = [...savedDecks, newDeck];
      setSavedDecks(updatedDecks);
      
      await AsyncStorage.setItem('savedDecks', JSON.stringify(updatedDecks));
      Alert.alert('成功', `棋組已保存到「我的排組」！`);
    } catch (error) {
      console.log('保存棋組失敗:', error);
      Alert.alert('錯誤', '保存棋組失敗！');
    }
  };

  // 載入棋組
  const loadDeck = (deck) => {
    // 如果是新格式的棋組（有frontRowPieces和backRowPieces）
    if (deck.frontRowPieces && deck.backRowPieces) {
      setFrontRowPieces(deck.frontRowPieces);
      setBackRowPieces(deck.backRowPieces);
    } else if (deck.frontRowPieces && deck.middleRowPieces && deck.heroPiece) {
      // 兼容舊格式（前排2個 + 中排3個 + 英雄1個）
      setFrontRowPieces(deck.frontRowPieces);
      setBackRowPieces([...deck.middleRowPieces, ...deck.heroPiece]);
    } else if (deck.frontRowPieces && deck.specialPieces) {
      // 兼容更舊格式（前排2個 + 特殊4個）
      setFrontRowPieces(deck.frontRowPieces);
      setBackRowPieces(deck.specialPieces);
    } else {
      // 兼容最舊格式，將前2個設為前排，後4個設為中後排
      const pieces = deck.pieces || [];
      setFrontRowPieces(pieces.slice(0, 2));
      setBackRowPieces(pieces.slice(2, 6));
    }
    setShowMyDecks(false);
    Alert.alert('成功', `已載入「${deck.name}」！`);
  };

  // 刪除棋組
  const deleteDeck = async (deckId) => {
    try {
      const updatedDecks = savedDecks.filter(deck => deck.id !== deckId);
      setSavedDecks(updatedDecks);
      await AsyncStorage.setItem('savedDecks', JSON.stringify(updatedDecks));
      Alert.alert('成功', '棋組已刪除！');
    } catch (error) {
      console.log('刪除棋組失敗:', error);
      Alert.alert('錯誤', '刪除棋組失敗！');
    }
  };

  // 開始編輯棋組名稱
  const startEditDeck = (deck) => {
    setEditingDeck(deck.id);
    setNewDeckName(deck.name);
  };

  // 保存棋組名稱
  const saveDeckName = async (deckId) => {
    if (!newDeckName.trim()) {
      Alert.alert('錯誤', '棋組名稱不能為空！');
      return;
    }

    try {
      const updatedDecks = savedDecks.map(deck => 
        deck.id === deckId ? { ...deck, name: newDeckName.trim() } : deck
      );
      setSavedDecks(updatedDecks);
      await AsyncStorage.setItem('savedDecks', JSON.stringify(updatedDecks));
      setEditingDeck(null);
      setNewDeckName('');
      Alert.alert('成功', '棋組名稱已更新！');
    } catch (error) {
      console.log('更新棋組名稱失敗:', error);
      Alert.alert('錯誤', '更新棋組名稱失敗！');
    }
  };

  // 取消編輯
  const cancelEdit = () => {
    setEditingDeck(null);
    setNewDeckName('');
  };

  // 點擊交換處理函數
  const handlePieceClick = (index, section) => {
    if (selectedPieceIndex === null) {
      // 第一次點擊，選中棋子
      setSelectedPieceIndex(index);
      setSelectedSection(section);
    } else if (selectedPieceIndex === index && selectedSection === section) {
      // 點擊同一個棋子，取消選中
      setSelectedPieceIndex(null);
      setSelectedSection(null);
    } else if (selectedSection === section) {
      // 同一區域內交換棋子位置
      if (section === 'front') {
        if (index < frontRowPieces.length) {
          const newPieces = [...frontRowPieces];
          const temp = newPieces[selectedPieceIndex];
          newPieces[selectedPieceIndex] = newPieces[index];
          newPieces[index] = temp;
          setFrontRowPieces(newPieces);
        }
      } else if (section === 'back') {
        if (index < backRowPieces.length) {
          const newPieces = [...backRowPieces];
          const temp = newPieces[selectedPieceIndex];
          newPieces[selectedPieceIndex] = newPieces[index];
          newPieces[index] = temp;
          setBackRowPieces(newPieces);
        }
      }
      setSelectedPieceIndex(null);
      setSelectedSection(null);
    }
  };

  return (
    <LinearGradient
      colors={['#1a1a1a', '#2d2d2d', '#1a1a1a']}
      style={styles.container}
    >
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* 返回按鈕 */}
        <TouchableOpacity style={styles.backButton} onPress={onBack}>
          <View style={styles.backIcon}>
            <Text style={styles.backIconText}>←</Text>
          </View>
          <Text style={styles.backText}>返回</Text>
        </TouchableOpacity>
        {/* 標題 */}
        <View style={styles.titleContainer}>
          <Text style={styles.title}>編制棋組</Text>
          <Text style={styles.subtitle}>前排2個基礎型 + 中後排3個特殊型1個英雄型 ({getAllSelectedPieces().length}/6)</Text>
        </View>

        {/* 保存按鈕 */}
        <TouchableOpacity
          style={[
            styles.saveButton,
            getAllSelectedPieces().length !== 6 && styles.disabledButton
          ]}
          onPress={saveDeck}
          disabled={getAllSelectedPieces().length !== 6}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={getAllSelectedPieces().length === 6 ? ['#FFD700', '#FFA500'] : ['#666', '#444']}
            style={styles.saveButtonGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Text style={[
              styles.saveButtonText,
              getAllSelectedPieces().length !== 6 && styles.disabledButtonText
            ]}>
              保存棋組
            </Text>
          </LinearGradient>
        </TouchableOpacity>

        {/* 我的棋組按鈕 */}
        <TouchableOpacity
          style={styles.myDecksButton}
          onPress={() => setShowMyDecks(true)}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={['#9370DB', '#7B68EE']}
            style={styles.myDecksButtonGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Text style={styles.myDecksButtonText}>
              我的棋組 ({savedDecks.length})
            </Text>
          </LinearGradient>
        </TouchableOpacity>

        {/* 當前棋組預覽 */}
        <View style={styles.deckPreview}>
          <Text style={styles.sectionTitle}>當前棋組</Text>
          <Text style={styles.clickHint}>
            {selectedPieceIndex === null 
              ? '點擊棋子選中，再點擊另一個棋子交換位置' 
              : `已選中 ${selectedSection === 'front' 
                  ? AVAILABLE_PIECES.find(p => p.id === frontRowPieces[selectedPieceIndex])?.name
                  : AVAILABLE_PIECES.find(p => p.id === backRowPieces[selectedPieceIndex])?.name
                }，點擊其他棋子交換位置`
            }
          </Text>
          
          {/* 前排區域 */}
          <View style={styles.previewSection}>
            <Text style={styles.previewSectionTitle}>前排棋子 (基礎型) {frontRowPieces.length}/2</Text>
            <View style={styles.previewContainer}>
              <View style={styles.previewGrid}>
                {frontRowPieces.map((pieceId, index) => (
                  <TouchableOpacity
                    key={`front-${index}`}
                    style={[
                      styles.previewPiece,
                      selectedPieceIndex === index && selectedSection === 'front' && styles.selectedPiece,
                    ]}
                    onPress={() => handlePieceClick(index, 'front')}
                    activeOpacity={0.8}
                  >
                    <View style={styles.previewPieceContainer}>
                      <PieceManager 
                        piece={pieceId} 
                        isSelected={selectedPieceIndex === index && selectedSection === 'front'} 
                        isHighlighted={false}
                        currentHealth={undefined}
                        maxHealth={undefined}
                      />
                    </View>
                    <Text style={styles.previewPieceText}>
                      {AVAILABLE_PIECES.find(p => p.id === pieceId)?.name}
                    </Text>
                    {selectedPieceIndex === index && selectedSection === 'front' && (
                      <View style={styles.selectedIndicator} />
                    )}
                  </TouchableOpacity>
                ))}
                {/* 前排空位 */}
                {Array.from({ length: 2 - frontRowPieces.length }).map((_, index) => (
                  <View 
                    key={`front-empty-${index}`} 
                    style={styles.emptySlot}
                  >
                    <Text style={styles.emptySlotText}>空</Text>
                  </View>
                ))}
              </View>
            </View>
          </View>

          {/* 特殊型區域 */}
          <View style={styles.previewSection}>
            <Text style={styles.previewSectionTitle}>特殊型棋子 {backRowPieces.filter(id => getPieceCategory(id) === 'special').length}/3</Text>
            <View style={styles.previewContainer}>
              <View style={styles.previewGrid}>
                {backRowPieces.filter(id => getPieceCategory(id) === 'special').map((pieceId, index) => {
                  const originalIndex = backRowPieces.findIndex(id => id === pieceId);
                  return (
                    <TouchableOpacity
                      key={`special-${index}`}
                      style={[
                        styles.previewPiece,
                        selectedPieceIndex === originalIndex && selectedSection === 'back' && styles.selectedPiece,
                      ]}
                      onPress={() => handlePieceClick(originalIndex, 'back')}
                      activeOpacity={0.8}
                    >
                      <View style={styles.previewPieceContainer}>
                        <PieceManager 
                          piece={pieceId} 
                          isSelected={selectedPieceIndex === originalIndex && selectedSection === 'back'} 
                          isHighlighted={false}
                          currentHealth={undefined}
                          maxHealth={undefined}
                        />
                      </View>
                      <Text style={styles.previewPieceText}>
                        {AVAILABLE_PIECES.find(p => p.id === pieceId)?.name}
                      </Text>
                      <Text style={[styles.previewPieceCategory, styles.specialCategory]}>
                        特殊
                      </Text>
                      {selectedPieceIndex === originalIndex && selectedSection === 'back' && (
                        <View style={styles.selectedIndicator} />
                      )}
                    </TouchableOpacity>
                  );
                })}
                {/* 特殊型空位 */}
                {Array.from({ length: 3 - backRowPieces.filter(id => getPieceCategory(id) === 'special').length }).map((_, index) => (
                  <View 
                    key={`special-empty-${index}`} 
                    style={styles.emptySlot}
                  >
                    <Text style={styles.emptySlotText}>空</Text>
                  </View>
                ))}
              </View>
            </View>
          </View>

          {/* 英雄型區域 */}
          <View style={styles.previewSection}>
            <Text style={styles.previewSectionTitle}>英雄型棋子 {backRowPieces.filter(id => getPieceCategory(id) === 'hero').length}/1</Text>
            <View style={styles.previewContainer}>
              <View style={styles.previewGrid}>
                {backRowPieces.filter(id => getPieceCategory(id) === 'hero').map((pieceId, index) => {
                  const originalIndex = backRowPieces.findIndex(id => id === pieceId);
                  return (
                    <TouchableOpacity
                      key={`hero-${index}`}
                      style={[
                        styles.previewPiece,
                        selectedPieceIndex === originalIndex && selectedSection === 'back' && styles.selectedPiece,
                      ]}
                      onPress={() => handlePieceClick(originalIndex, 'back')}
                      activeOpacity={0.8}
                    >
                      <View style={styles.previewPieceContainer}>
                        <PieceManager 
                          piece={pieceId} 
                          isSelected={selectedPieceIndex === originalIndex && selectedSection === 'back'} 
                          isHighlighted={false}
                          currentHealth={undefined}
                          maxHealth={undefined}
                        />
                      </View>
                      <Text style={styles.previewPieceText}>
                        {AVAILABLE_PIECES.find(p => p.id === pieceId)?.name}
                      </Text>
                      <Text style={[styles.previewPieceCategory, styles.heroCategory]}>
                        英雄
                      </Text>
                      {selectedPieceIndex === originalIndex && selectedSection === 'back' && (
                        <View style={styles.selectedIndicator} />
                      )}
                    </TouchableOpacity>
                  );
                })}
                {/* 英雄型空位 */}
                {Array.from({ length: 1 - backRowPieces.filter(id => getPieceCategory(id) === 'hero').length }).map((_, index) => (
                  <View 
                    key={`hero-empty-${index}`} 
                    style={styles.emptySlot}
                  >
                    <Text style={styles.emptySlotText}>空</Text>
                  </View>
                ))}
              </View>
            </View>
          </View>
        </View>

        {/* 棋子選擇區域 */}
        <View style={styles.pieceSelection}>
          {/* 基礎型棋子選擇 (前排) */}
          <View style={styles.pieceCategorySection}>
            <Text style={styles.sectionTitle}>基礎型棋子 (前排)</Text>
            <Text style={styles.categorySubtitle}>選擇2個基礎型棋子作為前排</Text>
            <View style={styles.pieceGrid}>
              {BASIC_PIECES.map((piece) => (
                <TouchableOpacity
                  key={piece.id}
                  style={[
                    styles.pieceCard,
                    frontRowPieces.includes(piece.id) && styles.selectedCard,
                  ]}
                  onPress={() => {
                    setSelectedPiece(piece.id);
                    toggleFrontRowPiece(piece.id);
                  }}
                  activeOpacity={0.8}
                >
                  <View style={styles.pieceCardContent}>
                    <View style={styles.pieceDisplay}>
                      <PieceManager 
                        piece={piece.id} 
                        isSelected={false} 
                        isHighlighted={false}
                        currentHealth={undefined}
                        maxHealth={undefined}
                      />
                    </View>
                    <Text style={styles.pieceName}>{piece.name}</Text>
                    <Text style={styles.pieceDescription}>{piece.description}</Text>
                    <Text style={[styles.pieceCategory, styles.basicCategory]}>基礎型</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* 特殊型和英雄型棋子選擇 (中後排) */}
          <View style={styles.pieceCategorySection}>
            <Text style={styles.sectionTitle}>特殊型和英雄型棋子 (中後排)</Text>
            <Text style={styles.categorySubtitle}>選擇3個特殊型 + 1個英雄型棋子作為中後排</Text>
            <View style={styles.pieceGrid}>
              {[...SPECIAL_PIECES, ...HERO_PIECES].map((piece) => (
                <TouchableOpacity
                  key={piece.id}
                  style={[
                    styles.pieceCard,
                    backRowPieces.includes(piece.id) && styles.selectedCard,
                  ]}
                  onPress={() => {
                    setSelectedPiece(piece.id);
                    toggleBackRowPiece(piece.id);
                  }}
                  activeOpacity={0.8}
                >
                  <View style={styles.pieceCardContent}>
                    <View style={styles.pieceDisplay}>
                      <PieceManager 
                        piece={piece.id} 
                        isSelected={false} 
                        isHighlighted={false}
                        currentHealth={undefined}
                        maxHealth={undefined}
                      />
                    </View>
                    <Text style={styles.pieceName}>{piece.name}</Text>
                    <Text style={styles.pieceDescription}>{piece.description}</Text>
                    <Text style={[
                      styles.pieceCategory, 
                      getPieceCategory(piece.id) === 'hero' ? styles.heroCategory : styles.specialCategory
                    ]}>
                      {getPieceCategory(piece.id) === 'hero' ? '英雄型' : '特殊型'}
                    </Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>

        {/* 我的棋組頁面 */}
        {showMyDecks && (
          <View style={styles.myDecksPage}>
            {/* 返回按鈕 */}
            <TouchableOpacity
              style={styles.backToBuilderButton}
              onPress={() => setShowMyDecks(false)}
              activeOpacity={0.8}
            >
              <Text style={styles.backToBuilderButtonText}>← 返回編制棋組</Text>
            </TouchableOpacity>

            {/* 頁面標題 */}
            <Text style={styles.myDecksPageTitle}>我的棋組</Text>

            {/* 棋組列表 */}
            {savedDecks.length === 0 ? (
              <View style={styles.emptyDecksContainer}>
                <Text style={styles.emptyDecksText}>暫無保存的棋組</Text>
                <Text style={styles.emptyDecksSubText}>請先編制棋組並保存</Text>
              </View>
            ) : (
              <ScrollView style={styles.decksList} showsVerticalScrollIndicator={false}>
                {savedDecks.map((deck) => (
                  <View key={deck.id} style={styles.deckItem}>
                    <View style={styles.deckHeader}>
                      <View style={styles.deckTitleSection}>
                        {editingDeck === deck.id ? (
                          <View style={styles.editContainer}>
                            <TextInput
                              style={styles.editInput}
                              value={newDeckName}
                              onChangeText={setNewDeckName}
                              placeholder="輸入棋組名稱"
                              placeholderTextColor="#888"
                              autoFocus
                            />
                            <View style={styles.editActions}>
                              <TouchableOpacity
                                style={styles.saveEditButton}
                                onPress={() => saveDeckName(deck.id)}
                              >
                                <Text style={styles.saveEditButtonText}>保存</Text>
                              </TouchableOpacity>
                              <TouchableOpacity
                                style={styles.cancelEditButton}
                                onPress={cancelEdit}
                              >
                                <Text style={styles.cancelEditButtonText}>取消</Text>
                              </TouchableOpacity>
                            </View>
                          </View>
                        ) : (
                          <View style={styles.deckNameContainer}>
                            <TouchableOpacity onPress={() => startEditDeck(deck)}>
                              <Text style={styles.deckName}>{deck.name}</Text>
                            </TouchableOpacity>
                            <TouchableOpacity 
                              style={styles.editIconButton}
                              onPress={() => startEditDeck(deck)}
                            >
                              <Text style={styles.editIcon}>✏️</Text>
                            </TouchableOpacity>
                          </View>
                        )}
                        <Text style={styles.deckDate}>
                          創建時間: {new Date(deck.createdAt).toLocaleDateString()}
                        </Text>
                        <Text style={styles.deckPieces}>
                          棋子數量: {deck.pieces.length}/6
                        </Text>
                      </View>
                      <View style={styles.deckActions}>
                        <TouchableOpacity
                          style={styles.loadDeckButton}
                          onPress={() => loadDeck(deck)}
                        >
                          <Text style={styles.loadDeckButtonText}>載入</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={styles.deleteDeckButton}
                          onPress={() => deleteDeck(deck.id)}
                        >
                          <Text style={styles.deleteDeckButtonText}>刪除</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                    
                    {/* 顯示棋組中的棋子 - 前排2個，後排4個 */}
                    <View style={styles.deckPiecesPreview}>
                      {/* 前排2個棋子 */}
                      <View style={styles.deckFrontRowGrid}>
                        {Array.from({ length: 2 }).map((_, index) => {
                          const pieceId = deck.frontRowPieces ? deck.frontRowPieces[index] : deck.pieces[index];
                          return (
                            <View key={`deck-front-${index}`} style={styles.deckPieceItem}>
                              {pieceId ? (
                                <>
                                  <View style={styles.deckPieceContainer}>
                                    <PieceManager 
                                      piece={pieceId} 
                                      isSelected={false} 
                                      isHighlighted={false}
                                      currentHealth={undefined}
                                      maxHealth={undefined}
                                    />
                                  </View>
                                  <Text style={styles.deckPieceName}>
                                    {AVAILABLE_PIECES.find(p => p.id === pieceId)?.name}
                                  </Text>
                                </>
                              ) : (
                                <View style={styles.deckEmptySlot}>
                                  <Text style={styles.deckEmptySlotText}>空</Text>
                                </View>
                              )}
                            </View>
                          );
                        })}
                      </View>
                      
                      {/* 後排4個棋子 */}
                      <View style={styles.deckBackRowGrid}>
                        {Array.from({ length: 4 }).map((_, index) => {
                          const pieceId = deck.backRowPieces ? deck.backRowPieces[index] : deck.pieces[index + 2];
                          return (
                            <View key={`deck-back-${index}`} style={styles.deckPieceItem}>
                              {pieceId ? (
                                <>
                                  <View style={styles.deckPieceContainer}>
                                    <PieceManager 
                                      piece={pieceId} 
                                      isSelected={false} 
                                      isHighlighted={false}
                                      currentHealth={undefined}
                                      maxHealth={undefined}
                                    />
                                  </View>
                                  <Text style={styles.deckPieceName}>
                                    {AVAILABLE_PIECES.find(p => p.id === pieceId)?.name}
                                  </Text>
                                </>
                              ) : (
                                <View style={styles.deckEmptySlot}>
                                  <Text style={styles.deckEmptySlotText}>空</Text>
                                </View>
                              )}
                            </View>
                          );
                        })}
                      </View>
                    </View>
                  </View>
                ))}
              </ScrollView>
            )}
          </View>
        )}

        {/* 保存棋組對話框 */}
        {showSaveDialog && (
          <View style={styles.saveDialogOverlay}>
            <View style={styles.saveDialog}>
              <Text style={styles.saveDialogTitle}>保存棋組</Text>
              <Text style={styles.saveDialogSubtitle}>請輸入棋組名稱</Text>
              <TextInput
                style={styles.saveDialogInput}
                value={tempSaveDeckName}
                onChangeText={setTempSaveDeckName}
                placeholder="輸入棋組名稱"
                placeholderTextColor="#888"
                autoFocus
                maxLength={20}
              />
              <View style={styles.saveDialogActions}>
                <TouchableOpacity
                  style={styles.saveDialogCancelButton}
                  onPress={cancelSaveDeck}
                >
                  <Text style={styles.saveDialogCancelText}>取消</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.saveDialogConfirmButton}
                  onPress={confirmSaveDeck}
                >
                  <Text style={styles.saveDialogConfirmText}>保存</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}
      </ScrollView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 15,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderRadius: 25,
    marginTop: 50,
    marginLeft: 20,
    alignSelf: 'flex-start',
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
    paddingHorizontal: 20,
  },
  titleContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFD700',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#C0C0C0',
    textAlign: 'center',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 15,
  },
  previewSection: {
    marginBottom: 25,
  },
  previewSectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFD700',
    marginBottom: 10,
    textAlign: 'center',
  },
  pieceCategorySection: {
    marginBottom: 30,
  },
  categorySubtitle: {
    fontSize: 14,
    color: '#C0C0C0',
    marginBottom: 15,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  basicCategory: {
    color: '#4CAF50', // 綠色表示基礎型
  },
  specialCategory: {
    color: '#F44336', // 紅色表示特殊型
  },
  heroCategory: {
    color: '#FFD700', // 金色表示英雄型
  },
  clickHint: {
    fontSize: 14,
    color: '#9370DB',
    textAlign: 'center',
    marginBottom: 10,
    fontStyle: 'italic',
    paddingHorizontal: 10,
  },
  deckPreview: {
    marginBottom: 30,
  },
  previewContainer: {
    justifyContent: 'flex-end',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 15,
    paddingTop: 20,
    paddingBottom: 30,
    paddingHorizontal: 15,
    minHeight: 150,
  },
  previewGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    maxWidth: 320,
  },
  frontRowGrid: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    marginBottom: 15,
    gap: 5,
  },
  backRowGrid: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    gap: 3,
  },
  previewPiece: {
    width: '22%',
    alignItems: 'center',
    marginBottom: 20,
    marginHorizontal: '1%',
    position: 'relative',
  },
  previewPieceContainer: {
    width: 50,
    height: 50,
    marginBottom: 12,
    justifyContent: 'center',
    alignItems: 'center',
    transform: [{ translateY: 15 }],
  },
  previewPieceText: {
    fontSize: 12,
    color: '#FFFFFF',
    textAlign: 'center',
  },
  previewPieceCategory: {
    fontSize: 8,
    textAlign: 'center',
    marginTop: 2,
  },
  selectedPiece: {
    backgroundColor: 'rgba(255, 215, 0, 0.2)',
    borderWidth: 2,
    borderColor: '#FFD700',
    borderRadius: 8,
    transform: [{ scale: 1.05 }],
  },
  selectedIndicator: {
    position: 'absolute',
    top: -5,
    right: -5,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#FFD700',
    borderWidth: 2,
    borderColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptySlot: {
    width: '22%',
    height: 70,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
    marginHorizontal: '1%',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    borderStyle: 'dashed',
  },
  emptySlotText: {
    fontSize: 12,
    color: '#888',
  },
  pieceSelection: {
    marginBottom: 30,
  },
  pieceGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  pieceCard: {
    width: '48%',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 15,
    padding: 15,
    marginBottom: 15,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  selectedCard: {
    borderColor: '#FFD700',
    backgroundColor: 'rgba(255, 215, 0, 0.1)',
  },
  highlightedCard: {
    borderColor: '#9370DB',
    backgroundColor: 'rgba(147, 112, 219, 0.1)',
  },
  pieceCardContent: {
    alignItems: 'center',
  },
  pieceDisplay: {
    width: 60,
    height: 60,
    marginTop: 15,
    marginBottom: 10,
  },
  pieceName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 5,
  },
  pieceDescription: {
    fontSize: 12,
    color: '#C0C0C0',
    textAlign: 'center',
    marginBottom: 5,
  },
  pieceCategory: {
    fontSize: 10,
    color: '#9370DB',
    textAlign: 'center',
  },
  saveButton: {
    width: '100%',
    height: 50,
    borderRadius: 12,
    marginBottom: 15,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  disabledButton: {
    opacity: 0.5,
  },
  saveButtonGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 12,
  },
  saveButtonText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  disabledButtonText: {
    color: '#999',
  },
  myDecksButton: {
    width: '100%',
    height: 50,
    borderRadius: 12,
    marginBottom: 20,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  myDecksButtonGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 12,
  },
  myDecksButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  myDecksPage: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#1a1a1a',
    paddingTop: 50,
    paddingHorizontal: 20,
  },
  backToBuilderButton: {
    alignSelf: 'flex-start',
    paddingVertical: 10,
    paddingHorizontal: 15,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderRadius: 20,
    marginBottom: 20,
  },
  backToBuilderButtonText: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '500',
  },
  myDecksPageTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFD700',
    textAlign: 'center',
    marginBottom: 30,
  },
  emptyDecksContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyDecksText: {
    fontSize: 18,
    color: '#888',
    textAlign: 'center',
    marginBottom: 10,
  },
  emptyDecksSubText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  decksList: {
    flex: 1,
  },
  deckItem: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 10,
    padding: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  deckHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  deckTitleSection: {
    flex: 1,
  },
  deckName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  deckDate: {
    fontSize: 12,
    color: '#888',
    marginTop: 2,
  },
  deckPieces: {
    fontSize: 12,
    color: '#888',
    marginTop: 2,
  },
  deckActions: {
    flexDirection: 'column',
    gap: 8,
    alignItems: 'flex-end',
  },
  loadDeckButton: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  loadDeckButtonText: {
    fontSize: 12,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  deleteDeckButton: {
    backgroundColor: '#F44336',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  deleteDeckButtonText: {
    fontSize: 12,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  editContainer: {
    width: '100%',
  },
  editInput: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderColor: '#FFD700',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 16,
    color: '#FFFFFF',
    marginBottom: 8,
  },
  editActions: {
    flexDirection: 'row',
    gap: 8,
  },
  saveEditButton: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  saveEditButtonText: {
    fontSize: 12,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  cancelEditButton: {
    backgroundColor: '#666',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  cancelEditButtonText: {
    fontSize: 12,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  deckPiecesPreview: {
    marginTop: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 8,
    paddingTop: 35,
    paddingBottom: 15,
    paddingHorizontal: 25,
    justifyContent: 'flex-end',
    alignItems: 'center',
    minHeight: 120,
  },
  deckPiecesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    maxWidth: 280,
  },
  deckFrontRowGrid: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    marginBottom: 10,
    gap: 5,
  },
  deckBackRowGrid: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    gap: 3,
  },
  deckPieceItem: {
    width: '20%',
    alignItems: 'center',
    marginBottom: 25,
    marginHorizontal: '2%',
  },
  deckPieceContainer: {
    width: 40,
    height: 40,
    marginBottom: 8,
  },
  deckPieceName: {
    fontSize: 10,
    color: '#FFFFFF',
    textAlign: 'center',
    lineHeight: 12,
  },
  deckEmptySlot: {
    width: '20%',
    height: 50,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 5,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 25,
    marginHorizontal: '2%',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    borderStyle: 'dashed',
  },
  deckEmptySlotText: {
    fontSize: 10,
    color: '#888',
  },
  deckNameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  editIconButton: {
    marginLeft: 8,
    padding: 4,
  },
  editIcon: {
    fontSize: 16,
  },
  saveDialogOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  saveDialog: {
    backgroundColor: '#2d2d2d',
    borderRadius: 15,
    padding: 25,
    width: '85%',
    maxWidth: 350,
    borderWidth: 2,
    borderColor: '#FFD700',
  },
  saveDialogTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFD700',
    textAlign: 'center',
    marginBottom: 8,
  },
  saveDialogSubtitle: {
    fontSize: 16,
    color: '#C0C0C0',
    textAlign: 'center',
    marginBottom: 20,
  },
  saveDialogInput: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderColor: '#FFD700',
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 16,
    color: '#FFFFFF',
    marginBottom: 25,
  },
  saveDialogActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 15,
  },
  saveDialogCancelButton: {
    flex: 1,
    backgroundColor: '#666',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  saveDialogCancelText: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  saveDialogConfirmButton: {
    flex: 1,
    backgroundColor: '#4CAF50',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  saveDialogConfirmText: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
});

export default DeckBuilderScreen;
