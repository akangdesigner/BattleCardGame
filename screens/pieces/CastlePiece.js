import React from 'react';
import { View, Text, StyleSheet, Image, Dimensions } from 'react-native';

const { width: screenWidth } = Dimensions.get('window');
const BOARD_SIZE = 8;
const CELL_SIZE = Math.min(screenWidth / BOARD_SIZE - 1, 50);

// 中古城堡棋子組件
const CastlePiece = ({ isSelected, isHighlighted }) => {
  return (
    <View style={styles.container}>
      {/* 城堡圖片 */}
      <Image
        source={require('../../assets/image/castle.png')}
        style={[
          styles.castleImage,
          isSelected && styles.selectedImage,
          isHighlighted && styles.highlightedImage,
        ]}
        resizeMode="contain"
      />
      
      {/* 選中效果 */}
      {isSelected && (
        <View style={styles.selectedEffect}>
          <Text style={styles.selectedText}>⚔️</Text>
        </View>
      )}
      
      {/* 攻擊高亮效果 */}
      {isHighlighted && (
        <View style={styles.highlightEffect}>
          <Text style={styles.highlightText}>💥</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    overflow: 'visible',
  },
  castleImage: {
    width: 70,
    height: 70,
    shadowColor: '#000000',
    shadowOffset: { width: 2, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 3,
    transform: [{ translateY: -15 }],
  },
  selectedImage: {
    transform: [{ scale: 1.1 }],
    shadowColor: '#FFD700',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 8,
  },
  highlightedImage: {
    // 移除攻擊時的紅色外框
  },
  selectedEffect: {
    position: 'absolute',
    top: -10,
    right: -10,
    width: 25,
    height: 25,
    borderRadius: 12.5,
    backgroundColor: 'rgba(255, 215, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFD700',
    shadowColor: '#FFD700',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 8,
  },
  selectedText: {
    fontSize: 12,
    color: '#FFFFFF',
  },
  highlightEffect: {
    position: 'absolute',
    top: -15,
    left: -15,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: 'rgba(231, 76, 60, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#E74C3C',
    shadowColor: '#E74C3C',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 6,
  },
  highlightText: {
    fontSize: 14,
    color: '#FFFFFF',
  },
});

export default CastlePiece;
