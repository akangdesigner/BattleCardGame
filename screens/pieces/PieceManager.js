import React from 'react';
import { View, Text, StyleSheet, Dimensions, Image } from 'react-native';
import SoldierPiece from './SoldierPiece';

const { width: screenWidth } = Dimensions.get('window');
const BOARD_SIZE = 8;
const CELL_SIZE = Math.min(screenWidth / BOARD_SIZE - 1, 50);

// 統一的棋子管理器
const PieceManager = ({ piece, isSelected, isHighlighted }) => {
  // 根據棋子類型返回對應的組件
  switch (piece) {
    case 'S': // 士兵
      return <SoldierPiece isSelected={isSelected} isHighlighted={isHighlighted} />;
    case 'A': // 弓箭手
      return <ArcherPiece isSelected={isSelected} isHighlighted={isHighlighted} />;
    case 'W': // 戰士
      return <WarriorPiece isSelected={isSelected} isHighlighted={isHighlighted} />;
    case 'M': // 法師
      return <MagePiece isSelected={isSelected} isHighlighted={isHighlighted} />;
    case 'K': // 騎士
      return <KnightPiece isSelected={isSelected} isHighlighted={isHighlighted} />;
    default:
      return <EmptyPiece />;
  }
};

// SoldierPiece 現在從外部導入

// 弓箭手棋子
const ArcherPiece = ({ isSelected, isHighlighted }) => {
  return (
    <View style={styles.container}>
      <Image
        source={require('../../assets/image/arror.png')}
        style={[
          styles.pieceImage,
          isSelected && styles.selectedImage,
          isHighlighted && styles.highlightedImage,
        ]}
        resizeMode="contain"
      />
    </View>
  );
};

// 戰士棋子
const WarriorPiece = ({ isSelected, isHighlighted }) => {
  return (
    <View style={styles.container}>
      <View style={[
        styles.textPiece,
        { backgroundColor: '#FFD700' },
        isSelected && styles.selectedImage,
        isHighlighted && styles.highlightedImage,
      ]}>
        <Text style={[styles.pieceText, { color: '#000000' }]}>W</Text>
      </View>
    </View>
  );
};

// 法師棋子
const MagePiece = ({ isSelected, isHighlighted }) => {
  return (
    <View style={styles.container}>
      <View style={[
        styles.textPiece,
        { backgroundColor: '#9370DB' },
        isSelected && styles.selectedImage,
        isHighlighted && styles.highlightedImage,
      ]}>
        <Text style={[styles.pieceText, { color: '#FFFFFF' }]}>M</Text>
      </View>
    </View>
  );
};

// 騎士棋子
const KnightPiece = ({ isSelected, isHighlighted }) => {
  return (
    <View style={styles.container}>
      <View style={[
        styles.textPiece,
        { backgroundColor: '#32CD32' },
        isSelected && styles.selectedImage,
        isHighlighted && styles.highlightedImage,
      ]}>
        <Text style={[styles.pieceText, { color: '#FFFFFF' }]}>K</Text>
      </View>
    </View>
  );
};

// 空白棋子
const EmptyPiece = () => {
  return <View style={styles.container} />;
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  pieceImage: {
    width: 60,
    height: 60,
    shadowColor: '#000000',
    shadowOffset: { width: 2, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 3,
  },
  textPiece: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 2, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 3,
  },
  pieceText: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  selectedImage: {
    transform: [{ scale: 1.1 }],
    shadowColor: '#FFD700',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 8,
  },
  highlightedImage: {
    borderWidth: 2,
    borderColor: '#FF6B6B',
    borderRadius: 4,
  },
});

export default PieceManager;
