import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Dimensions,
} from 'react-native';

const { width } = Dimensions.get('window');
const CELL_SIZE = width / 10 - 2;

// 棋子類型定義（增強版）
const PIECE_TYPES = {
  W: { 
    name: '戰士', 
    color: '#E74C3C', 
    symbol: 'W',
    category: '攻擊型',
    skill: '近戰攻擊，第一次被攻擊不會死亡',
    description: '勇敢的戰士，擁有強大的近戰能力和特殊防護',
    gradient: ['#E74C3C', '#C0392B'],
    shadowColor: '#8B0000'
  },
  A: { 
    name: '弓箭手', 
    color: '#3498DB', 
    symbol: 'A',
    category: '遠程型',
    skill: '遠程攻擊，移動範圍廣',
    description: '精準的射手，擅長遠距離作戰',
    gradient: ['#3498DB', '#2980B9'],
    shadowColor: '#1B4F72'
  },
  M: { 
    name: '法師', 
    color: '#9B59B6', 
    symbol: 'M',
    category: '魔法型',
    skill: '魔法攻擊，特殊能力',
    description: '神秘的魔法師，掌握強大的法術',
    gradient: ['#9B59B6', '#8E44AD'],
    shadowColor: '#4A235A'
  },
  K: { 
    name: '騎士', 
    color: '#F39C12', 
    symbol: 'K',
    category: '機動型',
    skill: '高機動性，快速移動',
    description: '敏捷的騎士，擁有出色的機動能力',
    gradient: ['#F39C12', '#E67E22'],
    shadowColor: '#B7950B'
  },
  empty: { 
    name: '空', 
    color: 'transparent', 
    symbol: '',
    category: '',
    skill: '',
    description: '',
    gradient: ['transparent', 'transparent'],
    shadowColor: 'transparent'
  },
};

const Piece3D = ({ 
  piece, 
  isSelected, 
  isHighlighted, 
  onPress, 
  onLongPress,
  row, 
  col 
}) => {
  const [scaleAnim] = useState(new Animated.Value(1));
  const [glowAnim] = useState(new Animated.Value(0));
  const [floatAnim] = useState(new Animated.Value(0));

  // 選中時的動畫效果
  React.useEffect(() => {
    if (isSelected) {
      // 浮起效果
      Animated.sequence([
        Animated.timing(floatAnim, {
          toValue: -8,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(floatAnim, {
          toValue: -6,
          duration: 100,
          useNativeDriver: true,
        }),
      ]).start();

      // 發光效果
      Animated.loop(
        Animated.sequence([
          Animated.timing(glowAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(glowAnim, {
            toValue: 0,
            duration: 1000,
            useNativeDriver: true,
          }),
        ])
      ).start();

      // 放大效果
      Animated.spring(scaleAnim, {
        toValue: 1.1,
        tension: 100,
        friction: 8,
        useNativeDriver: true,
      }).start();
    } else {
      // 恢復原狀
      Animated.parallel([
        Animated.timing(floatAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(glowAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 100,
          friction: 8,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [isSelected]);

  if (piece === 'empty') {
    return (
      <TouchableOpacity
        style={[
          styles.cell,
          {
            backgroundColor: isHighlighted ? '#85C1E9' : (row + col) % 2 === 0 ? '#F8F9FA' : '#E8E8E8',
            width: CELL_SIZE,
            height: CELL_SIZE,
          },
        ]}
        onPress={() => onPress && onPress()}
      />
    );
  }

  const pieceData = PIECE_TYPES[piece];
  const glowOpacity = glowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 0.6],
  });

  return (
    <TouchableOpacity
      style={[
        styles.cell,
        {
          backgroundColor: isHighlighted 
            ? '#E74C3C' 
            : (row + col) % 2 === 0 ? '#F8F9FA' : '#E8E8E8',
          width: CELL_SIZE,
          height: CELL_SIZE,
        },
      ]}
      onPress={() => onPress && onPress()}
      onLongPress={() => onLongPress && onLongPress()}
      activeOpacity={0.8}
    >
      <Animated.View
        style={[
          styles.pieceContainer,
          {
            transform: [
              { translateY: floatAnim },
              { scale: scaleAnim },
            ],
          },
        ]}
      >
        {/* 發光效果 */}
        <Animated.View
          style={[
            styles.glowEffect,
            {
              opacity: glowOpacity,
              backgroundColor: pieceData.color,
            },
          ]}
        />
        
        {/* 陰影效果 */}
        <View
          style={[
            styles.pieceShadow,
            {
              backgroundColor: pieceData.shadowColor,
              shadowColor: pieceData.shadowColor,
            },
          ]}
        />
        
        {/* 主棋子 */}
        <View
          style={[
            styles.piece,
            {
              backgroundColor: pieceData.color,
              shadowColor: pieceData.shadowColor,
            },
          ]}
        >
          {/* 漸變效果 */}
          <View
            style={[
              styles.pieceGradient,
              {
                backgroundColor: pieceData.gradient[1],
              },
            ]}
          />
          
          {/* 棋子符號 */}
          <Text style={styles.pieceText}>{pieceData.symbol}</Text>
          
          {/* 高光效果 */}
          <View style={styles.pieceHighlight} />
        </View>
      </Animated.View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  cell: {
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 0.5,
    borderColor: '#7F8C8D',
    position: 'relative',
  },
  pieceContainer: {
    position: 'relative',
    width: CELL_SIZE * 0.8,
    height: CELL_SIZE * 0.8,
  },
  glowEffect: {
    position: 'absolute',
    width: '120%',
    height: '120%',
    borderRadius: CELL_SIZE * 0.4,
    top: '-10%',
    left: '-10%',
  },
  pieceShadow: {
    position: 'absolute',
    width: '90%',
    height: '90%',
    borderRadius: CELL_SIZE * 0.35,
    bottom: -2,
    right: 2,
    opacity: 0.3,
    shadowOffset: {
      width: 2,
      height: 2,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  piece: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    borderRadius: CELL_SIZE * 0.4,
    justifyContent: 'center',
    alignItems: 'center',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
  },
  pieceGradient: {
    position: 'absolute',
    width: '100%',
    height: '60%',
    borderRadius: CELL_SIZE * 0.4,
    top: 0,
    opacity: 0.3,
  },
  pieceText: {
    color: '#FFFFFF',
    fontSize: CELL_SIZE * 0.25,
    fontWeight: 'bold',
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  pieceHighlight: {
    position: 'absolute',
    width: '40%',
    height: '40%',
    borderRadius: CELL_SIZE * 0.2,
    top: '15%',
    left: '15%',
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
  },
});

export default Piece3D;
export { PIECE_TYPES };
