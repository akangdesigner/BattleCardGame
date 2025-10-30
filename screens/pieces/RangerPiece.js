import React from 'react';
import { View, Image, StyleSheet, Dimensions, Text } from 'react-native';

const { width: screenWidth } = Dimensions.get('window');
const BOARD_SIZE = 8;
const CELL_SIZE = Math.min(screenWidth / BOARD_SIZE - 1, 50);

const RangerPiece = ({ isSelected, isHighlighted, isSkillTarget }) => {
  return (
    <View style={styles.container}>
      <Image
        source={require('../../assets/image/WardenRanger.png')}
        style={[
          styles.image,
          isSelected && styles.selectedImage,
          isHighlighted && styles.highlightedImage,
          isSkillTarget && styles.skillTargetImage,
        ]}
        resizeMode="contain"
      />
      {/* 移除覆蓋與濾鏡，直接顯示原圖 */}
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
  image: {
    width: 70,
    height: 70,
    shadowColor: '#000000',
    shadowOffset: { width: 2, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 3,
    transform: [{ translateY: -15 }],
  },
  // 不加 tint，避免部分機型顯示異常
  selectedImage: {
    transform: [{ scale: 1.1 }, { translateY: -15 }],
    shadowColor: '#FFD700',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 8,
  },
  highlightedImage: {
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
  // 移除裝飾標記
});

export default RangerPiece;


