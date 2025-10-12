import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

const SleepyDogPiece = ({ isSelected, isHighlighted }) => {
  return (
    <View style={styles.container}>
      {/* 睏睏狗圖片 */}
      <Image
        source={require('../../assets/image/sleepydog.png')}
        style={[
          styles.pureImage,
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
  pureImage: {
    width: 70,
    height: 70,
    shadowColor: '#000000',
    shadowOffset: { width: 2, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 3,
    transform: [{ translateY: -8 }], // 往下移動一點
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

export default SleepyDogPiece;
