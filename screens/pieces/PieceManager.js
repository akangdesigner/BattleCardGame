import React from 'react';
import { View, Text, StyleSheet, Dimensions, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import SoldierPiece from './SoldierPiece';
import ArcherPiece from './ArcherPiece';
import PriestPiece from './PriestPiece';
import AssassinPiece from './AssassinPiece';
import MindTwisterPiece from './MindTwisterPiece';
import CrossbowmanPiece from './CrossbowmanPiece';
import SamuraiPiece from './SamuraiPiece';
import WarArchitectPiece from './WarArchitectPiece';
import SleepyDogPiece from './SleepyDogPiece';
import CarnivorousCrabPiece from './CarnivorousCrabPiece';
import { getPieceMaxHealth, getPieceHealth, getPieceAttackType } from '../pieceRules';

const { width: screenWidth } = Dimensions.get('window');
const BOARD_SIZE = 8;
const CELL_SIZE = Math.min(screenWidth / BOARD_SIZE - 1, 50);

// 血條組件
const HealthBar = ({ piece, currentHealth, maxHealth }) => {
  if (!piece || piece === 'empty') return null;
  
  // 血條總是顯示100滴血的寬度，分為綠色和紅色兩部分
  // 200血棋子：全綠(200血) → 一半綠一半紅(150血) → 全紅(100血) → 空(0血)
  // 100血棋子：全紅(100血) → 空(0血)
  
  let greenWidth = 0; // 綠色血條寬度（左側）
  let redWidth = 0;   // 紅色血條寬度（右側）
  
  if (currentHealth <= 0) {
    // 空血條
    greenWidth = 0;
    redWidth = 0;
  } else if (currentHealth <= 100) {
    // 只有紅色（1-100血）
    greenWidth = 0;
    redWidth = (currentHealth / 100) * 100; // 紅色部分：0-100%
  } else if (currentHealth <= 200) {
    // 綠色 + 紅色（101-200血）
    const greenHealth = currentHealth - 100; // 綠色部分的血量 (0-100)
    greenWidth = (greenHealth / 100) * 100; // 綠色佔左側：0-100%
    redWidth = 100; // 紅色佔右側：固定100%（但會被綠色覆蓋）
  }
  
  return (
    <View style={styles.healthBarContainer}>
      <View style={styles.healthBarBackground}>
        {/* 綠色血條（上層，覆蓋紅色） */}
        {greenWidth > 0 && (
          <View 
            style={[
              styles.healthBarFill, 
              { 
                width: `${greenWidth}%`,
                backgroundColor: '#4CAF50', // 綠色
                position: 'absolute',
                left: 0,
                zIndex: 2,
              }
            ]} 
          />
        )}
        {/* 紅色血條（底層，總是100%寬度） */}
        {redWidth > 0 && (
          <View 
            style={[
              styles.healthBarFill, 
              { 
                width: `${redWidth}%`,
                backgroundColor: '#F44336', // 紅色
                position: 'absolute',
                left: 0,
                zIndex: 1,
              }
            ]} 
          />
        )}
      </View>
    </View>
  );
};

// 統一的棋子管理器
const PieceManager = ({ piece, isSelected, isHighlighted, currentHealth, maxHealth }) => {
  // 如果沒有傳入血量，使用默認值
  const pieceHealth = currentHealth !== undefined ? currentHealth : getPieceHealth(piece);
  const pieceMaxHealth = maxHealth !== undefined ? maxHealth : getPieceMaxHealth(piece);
  
  // 根據棋子類型返回對應的組件
  const pieceComponent = (() => {
    switch (piece) {
      case 'S': // 士兵
        return <SoldierPiece isSelected={isSelected} isHighlighted={isHighlighted} />;
      case 'A': // 弓箭手
        return <ArcherPiece isSelected={isSelected} isHighlighted={isHighlighted} />;
      case 'M': // 法師
        return <MagePiece isSelected={isSelected} isHighlighted={isHighlighted} />;
      case 'K': // 騎士
        return <KnightPiece isSelected={isSelected} isHighlighted={isHighlighted} />;
      case 'P': // 牧師
        return <PriestPiece isSelected={isSelected} isHighlighted={isHighlighted} />;
      case 'AS': // 刺客
        return <AssassinPiece isSelected={isSelected} isHighlighted={isHighlighted} />;
      case 'MT': // 心智扭曲者
        return <MindTwisterPiece isSelected={isSelected} isHighlighted={isHighlighted} />;
      case 'CB': // 弩手
        return <CrossbowmanPiece isSelected={isSelected} isHighlighted={isHighlighted} />;
      case 'SM': // 太刀武士
        return <SamuraiPiece isSelected={isSelected} isHighlighted={isHighlighted} />;
      case 'WA': // 戰爭建築師
        return <WarArchitectPiece isSelected={isSelected} isHighlighted={isHighlighted} />;
      case 'SD': // 睏睏狗
        return <SleepyDogPiece isSelected={isSelected} isHighlighted={isHighlighted} />;
      case 'CC': // 食人螃蟹
        return <CarnivorousCrabPiece isSelected={isSelected} isHighlighted={isHighlighted} />;
      default:
        return <EmptyPiece />;
    }
  })();
  
  return (
    <View style={styles.pieceWithHealth}>
      {pieceComponent}
      <HealthBar piece={piece} currentHealth={pieceHealth} maxHealth={pieceMaxHealth} />
    </View>
  );
};

// SoldierPiece 和 ArcherPiece 現在從外部導入


// 法師棋子
const MagePiece = ({ isSelected, isHighlighted }) => {
  return (
    <View style={styles.container}>
      {/* 法師圖片 */}
      <Image
        source={require('../../assets/image/magicman.png')}
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

// 騎士棋子
const KnightPiece = ({ isSelected, isHighlighted }) => {
  return (
    <View style={styles.container}>
      {/* 騎士圖片 */}
      <Image
        source={require('../../assets/image/knight.png')}
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
    position: 'relative',
  },
  pieceWithHealth: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  healthBarContainer: {
    position: 'absolute',
    bottom: 2,
    left: '50%',
    transform: [{ translateX: -20 }],
    width: 40,
    alignItems: 'center',
  },
  healthBarBackground: {
    width: '100%',
    height: 4,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 2,
    overflow: 'hidden',
    borderWidth: 0.5,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  healthBarFill: {
    height: '100%',
    borderRadius: 2,
    transition: 'width 0.3s ease',
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
  // 新的3D效果樣式
  outerShadow: {
    position: 'absolute',
    width: 67,
    height: 67,
    borderRadius: 33.5,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    bottom: -3,
    right: -2,
    shadowColor: '#000000',
    shadowOffset: { width: 3, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 6,
  },
  selectedOuterShadow: {
    shadowColor: '#FFD700',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 12,
    elevation: 10,
  },
  piece3DBase: {
    width: 65,
    height: 65,
    borderRadius: 32.5,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 2, height: 4 },
    shadowOpacity: 0.6,
    shadowRadius: 6,
    elevation: 8,
    position: 'relative',
    // 讓棋子向上移動到格子上方
    transform: [{ translateY: -15 }],
    // 3D邊框效果
    borderWidth: 2,
    borderTopColor: 'rgba(255, 255, 255, 0.3)',
    borderLeftColor: 'rgba(255, 255, 255, 0.2)',
    borderRightColor: 'rgba(0, 0, 0, 0.3)',
    borderBottomColor: 'rgba(0, 0, 0, 0.4)',
  },
  innerHighlight: {
    position: 'absolute',
    width: '70%',
    height: '70%',
    borderRadius: 22.75,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    top: '15%',
    left: '15%',
    shadowColor: 'rgba(255, 255, 255, 0.5)',
    shadowOffset: { width: -1, height: -1 },
    shadowOpacity: 0.8,
    shadowRadius: 2,
  },
  topHighlight: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    borderRadius: 32.5,
    top: 0,
    left: 0,
  },
  magicGlow: {
    position: 'absolute',
    width: '120%',
    height: '120%',
    borderRadius: 39,
    backgroundColor: 'rgba(147, 112, 219, 0.3)',
    top: '-10%',
    left: '-10%',
    shadowColor: '#9370DB',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 15,
    elevation: 12,
  },
  pieceText: {
    fontSize: 30,
    fontWeight: 'bold',
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 1, height: 2 },
    textShadowRadius: 3,
    zIndex: 10,
  },
  pureImage: {
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
});

export default PieceManager;
