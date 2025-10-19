import React from 'react';
import { View, Text, StyleSheet, Dimensions, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

const { width: screenWidth } = Dimensions.get('window');
const BOARD_SIZE = 8;
const CELL_SIZE = Math.min(screenWidth / BOARD_SIZE - 1, 50);

const SoldierPiece = ({ isSelected, isHighlighted, isSkillTarget }) => {
  return (
    <View style={styles.container}>
      {/* 使用您的士兵圖片 */}
      <Image
        source={require('../../assets/image/soldier.png')}
        style={[
          styles.soldierImage,
          isSelected && styles.selectedImage,
          isHighlighted && styles.highlightedImage,
          isSkillTarget && styles.skillTargetImage,
        ]}
        resizeMode="contain"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  soldierImage: {
    width: 70,
    height: 70,
    shadowColor: '#000000',
    shadowOffset: { width: 2, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 3,
    // 向上移動到格子上方
    transform: [{ translateY: -15 }],
    // 移除 elevation，因為 Image 不支援
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
  skillTargetImage: {
    transform: [{ scale: 1.1 }],
    shadowColor: '#FFD700', // 黃色光暈
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1.0,
    shadowRadius: 15,
    borderWidth: 4,
    borderColor: '#FFD700', // 黃色邊框
    borderRadius: 35,
  },
});

export default SoldierPiece;
