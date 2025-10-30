import React from 'react';
import { View, Text, StyleSheet, Dimensions, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

const { width: screenWidth } = Dimensions.get('window');
const BOARD_SIZE = 8;
const CELL_SIZE = Math.min(screenWidth / BOARD_SIZE - 1, 50);

const BerserkerPiece = ({ isSelected, isHighlighted, isSkillTarget }) => {
  return (
    <View style={styles.container}>
      {/* 使用現有圖片或創建一個占位符 */}
      <Image
        source={require('../../assets/image/BloodboundAcolyte.png')}
        style={[
          styles.berserkerImage,
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
  berserkerImage: {
    width: 70,
    height: 70,
    shadowColor: '#DC143C',
    shadowOffset: { width: 2, height: 4 },
    shadowOpacity: 0.6,
    shadowRadius: 4,
    transform: [{ translateY: -15 }],
    // 使用原圖色彩
  },
  selectedImage: {
    transform: [{ scale: 1.1 }, { translateY: -15 }],
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
    transform: [{ scale: 1.1 }, { translateY: -15 }],
    shadowColor: '#FFD700',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1.0,
    shadowRadius: 15,
    borderWidth: 4,
    borderColor: '#FFD700',
    borderRadius: 35,
  },
});

export default BerserkerPiece;
