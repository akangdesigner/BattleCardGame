import React from 'react';
import { View, Text, StyleSheet, Dimensions, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

const { width: screenWidth } = Dimensions.get('window');
const BOARD_SIZE = 8;
const CELL_SIZE = Math.min(screenWidth / BOARD_SIZE - 1, 50);

const PriestPiece = ({ isSelected, isHighlighted }) => {
  return (
    <View style={styles.container}>
      {/* 牧師圖片 */}
      <Image
        source={require('../../assets/image/Priest.png')}
        style={[
          styles.priestImage,
          isSelected && styles.selectedImage,
          isHighlighted && styles.highlightedImage,
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
  priestImage: {
    width: 70,
    height: 70,
    shadowColor: '#000000',
    shadowOffset: { width: 2, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 3,
    // 向上移動到格子上方
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
    borderWidth: 2,
    borderColor: '#FF6B6B',
    borderRadius: 4,
  },
});

export default PriestPiece;
