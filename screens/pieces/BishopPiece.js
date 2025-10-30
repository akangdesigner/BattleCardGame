import React from 'react';
import { View, Text, StyleSheet, Dimensions, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

const { width: screenWidth } = Dimensions.get('window');
const BOARD_SIZE = 8;
const CELL_SIZE = Math.min(screenWidth / BOARD_SIZE - 1, 50);

const BishopPiece = ({ isSelected, isHighlighted, isSkillTarget, bishopForm }) => {
  // 直接使用你提供的對應圖片，不再使用預設或濾鏡
  let imageSource = require('../../assets/image/RadiantBishop.png');
  if (bishopForm === 'shadow') imageSource = require('../../assets/image/ShadowBishop.png');
  if (bishopForm === 'eclipse') imageSource = require('../../assets/image/EclipseBishop.png');

  return (
    <View style={styles.container}>
      <Image
        source={imageSource}
        style={[
          styles.bishopImage,
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
    position: 'relative',
  },
  bishopImage: {
    width: 70,
    height: 70,
    shadowColor: '#000000',
    shadowOffset: { width: 2, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 3,
    transform: [{ translateY: -15 }],
  },
  // 不再使用濾鏡顏色，完全採用提供的圖片
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
  // 移除形態符號
});

export default BishopPiece;

