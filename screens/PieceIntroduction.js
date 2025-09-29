import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  ScrollView,
  FlatList,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

// 棋子資料
const PIECE_DATA = [
  {
    id: 'S',
    name: '士兵',
    symbol: 'S',
    color: '#8B4513',
    category: '基礎型',
    skill: '基礎近戰攻擊，移動範圍小但穩定',
    description: '忠誠的士兵，基礎戰鬥單位，穩定可靠。移動範圍小但攻擊穩定，是戰場上的中堅力量。',
    movement: '只能向前移動一格',
    attack: '攻擊相鄰的敵人',
  },
  {
    id: 'W',
    name: '戰士',
    symbol: 'W',
    color: '#FFD700',
    category: '攻擊型',
    skill: '近戰攻擊，第一次被攻擊不會死亡',
    description: '勇敢的戰士，擁有強大的近戰能力和特殊防護。第一次受到攻擊時不會死亡，具有頑強的生命力。',
    movement: '可以向前、左、右移動一格',
    attack: '攻擊相鄰的敵人，第一次被攻擊時不會死亡',
  },
  {
    id: 'A',
    name: '弓箭手',
    symbol: 'A',
    color: '#C0C0C0',
    category: '遠程型',
    skill: '遠程攻擊，攻擊範圍廣但近戰較弱',
    description: '精準的弓箭手，擅長遠程攻擊。攻擊範圍廣闊，但近戰能力較弱，需要保持距離。',
    movement: '移動範圍較大',
    attack: '可以攻擊距離較遠的敵人',
  },
  {
    id: 'M',
    name: '法師',
    symbol: 'M',
    color: '#9370DB',
    category: '魔法型',
    skill: '魔法攻擊，可以攻擊多個敵人',
    description: '強大的法師，掌握神秘魔法。可以同時攻擊多個敵人，是戰場上的重要支援力量。',
    movement: '移動範圍中等',
    attack: '魔法攻擊，可以攻擊多個敵人',
  },
];

const PieceIntroduction = ({ onBack }) => {
  const [selectedPiece, setSelectedPiece] = useState(PIECE_DATA[0]);

  const renderPieceCard = ({ item }) => (
    <TouchableOpacity
      style={[
        styles.pieceCard,
        selectedPiece.id === item.id && styles.selectedPieceCard,
      ]}
      onPress={() => setSelectedPiece(item)}
      activeOpacity={0.8}
    >
      <LinearGradient
        colors={
          selectedPiece.id === item.id
            ? [item.color, item.color + 'AA', item.color + '66']
            : ['rgba(255,255,255,0.1)', 'rgba(255,255,255,0.05)']
        }
        style={styles.pieceCardGradient}
      >
        <Text style={styles.pieceSymbol}>{item.symbol}</Text>
        <Text style={styles.pieceName}>{item.name}</Text>
        <Text style={styles.pieceCategory}>{item.category}</Text>
      </LinearGradient>
    </TouchableOpacity>
  );

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
          <Text style={styles.title}>棋子介紹</Text>
          <Text style={styles.subtitle}>Piece Introduction</Text>
          <View style={styles.titleUnderline} />
        </View>

        {/* 棋子選擇區域 */}
        <View style={styles.piecesContainer}>
          <FlatList
            data={PIECE_DATA}
            renderItem={renderPieceCard}
            keyExtractor={(item) => item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.piecesList}
          />
        </View>

        {/* 詳細資訊區域 */}
        <ScrollView style={styles.detailContainer} showsVerticalScrollIndicator={false}>
          <View style={styles.pieceInfoCard}>
            <LinearGradient
              colors={[selectedPiece.color + 'AA', selectedPiece.color + '66']}
              style={styles.pieceInfoGradient}
            >
              <View style={styles.pieceHeader}>
                <Text style={styles.pieceInfoSymbol}>{selectedPiece.symbol}</Text>
                <View style={styles.pieceInfoText}>
                  <Text style={styles.pieceInfoName}>{selectedPiece.name}</Text>
                  <Text style={styles.pieceInfoCategory}>{selectedPiece.category}</Text>
                </View>
              </View>
              
              <Text style={styles.pieceDescription}>{selectedPiece.description}</Text>
              
              <View style={styles.skillSection}>
                <Text style={styles.sectionTitle}>特殊技能</Text>
                <Text style={styles.skillText}>{selectedPiece.skill}</Text>
              </View>
              
              <View style={styles.movementSection}>
                <Text style={styles.sectionTitle}>移動方式</Text>
                <Text style={styles.movementText}>{selectedPiece.movement}</Text>
              </View>
              
              <View style={styles.attackSection}>
                <Text style={styles.sectionTitle}>攻擊方式</Text>
                <Text style={styles.attackText}>{selectedPiece.attack}</Text>
              </View>
            </LinearGradient>
          </View>
        </ScrollView>
      </View>
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
    paddingTop: 100,
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
  piecesContainer: {
    height: 120,
    marginBottom: 20,
  },
  piecesList: {
    paddingHorizontal: 10,
  },
  pieceCard: {
    width: 100,
    height: 100,
    marginHorizontal: 8,
    borderRadius: 15,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  selectedPieceCard: {
    elevation: 8,
    shadowOpacity: 0.4,
    shadowRadius: 8,
  },
  pieceCardGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 15,
    padding: 10,
  },
  pieceSymbol: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  pieceName: {
    fontSize: 12,
    color: '#FFFFFF',
    fontWeight: '600',
    textAlign: 'center',
  },
  pieceCategory: {
    fontSize: 10,
    color: '#E0E0E0',
    textAlign: 'center',
    marginTop: 2,
  },
  detailContainer: {
    flex: 1,
  },
  pieceInfoCard: {
    borderRadius: 20,
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
  },
  pieceInfoGradient: {
    padding: 20,
    borderRadius: 20,
  },
  pieceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  pieceInfoSymbol: {
    fontSize: 40,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginRight: 15,
  },
  pieceInfoText: {
    flex: 1,
  },
  pieceInfoName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  pieceInfoCategory: {
    fontSize: 16,
    color: '#E0E0E0',
  },
  pieceDescription: {
    fontSize: 16,
    color: '#F0F0F0',
    lineHeight: 24,
    marginBottom: 20,
  },
  skillSection: {
    marginBottom: 15,
  },
  movementSection: {
    marginBottom: 15,
  },
  attackSection: {
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFD700',
    marginBottom: 8,
  },
  skillText: {
    fontSize: 14,
    color: '#E0E0E0',
    lineHeight: 20,
  },
  movementText: {
    fontSize: 14,
    color: '#E0E0E0',
    lineHeight: 20,
  },
  attackText: {
    fontSize: 14,
    color: '#E0E0E0',
    lineHeight: 20,
  },
});

export default PieceIntroduction;
