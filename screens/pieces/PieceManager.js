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
import BerserkerPiece from './BerserkerPiece';
import BishopPiece from './BishopPiece';
import RangerPiece from './RangerPiece';
import DragonclawDuelistPiece from './DragonclawDuelistPiece';
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

// 牆壁棋子組件
const WallPiece = ({ isSelected, isHighlighted, isSkillTarget, currentTurn = 0, pieceStates }) => {
  // 計算剩餘回合數
  let remainingTurns = 0;
  if (pieceStates && pieceStates.endTurn) {
    remainingTurns = Math.max(0, pieceStates.endTurn - currentTurn);
  }
  
  return (
    <View style={[
      styles.wallPiece,
      isSelected && styles.selectedPiece,
      isHighlighted && styles.highlightedPiece,
      isSkillTarget && styles.skillTargetPiece
    ]}>
      <Text style={styles.wallIcon}>🧱</Text>
      {remainingTurns > 0 && (
        <Text style={styles.durationText}>{remainingTurns}</Text>
      )}
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
      case 'S': // 皇家護衛
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
      case 'BR': // 血誓魔徒
        return <BerserkerPiece isSelected={isSelected} isHighlighted={isHighlighted} isSkillTarget={isSkillTarget} />;
      case 'RG': // 蒼林遊狩者
        return <RangerPiece isSelected={isSelected} isHighlighted={isHighlighted} isSkillTarget={isSkillTarget} />;
      case 'DD': // 龍爪舞者
        return <DragonclawDuelistPiece isSelected={isSelected} isHighlighted={isHighlighted} isSkillTarget={isSkillTarget} />;
      case 'BP': // 影耀雙主教
        // 從skillEffects中獲取形態信息（如果有的話）
        const bishopForm = skillEffects?.bishopForm || 'radiant'; // 默認光耀形態
        return <BishopPiece isSelected={isSelected} isHighlighted={isHighlighted} isSkillTarget={isSkillTarget} bishopForm={bishopForm} />;
      case 'WALL': // 防禦牆
        return <WallPiece isSelected={isSelected} isHighlighted={isHighlighted} isSkillTarget={isSkillTarget} currentTurn={currentTurn} pieceStates={skillEffects} />;
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
            {buff.type === 'swift_shadow' && (
              <View style={styles.swiftShadowEffect}>
                <Text style={styles.swiftShadowIcon}>💨</Text>
                <View style={styles.swiftShadowGlow} />
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
            {buff.type === 'sleepy_aura' && (
              <View style={styles.sleepyAuraEffect}>
                <Text style={styles.sleepyAuraIcon}>😴</Text>
                <View style={styles.sleepyAuraGlow} />
                <Text style={styles.durationText}>{remainingTurns}</Text>
              </View>
            )}
            {buff.type === 'loyal_guardian' && (
              <View style={styles.loyalGuardianEffect}>
                <Text style={styles.loyalGuardianIcon}>🐾</Text>
                <View style={styles.loyalGuardianGlow} />
                <Text style={styles.durationText}>{remainingTurns}</Text>
              </View>
            )}
            {buff.type === 'charge_order' && (
              <View style={styles.chargeOrderEffect}>
                <Text style={styles.chargeOrderIcon}>📜</Text>
                <View style={styles.chargeOrderGlow} />
                <Text style={styles.durationText}>{remainingTurns}</Text>
              </View>
            )}
            {buff.type === 'honor_blood' && (
              <View style={styles.honorBloodEffect}>
                <Text style={styles.honorBloodIcon}>🩸</Text>
                <View style={styles.honorBloodGlow} />
                <Text style={styles.durationText}>{remainingTurns}</Text>
              </View>
            )}
            {buff.type === 'hail_storm' && (
              <View style={styles.hailStormEffect}>
                <Text style={styles.hailStormIcon}>❄️</Text>
                <View style={styles.hailStormGlow} />
                <Text style={styles.durationText}>{remainingTurns}</Text>
              </View>
            )}
            {buff.type === 'lightning_bolt' && (
              <View style={styles.lightningBoltEffect}>
                <Text style={styles.lightningBoltIcon}>⚡</Text>
                <View style={styles.lightningBoltGlow} />
                <Text style={styles.durationText}>{remainingTurns}</Text>
              </View>
            )}
            {buff.type === 'draw_sword_left' && (
              <View style={styles.drawSwordLeftEffect}>
                <Text style={styles.drawSwordLeftIcon}>🔪</Text>
                <View style={styles.drawSwordLeftGlow} />
                <Text style={styles.durationText}>{remainingTurns}</Text>
              </View>
            )}
            {buff.type === 'draw_sword_center' && (
              <View style={styles.drawSwordCenterEffect}>
                <Text style={styles.drawSwordCenterIcon}>🗡️</Text>
                <View style={styles.drawSwordCenterGlow} />
                <Text style={styles.durationText}>{remainingTurns}</Text>
              </View>
            )}
            {buff.type === 'draw_sword_right' && (
              <View style={styles.drawSwordRightEffect}>
                <Text style={styles.drawSwordRightIcon}>⚔️</Text>
                <View style={styles.drawSwordRightGlow} />
                <Text style={styles.durationText}>{remainingTurns}</Text>
              </View>
            )}
            {buff.type === 'charge_assault' && (
              <View style={styles.chargeAssaultEffect}>
                <Text style={styles.chargeAssaultIcon}>🐎</Text>
                <View style={styles.chargeAssaultGlow} />
                <Text style={styles.durationText}>{remainingTurns}</Text>
              </View>
            )}
            {buff.type === 'shell_defense' && (
              <View style={styles.shellDefenseEffect}>
                <Text style={styles.shellDefenseIcon}>🪨</Text>
                <View style={styles.shellDefenseGlow} />
                <Text style={styles.durationText}>{remainingTurns}</Text>
              </View>
            )}
            {buff.type === 'glory_strike' && (
              <View style={styles.gloryStrikeEffect}>
                <Text style={styles.gloryStrikeIcon}>✨</Text>
                <View style={styles.gloryStrikeGlow} />
                <Text style={styles.durationText}>{remainingTurns}</Text>
              </View>
            )}
            {buff.type === 'crushing_armor' && (
              <View style={styles.crushingArmorEffect}>
                <Text style={styles.crushingArmorIcon}>💥</Text>
                <View style={styles.crushingArmorGlow} />
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
            {debuff.type === 'sleepy_aura' && (
              <View style={styles.sleepyAuraDebuffEffect}>
                <Text style={styles.sleepyAuraDebuffIcon}>😴</Text>
                <View style={styles.sleepyAuraDebuffGlow} />
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
  // 疾行遁影效果
  swiftShadowEffect: {
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  swiftShadowIcon: {
    fontSize: 30,
    zIndex: 10,
    textShadowColor: '#4A4A4A',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },
  swiftShadowGlow: {
    position: 'absolute',
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(74, 74, 74, 0.3)',
    borderWidth: 2,
    borderColor: '#4A4A4A',
    shadowColor: '#4A4A4A',
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
  // 安眠氣息效果（增益）
  sleepyAuraEffect: {
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sleepyAuraIcon: {
    fontSize: 30,
    zIndex: 10,
    textShadowColor: '#9370DB',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },
  sleepyAuraGlow: {
    position: 'absolute',
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(147, 112, 219, 0.3)',
    borderWidth: 2,
    borderColor: '#9370DB',
    shadowColor: '#9370DB',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 15,
  },
  // 安眠氣息效果（減益）
  sleepyAuraDebuffEffect: {
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sleepyAuraDebuffIcon: {
    fontSize: 30,
    zIndex: 10,
    textShadowColor: '#8A2BE2',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },
  sleepyAuraDebuffGlow: {
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
  // 忠犬守護效果
  loyalGuardianEffect: {
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loyalGuardianIcon: {
    fontSize: 30,
    zIndex: 10,
    textShadowColor: '#FFD700',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },
  loyalGuardianGlow: {
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
  // 衝鋒指令效果
  chargeOrderEffect: {
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  chargeOrderIcon: {
    fontSize: 30,
    zIndex: 10,
    textShadowColor: '#00BFFF',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },
  chargeOrderGlow: {
    position: 'absolute',
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(0, 191, 255, 0.3)',
    borderWidth: 2,
    borderColor: '#00BFFF',
    shadowColor: '#00BFFF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 15,
  },
  // 榮血效果
  honorBloodEffect: {
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  honorBloodIcon: {
    fontSize: 30,
    zIndex: 10,
    textShadowColor: '#DC143C',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },
  honorBloodGlow: {
    position: 'absolute',
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(220, 20, 60, 0.3)',
    borderWidth: 2,
    borderColor: '#DC143C',
    shadowColor: '#DC143C',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 15,
  },
  // 冰雹術效果
  hailStormEffect: {
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  hailStormIcon: {
    fontSize: 30,
    zIndex: 10,
    textShadowColor: '#87CEEB',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },
  hailStormGlow: {
    position: 'absolute',
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(135, 206, 235, 0.3)',
    borderWidth: 2,
    borderColor: '#87CEEB',
    shadowColor: '#87CEEB',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 15,
  },
  // 落雷術效果
  lightningBoltEffect: {
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  lightningBoltIcon: {
    fontSize: 30,
    zIndex: 10,
    textShadowColor: '#9B59B6',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },
  lightningBoltGlow: {
    position: 'absolute',
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(155, 89, 182, 0.3)',
    borderWidth: 2,
    borderColor: '#9B59B6',
    shadowColor: '#9B59B6',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 15,
  },
  // 拔刀斬左效果
  drawSwordLeftEffect: {
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  drawSwordLeftIcon: {
    fontSize: 30,
    zIndex: 10,
    textShadowColor: '#FF8C00',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },
  drawSwordLeftGlow: {
    position: 'absolute',
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 140, 0, 0.3)',
    borderWidth: 2,
    borderColor: '#FF8C00',
    shadowColor: '#FF8C00',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 15,
  },
  // 拔刀斬中效果
  drawSwordCenterEffect: {
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  drawSwordCenterIcon: {
    fontSize: 30,
    zIndex: 10,
    textShadowColor: '#FF8C00',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },
  drawSwordCenterGlow: {
    position: 'absolute',
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 140, 0, 0.3)',
    borderWidth: 2,
    borderColor: '#FF8C00',
    shadowColor: '#FF8C00',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 15,
  },
  // 拔刀斬右效果
  drawSwordRightEffect: {
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  drawSwordRightIcon: {
    fontSize: 30,
    zIndex: 10,
    textShadowColor: '#FF8C00',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },
  drawSwordRightGlow: {
    position: 'absolute',
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 140, 0, 0.3)',
    borderWidth: 2,
    borderColor: '#FF8C00',
    shadowColor: '#FF8C00',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 15,
  },
  // 衝鋒突擊效果
  chargeAssaultEffect: {
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  chargeAssaultIcon: {
    fontSize: 30,
    zIndex: 10,
    textShadowColor: '#FF6347',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },
  chargeAssaultGlow: {
    position: 'absolute',
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 99, 71, 0.3)',
    borderWidth: 2,
    borderColor: '#FF6347',
    shadowColor: '#FF6347',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 15,
  },
  // 堅殼防禦效果
  shellDefenseEffect: {
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  shellDefenseIcon: {
    fontSize: 30,
    zIndex: 10,
    textShadowColor: '#8B4513',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },
  shellDefenseGlow: {
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
  // 光耀斬擊效果
  gloryStrikeEffect: {
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  gloryStrikeIcon: {
    fontSize: 30,
    zIndex: 10,
    textShadowColor: '#FFD700',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },
  gloryStrikeGlow: {
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
  // 沉痛破甲效果
  crushingArmorEffect: {
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  crushingArmorIcon: {
    fontSize: 30,
    zIndex: 10,
    textShadowColor: '#8B4513',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },
  crushingArmorGlow: {
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
  // 牆壁棋子樣式
  wallPiece: {
    width: CELL_SIZE,
    height: CELL_SIZE,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#654321',
    shadowColor: '#8B4513',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.8,
    shadowRadius: 4,
    elevation: 5,
  },
  wallIcon: {
    fontSize: 24,
    marginBottom: 2,
  },
  wallText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textShadowColor: '#000000',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
});

export default PieceManager;
