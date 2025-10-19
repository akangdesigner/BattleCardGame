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
import CastlePiece from './CastlePiece';
import { getPieceMaxHealth, getPieceHealth, getPieceAttackType } from '../pieceRules';

const { width: screenWidth } = Dimensions.get('window');
const BOARD_SIZE = 8;
const CELL_SIZE = Math.min(screenWidth / BOARD_SIZE - 1, 50);

// 血條組件
const HealthBar = ({ piece, currentHealth, maxHealth, isPlayerPiece }) => {
  if (!piece || piece === 'empty') return null;
  
  
  // 血條顯示邏輯：支持不同血量的棋子
  // 300血棋子（英雄/城堡）：紫色血條
  // 200血棋子：綠色 + 紅色
  // 100血棋子：紅色
  
  let purpleWidth = 0; // 紫色血條寬度（英雄/城堡）
  let greenWidth = 0;  // 綠色血條寬度
  let redWidth = 0;    // 紅色血條寬度
  
  // 檢查是否為英雄或城堡（300血）
  const isHeroOrCastle = piece === 'MT' || piece === 'CASTLE' || piece === 'WA';
  
  if (currentHealth <= 0) {
    // 空血條
    purpleWidth = 0;
    greenWidth = 0;
    redWidth = 0;
  } else {
    // 每種顏色100血
    if (currentHealth > 200) {
      // 紫色部分（201-300血）
      purpleWidth = ((currentHealth - 200) / 100) * 100; // 紫色：0-100%
      greenWidth = 100; // 綠色：固定100%
      redWidth = 100; // 紅色：固定100%
    } else if (currentHealth > 100) {
      // 綠色部分（101-200血）
      greenWidth = ((currentHealth - 100) / 100) * 100; // 綠色：0-100%
      redWidth = 100; // 紅色：固定100%
      purpleWidth = 0; // 紫色：0%
    } else {
      // 紅色部分（1-100血）
      redWidth = (currentHealth / 100) * 100; // 紅色：0-100%
      greenWidth = 0; // 綠色：0%
      purpleWidth = 0; // 紫色：0%
    }
  }
  
  return (
    <View style={[
      styles.healthBarContainer,
      isPlayerPiece && styles.playerHealthBarContainer
    ]}>
      <View style={[
        styles.healthBarBackground,
        isPlayerPiece && styles.playerHealthBarBackground
      ]}>
        {/* 紫色血條（英雄/城堡，最高層） */}
        {purpleWidth > 0 && (
          <View 
            style={[
              styles.healthBarFill, 
              { 
                width: `${purpleWidth}%`,
                backgroundColor: '#9C27B0', // 紫色
                position: 'absolute',
                left: 0,
                zIndex: 3,
              }
            ]} 
          />
        )}
        {/* 綠色血條（中層，覆蓋紅色） */}
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
const PieceManager = ({ piece, isSelected, isHighlighted, isSkillTarget, currentHealth, maxHealth, isPlayerPiece, skillEffects, currentTurn = 0 }) => {
  // 如果沒有傳入血量，使用默認值
  const pieceHealth = currentHealth !== undefined ? currentHealth : getPieceHealth(piece);
  const pieceMaxHealth = maxHealth !== undefined ? maxHealth : getPieceMaxHealth(piece);
  
  // 根據棋子類型返回對應的組件
  const pieceComponent = (() => {
    switch (piece) {
      case 'S': // 士兵
        return <SoldierPiece isSelected={isSelected} isHighlighted={isHighlighted} isSkillTarget={isSkillTarget} />;
      case 'A': // 弓箭手
        return <ArcherPiece isSelected={isSelected} isHighlighted={isHighlighted} isSkillTarget={isSkillTarget} />;
      case 'M': // 法師
        return <MagePiece isSelected={isSelected} isHighlighted={isHighlighted} isSkillTarget={isSkillTarget} />;
      case 'K': // 騎士
        return <KnightPiece isSelected={isSelected} isHighlighted={isHighlighted} isSkillTarget={isSkillTarget} />;
      case 'P': // 牧師
        return <PriestPiece isSelected={isSelected} isHighlighted={isHighlighted} isSkillTarget={isSkillTarget} />;
      case 'AS': // 刺客
        return <AssassinPiece isSelected={isSelected} isHighlighted={isHighlighted} isSkillTarget={isSkillTarget} />;
      case 'MT': // 心智扭曲者
        return <MindTwisterPiece isSelected={isSelected} isHighlighted={isHighlighted} isSkillTarget={isSkillTarget} />;
      case 'CB': // 弩手
        return <CrossbowmanPiece isSelected={isSelected} isHighlighted={isHighlighted} isSkillTarget={isSkillTarget} />;
      case 'SM': // 太刀武士
        return <SamuraiPiece isSelected={isSelected} isHighlighted={isHighlighted} isSkillTarget={isSkillTarget} />;
      case 'WA': // 戰爭建築師
        return <WarArchitectPiece isSelected={isSelected} isHighlighted={isHighlighted} isSkillTarget={isSkillTarget} />;
      case 'SD': // 睏睏狗
        return <SleepyDogPiece isSelected={isSelected} isHighlighted={isHighlighted} isSkillTarget={isSkillTarget} />;
      case 'CC': // 食人螃蟹
        return <CarnivorousCrabPiece isSelected={isSelected} isHighlighted={isHighlighted} isSkillTarget={isSkillTarget} />;
      case 'CASTLE': // 中古城堡
        return <CastlePiece isSelected={isSelected} isHighlighted={isHighlighted} isSkillTarget={isSkillTarget} />;
      default:
        return <EmptyPiece />;
    }
  })();
  
  return (
    <View style={styles.pieceWithHealth}>
      {pieceComponent}
      <HealthBar 
        piece={piece} 
        currentHealth={pieceHealth} 
        maxHealth={pieceMaxHealth} 
        isPlayerPiece={isPlayerPiece}
      />
      {/* 技能效果顯示 */}
      <SkillEffectsDisplay piece={piece} skillEffects={skillEffects} currentTurn={currentTurn} />
    </View>
  );
};

// SoldierPiece 和 ArcherPiece 現在從外部導入


// 法師棋子
const MagePiece = ({ isSelected, isHighlighted, isSkillTarget }) => {
  return (
    <View style={styles.container}>
      {/* 法師圖片 */}
      <Image
        source={require('../../assets/image/magicman.png')}
        style={[
          styles.pureImage,
          isSelected && styles.selectedImage,
          isHighlighted && styles.highlightedImage,
          isSkillTarget && styles.skillTargetImage,
        ]}
        resizeMode="contain"
      />
    </View>
  );
};

// 騎士棋子
const KnightPiece = ({ isSelected, isHighlighted, isSkillTarget }) => {
  return (
    <View style={styles.container}>
      {/* 騎士圖片 */}
      <Image
        source={require('../../assets/image/knight.png')}
        style={[
          styles.pureImage,
          isSelected && styles.selectedImage,
          isHighlighted && styles.highlightedImage,
          isSkillTarget && styles.skillTargetImage,
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

// 技能效果顯示組件
const SkillEffectsDisplay = ({ piece, skillEffects, currentTurn = 0 }) => {
  if (!skillEffects || 
      (skillEffects.buffs && skillEffects.buffs.length === 0) && 
      (skillEffects.debuffs && skillEffects.debuffs.length === 0)) {
    return null;
  }

  return (
    <View style={styles.skillEffectsContainer}>
      {/* 顯示增益效果 */}
      {skillEffects.buffs && skillEffects.buffs.map((buff, index) => {
        const remainingTurns = Math.max(0, buff.endTurn - currentTurn);
        // 如果剩餘回合數為0，不顯示這個效果
        if (remainingTurns <= 0) return null;
        return (
          <View key={`buff-${index}`} style={styles.skillEffect}>
            {buff.type === 'holy_shield' && (
              <View style={styles.holyShieldEffect}>
                <Text style={styles.shieldIcon}>🛡️</Text>
                <View style={styles.shieldGlow} />
                <Text style={styles.durationText}>{remainingTurns}</Text>
              </View>
            )}
            {buff.type === 'spiked_armor' && (
              <View style={styles.spikedArmorEffect}>
                <Text style={styles.armorIcon}>⚔️</Text>
                <View style={styles.armorGlow} />
                <Text style={styles.durationText}>{remainingTurns}</Text>
              </View>
            )}
            {buff.type === 'shadow_cloak' && (
              <View style={styles.shadowCloakEffect}>
                <Text style={styles.shadowIcon}>👤</Text>
                <View style={styles.shadowGlow} />
                <Text style={styles.durationText}>{remainingTurns}</Text>
              </View>
            )}
            {buff.type === 'defensive_wall' && (
              <View style={styles.defensiveWallEffect}>
                <Text style={styles.wallIcon}>🏰</Text>
                <View style={styles.wallGlow} />
                <Text style={styles.durationText}>{remainingTurns}</Text>
              </View>
            )}
          {buff.type === 'burning_arrow' && (
            <View style={styles.burningArrowEffect}>
              <Text style={styles.burningArrowIcon}>🔥</Text>
              <View style={styles.burningArrowGlow} />
              <Text style={styles.durationText}>{remainingTurns}</Text>
            </View>
          )}
        </View>
      );
      })}
      
      {/* 顯示減益效果 */}
      {skillEffects.debuffs && skillEffects.debuffs.map((debuff, index) => {
        const remainingTurns = Math.max(0, debuff.endTurn - currentTurn);
        // 如果剩餘回合數為0，不顯示這個效果
        if (remainingTurns <= 0) return null;
        return (
          <View key={`debuff-${index}`} style={styles.skillEffect}>
            {debuff.type === 'burning' && (
              <View style={styles.burningEffect}>
                <Text style={styles.burningIcon}>🔥</Text>
                <View style={styles.burningGlow} />
                <Text style={styles.durationText}>{remainingTurns}</Text>
              </View>
            )}
            {debuff.type === 'death_curse' && (
              <View style={styles.deathCurseEffect}>
                <Text style={styles.deathIcon}>💀</Text>
                <View style={styles.deathGlow} />
                <Text style={styles.durationText}>{remainingTurns}</Text>
              </View>
            )}
          </View>
        );
      })}
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
    height: 8, // 增加血條高度
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 4, // 相應增加圓角
    overflow: 'hidden',
    borderWidth: 1.5,
    borderColor: '#FFFFFF', // 白色外框
  },
  playerHealthBarContainer: {
    // 我方棋子血條容器的額外樣式
    borderWidth: 1.5,
    borderColor: '#000000', // 黑色外框
    borderRadius: 4,
  },
  playerHealthBarBackground: {
    borderWidth: 1,
    borderColor: '#000000', // 黑色外框
    backgroundColor: 'rgba(0, 0, 0, 0.8)', // 深色背景
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
  // 技能效果樣式
  skillEffectsContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    pointerEvents: 'none',
  },
  skillEffect: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
  },
  // 聖盾術效果
  holyShieldEffect: {
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  shieldIcon: {
    fontSize: 30,
    zIndex: 10,
    textShadowColor: '#FFD700',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },
  shieldGlow: {
    position: 'absolute',
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 215, 0, 0.3)',
    borderWidth: 2,
    borderColor: '#FFD700',
    shadowColor: '#FFD700',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 15,
  },
  // 尖刺戰甲效果
  spikedArmorEffect: {
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  armorIcon: {
    fontSize: 30,
    zIndex: 10,
    textShadowColor: '#8B4513',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },
  armorGlow: {
    position: 'absolute',
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(139, 69, 19, 0.3)',
    borderWidth: 2,
    borderColor: '#8B4513',
    shadowColor: '#8B4513',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 15,
  },
  // 暗影披風效果
  shadowCloakEffect: {
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  shadowIcon: {
    fontSize: 30,
    zIndex: 10,
    textShadowColor: '#2C2C2C',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },
  shadowGlow: {
    position: 'absolute',
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(44, 44, 44, 0.3)',
    borderWidth: 2,
    borderColor: '#2C2C2C',
    shadowColor: '#2C2C2C',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 15,
  },
  // 防禦牆效果
  defensiveWallEffect: {
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  wallIcon: {
    fontSize: 30,
    zIndex: 10,
    textShadowColor: '#8B4513',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },
  wallGlow: {
    position: 'absolute',
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(139, 69, 19, 0.3)',
    borderWidth: 2,
    borderColor: '#8B4513',
    shadowColor: '#8B4513',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 15,
  },
  // 燃燒箭效果
  burningArrowEffect: {
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  burningArrowIcon: {
    fontSize: 30,
    zIndex: 10,
    textShadowColor: '#FF4500',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },
  burningArrowGlow: {
    position: 'absolute',
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 69, 0, 0.3)',
    borderWidth: 2,
    borderColor: '#FF4500',
    shadowColor: '#FF4500',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 15,
  },
  // 燃燒效果（減益）
  burningEffect: {
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  burningIcon: {
    fontSize: 30,
    zIndex: 10,
    textShadowColor: '#FF4500',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },
  burningGlow: {
    position: 'absolute',
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 69, 0, 0.3)',
    borderWidth: 2,
    borderColor: '#FF4500',
    shadowColor: '#FF4500',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 15,
  },
  // 死亡詛咒效果
  deathCurseEffect: {
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  deathIcon: {
    fontSize: 30,
    zIndex: 10,
    textShadowColor: '#8A2BE2',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },
  deathGlow: {
    position: 'absolute',
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(138, 43, 226, 0.3)',
    borderWidth: 2,
    borderColor: '#8A2BE2',
    shadowColor: '#8A2BE2',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 15,
  },
  // 持續時間文字樣式
  durationText: {
    position: 'absolute',
    top: -5,
    right: -5,
    fontSize: 12,
    fontWeight: 'bold',
    color: '#FFFFFF',
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    borderRadius: 10,
    paddingHorizontal: 4,
    paddingVertical: 2,
    minWidth: 20,
    textAlign: 'center',
    borderWidth: 1,
    borderColor: '#FFFFFF',
  },
});

export default PieceManager;
