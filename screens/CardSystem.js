import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  PanResponder,
  Animated,
} from 'react-native';

const { width: screenWidth } = Dimensions.get('window');

// 技能卡牌類型定義
export const SKILL_CARDS = {
  // 基礎型近戰單位共用卡 - 需要基礎型近戰棋子
  HOLY_SHIELD: {
    id: 'HOLY_SHIELD',
    name: '聖盾術',
    description: '抵擋下一次所受傷害',
    cost: 2,
    duration: 1,
    restriction: '不可與其他護盾技能同回合使用',
    type: 'basic_melee_shared',
    requiredPieces: ['S', 'SM', 'SD', 'CC'], // 需要士兵、太刀武士、睏睏狗或食人螃蟹
    color: '#FFD700',
    icon: '🛡️',
    image: 'shield'
  },
  SPIKED_ARMOR: {
    id: 'SPIKED_ARMOR',
    name: '尖刺戰甲',
    description: '下回合若被近戰攻擊，反彈同等傷害',
    cost: 2,
    duration: 1,
    restriction: '僅對近戰攻擊生效',
    type: 'basic_melee_shared',
    requiredPieces: ['S', 'SM', 'SD', 'CC'], // 需要士兵、太刀武士、睏睏狗或食人螃蟹
    color: '#8B4513',
    icon: '⚔️',
    image: 'armor'
  },
  // 遠程單位專屬
  BURNING_ARROW: {
    id: 'BURNING_ARROW',
    name: '燃燒箭',
    description: '造成傷害後，目標於下一回合再失去50點生命',
    cost: 3,
    duration: 2,
    restriction: '射程與普通攻擊一致',
    type: 'ranged_exclusive',
    requiredPieces: ['A', 'CB'], // 需要弓箭手或弩手
    color: '#FF4500',
    icon: '🔥',
    image: 'burning_arrow'
  },
  // 魔法師專屬
  LIGHTNING_BOLT: {
    id: 'LIGHTNING_BOLT',
    name: '落雷術',
    description: '以攻擊格為中心，額外對前後格造成同等傷害',
    cost: 3,
    duration: 0, // 即時
    restriction: '需指定攻擊格',
    type: 'mage_exclusive',
    requiredPieces: ['M'], // 需要魔法師
    color: '#9B59B6',
    icon: '⚡',
    image: 'lightning'
  },
  HAIL_STORM: {
    id: 'HAIL_STORM',
    name: '冰雹術',
    description: '以攻擊格為中心，額外對左右格造成同等傷害',
    cost: 3,
    duration: 0, // 即時
    restriction: '需指定攻擊格',
    type: 'mage_exclusive',
    requiredPieces: ['M'], // 需要魔法師
    color: '#87CEEB',
    icon: '❄️',
    image: 'hail'
  },
  // 刺客專屬
  SHADOW_CLOAK: {
    id: 'SHADOW_CLOAK',
    name: '暗影披風',
    description: '隱身一回合，不可被指定為攻擊或技能目標',
    cost: 4,
    duration: 1,
    restriction: '',
    type: 'assassin_exclusive',
    requiredPieces: ['AS'], // 需要刺客
    color: '#2C2C2C',
    icon: '👤',
    image: 'shadow'
  },
  // 心靈控制者專屬
  DEATH_CURSE: {
    id: 'DEATH_CURSE',
    name: '死亡詛咒',
    description: '指定一名基礎單位，該單位在下一回合結束時死亡',
    cost: 5,
    duration: 1, // 1回合延遲
    restriction: '不可對英雄或主堡使用',
    type: 'mind_controller_exclusive',
    requiredPieces: ['MT'], // 需要心智扭曲者
    color: '#8A2BE2',
    icon: '💀',
    image: 'curse'
  },
  // 騎士專屬
  CHARGE_ATTACK: {
    id: 'CHARGE_ATTACK',
    name: '衝鋒攻擊',
    description: '騎士可以移動到敵方棋子位置並造成額外傷害',
    cost: 3,
    duration: 0, // 即時
    restriction: '只能對敵方棋子使用',
    type: 'knight_exclusive',
    requiredPieces: ['K'], // 需要騎士
    color: '#2F4F4F',
    icon: '🐎',
    image: 'charge'
  },
  // 牧師專屬
  HEALING_PRAYER: {
    id: 'HEALING_PRAYER',
    name: '治療禱告',
    description: '恢復目標棋子100點生命值',
    cost: 2,
    duration: 0, // 即時
    restriction: '只能對己方棋子使用',
    type: 'priest_exclusive',
    requiredPieces: ['P'], // 需要牧師
    color: '#FFFFFF',
    icon: '⛪',
    image: 'heal'
  },
  // 戰爭建築師專屬
  DEFENSIVE_WALL: {
    id: 'DEFENSIVE_WALL',
    name: '防禦牆',
    description: '為己方棋子提供額外防禦力',
    cost: 4,
    duration: 2,
    restriction: '只能對己方棋子使用',
    type: 'architect_exclusive',
    requiredPieces: ['WA'], // 需要戰爭建築師
    color: '#8B4513',
    icon: '🏰',
    image: 'wall'
  }
};

// 卡片類型定義（已刪除，只保留技能卡牌）

// 卡片組件
export const CardComponent = ({ card, onPress, isSelected = false, size = 'normal', onSwipeUp, onDrag, onDragEnd, isDragging = false }) => {
  const cardSize = size === 'small' ? 40 : size === 'large' ? 80 : 50;
  const fontSize = size === 'small' ? 8 : size === 'large' ? 12 : 9;
  
  // 選中時放大效果 - 2.5倍大小
  const scale = isSelected ? 2.5 : 1;
  const zIndex = isSelected ? 20 : 1;
  
  // 所有卡牌都是技能卡
  const isSkillCard = true;
  
  // 拖曳相關的動畫值 - 使用 useRef 避免重新創建
  const pan = useRef(new Animated.ValueXY()).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;
  
  // 獲取技能卡在數組中的索引
  const getCardIndex = () => {
    const allSkillCards = Object.values(SKILL_CARDS);
    return allSkillCards.findIndex(c => c.id === card.id) + 1;
  };

  // 處理拖曳手勢
  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true, // 攔截觸摸事件
    onMoveShouldSetPanResponder: (evt, gestureState) => {
      // 如果移動距離超過10px，開始拖曳
      return Math.abs(gestureState.dx) > 10 || Math.abs(gestureState.dy) > 10;
    },
    onPanResponderGrant: () => {
      // 只有在沒有被選中時才應用拖曳縮放效果
      if (!isSelected) {
        Animated.spring(scaleAnim, {
          toValue: 1.2,
          useNativeDriver: true,
        }).start();
      }
      if (onDrag) onDrag(card);
    },
    onPanResponderMove: (evt, gestureState) => {
      // 更新卡片位置
      pan.setValue({ x: gestureState.dx, y: gestureState.dy });
      
      // 向上滑動超過50px時觸發出牌
      if (gestureState.dy < -50 && onSwipeUp) {
        onSwipeUp(card);
      }
    },
    onPanResponderRelease: (evt, gestureState) => {
      // 檢查是否為點擊（移動距離很小）
      const isClick = Math.abs(gestureState.dx) < 10 && Math.abs(gestureState.dy) < 10;
      
      if (isClick) {
        // 如果是點擊，觸發點擊事件
        if (onPress) {
          onPress(card);
        }
      }
      
      // 只有在沒有被選中時才恢復原始大小（避免覆蓋選中效果）
      if (!isSelected) {
        Animated.spring(scaleAnim, {
          toValue: 1,
          useNativeDriver: true,
        }).start();
      }
      
      // 重置位置
      Animated.spring(pan, {
        toValue: { x: 0, y: 0 },
        useNativeDriver: true,
      }).start();
      
      if (onDragEnd) onDragEnd(card, gestureState);
    },
  });

  return (
    <Animated.View
      style={[
        styles.card,
        {
          backgroundColor: '#2C3E50',
          width: cardSize,
          height: cardSize * 1.4,
          borderWidth: isSelected ? 4 : 1,
          borderColor: isSelected ? '#FFD700' : '#333',
          transform: [
            { scale: isSelected ? scale : (isDragging ? scaleAnim : 1) },
            { translateX: pan.x },
            { translateY: pan.y }
          ],
          zIndex: isDragging ? 1000 : zIndex,
        }
      ]}
      {...panResponder.panHandlers}
    >
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        {/* 技能卡顯示圖標 */}
        <Text style={[styles.cardIcon, { fontSize: fontSize * 2, color: card.color }]}>
          {card.icon}
        </Text>
        
        {/* 技能卡顯示消耗 */}
        <Text style={[styles.cardCost, { fontSize: fontSize * 0.8, color: '#FFD700' }]}>
          {card.cost}
        </Text>
        
        {/* 選中時顯示關閉按鈕 */}
        {isSelected && (
          <TouchableOpacity
            style={styles.closeButton}
            onPress={(e) => {
              e.stopPropagation();
              onPress && onPress(null); // 傳入null表示取消選中
            }}
          >
            <Text style={styles.closeButtonText}>✕</Text>
          </TouchableOpacity>
        )}
      </View>
    </Animated.View>
  );
};

// 牌堆組件
export const DeckComponent = ({ count, onPress, isEnemy = false }) => (
  <TouchableOpacity
    style={[styles.deck, { backgroundColor: isEnemy ? '#E74C3C' : '#3498DB' }]}
    onPress={onPress}
    activeOpacity={0.8}
  >
    <View style={styles.deckStack}>
      {isEnemy ? (
        // 敵方牌堆顯示牌背
        <>
          <View style={[styles.deckCard, styles.enemyCardBack, { transform: [{ rotate: '2deg' }] }]} />
          <View style={[styles.deckCard, styles.enemyCardBack, { transform: [{ rotate: '-1deg' }] }]} />
          <View style={[styles.deckCard, styles.enemyCardBack, { transform: [{ rotate: '1deg' }] }]} />
        </>
      ) : (
        // 玩家牌堆顯示正常卡片
        <>
          <View style={[styles.deckCard, { transform: [{ rotate: '2deg' }] }]} />
          <View style={[styles.deckCard, { transform: [{ rotate: '-1deg' }] }]} />
          <View style={[styles.deckCard, { transform: [{ rotate: '1deg' }] }]} />
        </>
      )}
    </View>
    <Text style={styles.deckCount}>{count}</Text>
  </TouchableOpacity>
);

// 手牌區域組件
export const HandArea = ({ cards, onCardPress, selectedCard, isEnemy = false, onSwipeUp, onDrag, onDragEnd, draggingCard }) => {
  // 限制最多5張手牌
  const displayCards = cards.slice(0, 5);
  
  return (
    <View style={[styles.handArea, { backgroundColor: isEnemy ? 'rgba(231, 76, 60, 0.1)' : 'rgba(52, 152, 219, 0.1)' }]}>
      <Text style={styles.handLabel}>{isEnemy ? '敵方手牌' : '我方手牌'}</Text>
      <View style={styles.handCards}>
        {displayCards.map((card, index) => (
          <View key={`${isEnemy ? 'enemy' : 'player'}-hand-${card.id}-${index}`} style={styles.cardWrapper}>
            {isEnemy ? (
              // 敵方手牌顯示牌背
              <View style={[styles.enemyCardBack, { width: 40, height: 60 }]} />
            ) : (
              // 玩家手牌顯示正常卡片
              <CardComponent
                card={card}
                onPress={onCardPress}
                isSelected={false} // 手牌區域不顯示選中狀態
                size="normal"
                onSwipeUp={onSwipeUp}
                onDrag={onDrag}
                onDragEnd={onDragEnd}
                isDragging={draggingCard && draggingCard.id === card.id}
              />
            )}
          </View>
        ))}
        {/* 如果手牌不足5張，顯示空位 */}
        {Array.from({ length: 5 - displayCards.length }).map((_, index) => (
          <View key={`empty-${index}`} style={styles.emptyCardSlot} />
        ))}
      </View>
    </View>
  );
};

// 卡牌系統主組件
export const CardSystem = ({ 
  playerHand, 
  enemyHand, 
  playerDeck, 
  enemyDeck, 
  onPlayCard, 
  onDrawCard, 
  selectedCard, 
  onRemoveCard, // 新增：用於移除手牌的函數
  onEndTurn, // 新增：結束回合的函數
  currentPlayer, // 新增：當前玩家
  aiPlayedCard, // 新增：AI出的牌
  showAiPlayedCard, // 新增：是否顯示AI出牌動畫
  actionPoints // 新增：行動點
}) => {
  // 拖曳狀態
  const [draggingCard, setDraggingCard] = useState(null);
  const [playedCard, setPlayedCard] = useState(null);
  const [showPlayedCard, setShowPlayedCard] = useState(false);
  
  // 處理向上滑動出牌
  const handleSwipeUp = (card) => {
    if (card) {
      playCardAction(card);
    }
  };
  
  // 處理拖曳開始
  const handleDrag = (card) => {
    setDraggingCard(card);
  };
  
  // 處理拖曳結束
  const handleDragEnd = (card, gestureState) => {
    setDraggingCard(null);
    
    // 檢查是否拖曳到棋盤區域（螢幕中央）
    const { dx, dy } = gestureState;
    const screenHeight = Dimensions.get('window').height;
    const screenWidth = Dimensions.get('window').width;
    
    console.log(`拖曳結束 - 卡片: ${card ? card.name : 'null'}, dx: ${dx}, dy: ${dy}, 螢幕寬度: ${screenWidth}`);
    
    // 如果拖曳到螢幕中央區域（棋盤區域），則出牌
    // 放寬條件：水平偏移小於螢幕寬度的40%，垂直向上移動超過50px
    if (Math.abs(dx) < screenWidth * 0.4 && dy < -50) {
      console.log(`符合出牌條件 - 卡片: ${card ? card.name : 'N/A'}`);
      if (card) {
        playCardAction(card);
      } else {
        console.log('卡片無效，無法出牌');
      }
    } else {
      console.log('不符合出牌條件');
    }
  };
  
  // 選中卡片函數（用於查看卡片）
  const selectCard = (card) => {
    // 直接調用父組件的選中邏輯
    if (onPlayCard) {
      onPlayCard(card);
    }
  };

  // 出牌函數（用於實際出牌）
  const playCardAction = (card) => {
    // 檢查卡片是否有效
    if (!card) {
      console.log('無效的卡片，無法出牌');
      return;
    }
    
    // 顯示打出牌的動畫
    setPlayedCard(card);
    setShowPlayedCard(true);
    
    // 1秒後隱藏動畫並執行出牌邏輯
    setTimeout(() => {
      setShowPlayedCard(false);
      // 調用父組件的出牌邏輯
      onPlayCard(card);
      // 移除手牌（在動畫完成後）
      if (onRemoveCard) {
        onRemoveCard(card);
      }
      // 再過0.5秒後清除卡片狀態
      setTimeout(() => {
        setPlayedCard(null);
      }, 500);
    }, 1000);
  };
  // 獲取選中卡片的索引
  const getSelectedCardIndex = () => {
    if (!selectedCard) return -1;
    return playerHand.findIndex(card => card.id === selectedCard.id);
  };

  const selectedCardIndex = getSelectedCardIndex();
  
  // 所有卡片都是技能卡
  const isSelectedSkillCard = selectedCard && selectedCard.type;

  // 根據卡片索引返回對應的定位樣式
  const getCardPosition = (index) => {
    const positions = [
      { top: '75%', left: '15%' }, // 第1張卡片
      { top: '75%', left: '30%' }, // 第2張卡片
      { top: '75%', left: '45%' }, // 第3張卡片
      { top: '75%', left: '60%' }, // 第4張卡片
      { top: '75%', left: '75%' }, // 第5張卡片
    ];
    return positions[index] || { top: '75%', left: '50%' };
  };

  return (
    <>
      <View style={styles.cardSystemContainer}>
        {/* 敵方區域 - 上方 */}
        <View style={styles.enemyArea}>
          {/* 敵方牌堆 - 左上方 */}
          <DeckComponent 
            count={enemyDeck.length} 
            onPress={() => onDrawCard('ai')} 
            isEnemy={true}
          />
          
          {/* 敵方手牌 - 上方中央 */}
          <HandArea 
            cards={enemyHand}
            isEnemy={true}
          />
        </View>


        {/* 玩家區域 - 下方 */}
        <View style={styles.playerArea}>
          {/* 玩家手牌 - 下方中央 */}
          <HandArea 
            cards={playerHand}
            onCardPress={selectCard}
            selectedCard={selectedCard}
            isEnemy={false}
            onSwipeUp={playCardAction}
            onDrag={handleDrag}
            onDragEnd={handleDragEnd}
            draggingCard={draggingCard}
          />

          {/* 玩家牌堆 - 右下方 */}
          <View style={styles.playerDeckContainer}>
            <DeckComponent 
              count={playerDeck.length} 
              onPress={() => onDrawCard('human')} 
              isEnemy={false}
            />
            
            {/* 行動點顯示 - 在玩家牌堆下方 */}
            {currentPlayer === 'human' && actionPoints && (
              <View style={styles.actionPointsDisplay}>
                <Text style={styles.actionPointsLabel}>⚡ 行動點</Text>
                <Text style={styles.actionPointsValue}>{actionPoints.current}/{actionPoints.max}</Text>
              </View>
            )}
          </View>
        </View>

        {/* 結束回合按鈕 - 只在玩家回合顯示 */}
        {currentPlayer === 'human' && (
          <TouchableOpacity 
            style={styles.endTurnButton}
            onPress={onEndTurn}
            activeOpacity={0.8}
          >
            <Text style={styles.endTurnButtonText}>結束回合</Text>
          </TouchableOpacity>
        )}
      </View>
      
      {/* 選中的卡片 - 固定定位，根據卡片索引 */}
      {selectedCard && selectedCardIndex >= 0 && (
        <View style={[styles.selectedCardOverlay, getCardPosition(selectedCardIndex)]}>
          <CardComponent
            card={selectedCard}
            onPress={selectCard}
            isSelected={true}
            size="normal"
          />
          {/* 技能卡詳細資訊 */}
          {isSelectedSkillCard && (
            <View style={styles.skillCardDetails}>
              <Text style={styles.skillCardName}>{selectedCard.name}</Text>
              <Text style={styles.skillCardDescription}>{selectedCard.description}</Text>
              <Text style={styles.skillCardCost}>消耗: {selectedCard.cost}</Text>
              {selectedCard.duration > 0 && (
                <Text style={styles.skillCardDuration}>持續: {selectedCard.duration}回合</Text>
              )}
              {selectedCard.restriction && (
                <Text style={styles.skillCardRestriction}>限制: {selectedCard.restriction}</Text>
              )}
            </View>
          )}
        </View>
      )}
      
      {/* 打出牌的中央顯示 */}
      {showPlayedCard && playedCard && (
        <View style={styles.playedCardOverlay}>
          <Animated.View style={styles.playedCardContainer}>
            <CardComponent
              card={playedCard}
              size="large"
              isSelected={false}
            />
            <Text style={styles.playedCardText}>打出 {playedCard.name}!</Text>
          </Animated.View>
        </View>
      )}
      
      {/* AI出牌的中央顯示 */}
      {showAiPlayedCard && aiPlayedCard && (
        <View style={styles.playedCardOverlay}>
          <Animated.View style={styles.playedCardContainer}>
            <CardComponent
              card={aiPlayedCard}
              size="large"
              isSelected={false}
            />
            <Text style={styles.playedCardText}>AI打出 {aiPlayedCard.name}!</Text>
          </Animated.View>
        </View>
      )}
    </>
  );
};

const styles = StyleSheet.create({
  cardSystemContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1,
    overflow: 'visible',
    elevation: 0, // Android 上確保不會限制子元素
    pointerEvents: 'box-none', // 允許點擊事件穿透到下層
  },
  // 卡片樣式
  card: {
    borderRadius: 12,
    padding: 8,
    margin: 4,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
    position: 'relative',
  },
  cardCost: {
    color: '#FFD700',
    fontWeight: 'bold',
    backgroundColor: 'rgba(0,0,0,0.8)',
    borderRadius: 12,
    paddingHorizontal: 6,
    paddingVertical: 3,
  },
  cardImage: {
    marginBottom: 8,
  },
  cardName: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 4,
  },
  cardStats: {
    position: 'absolute',
    bottom: 4,
    right: 4,
    flexDirection: 'row',
  },
  cardAttack: {
    color: '#FF6B6B',
    fontWeight: 'bold',
    backgroundColor: 'rgba(0,0,0,0.8)',
    borderRadius: 10,
    paddingHorizontal: 4,
    paddingVertical: 2,
    marginRight: 2,
  },
  cardHealth: {
    color: '#4ECDC4',
    fontWeight: 'bold',
    backgroundColor: 'rgba(0,0,0,0.8)',
    borderRadius: 10,
    paddingHorizontal: 4,
    paddingVertical: 2,
  },
  closeButton: {
    position: 'absolute',
    top: -8,
    right: -12,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#E74C3C',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#FFFFFF',
  },
  closeButtonText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: 'bold',
    textAlign: 'center',
    lineHeight: 10,
  },
  selectedCardContainer: {
    position: 'absolute',
    top: -120, // 在原本卡片上方
    left: -25, // 稍微向左偏移以居中
    zIndex: 20,
  },
  cardWrapper: {
    position: 'relative',
  },
  selectedCardAbove: {
    position: 'absolute',
    top: -120, // 在原始卡片上方
    left: 0,
    zIndex: 100, // 最高層級
  },
  selectedCardOverlay: {
    position: 'absolute',
    zIndex: 1000, // 最高層級，確保在棋盤上方
  },
  // 牌堆樣式
  deck: {
    width: 60,
    height: 70,
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 6,
  },
  deckStack: {
    position: 'relative',
    width: 35,
    height: 50,
  },
  deckCard: {
    position: 'absolute',
    width: 35,
    height: 50,
    backgroundColor: '#2C3E50',
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#34495E',
  },
  // 敵方牌背樣式
  enemyCardBack: {
    backgroundColor: '#2C3E50',
    borderWidth: 2,
    borderColor: '#E74C3C',
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
    margin: 2,
  },
  // 牌背文字樣式
  cardBackText: {
    color: '#E74C3C',
    fontSize: 24,
    fontWeight: 'bold',
  },
  // 卡片數字樣式
  cardNumber: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  // 技能卡圖標樣式
  cardIcon: {
    fontWeight: 'bold',
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  deckCount: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 5,
  },
  // 敵方區域樣式
  enemyArea: {
    position: 'absolute',
    top: 140,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    height: 80,
  },
  // 玩家區域樣式
  playerArea: {
    position: 'absolute',
    bottom: 100,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    height: 80,
  },
  // 手牌區域樣式
  handArea: {
    flex: 1,
    alignItems: 'center',
    marginHorizontal: 5,
    padding: 5,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    height: 70,
    position: 'relative',
    overflow: 'visible', // 允許選中的卡片超出邊界
  },
  handLabel: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: 'bold',
    position: 'absolute',
    top: -20,
    left: 0,
    right: 0,
    textAlign: 'center',
  },
  handCards: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    flexWrap: 'nowrap',
    height: 50,
    marginTop: 5,
  },
  emptyCardSlot: {
    width: 50,
    height: 60,
    margin: 2,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    borderStyle: 'dashed',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  // 法力水晶樣式
  manaContainer: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    padding: 8,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#9B59B6',
  },
  manaText: {
    color: '#9B59B6',
    fontSize: 16,
    fontWeight: 'bold',
  },
  // 打出牌的中央顯示樣式
  playedCardOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2000,
    pointerEvents: 'box-none', // 允許點擊事件穿透到下層
  },
  playedCardContainer: {
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    padding: 20,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#FFD700',
  },
  playedCardText: {
    color: '#FFD700',
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 15,
    textAlign: 'center',
    textShadowColor: '#000',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  // 結束回合按鈕樣式
  endTurnButton: {
    position: 'absolute',
    bottom: 10,
    left: '50%',
    transform: [{ translateX: -60 }], // 居中對齊
    backgroundColor: '#E74C3C',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    borderWidth: 2,
    borderColor: '#C0392B',
  },
  endTurnButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  // 玩家牌堆容器樣式
  playerDeckContainer: {
    alignItems: 'center',
  },
  // 行動點顯示樣式
  actionPointsDisplay: {
    marginTop: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    alignItems: 'center',
  },
  actionPointsLabel: {
    fontSize: 12,
    color: '#FFFFFF',
    opacity: 0.8,
    marginBottom: 2,
  },
  actionPointsValue: {
    fontSize: 16,
    color: '#FFD700',
    fontWeight: 'bold',
  },
  // 技能卡詳細資訊樣式
  skillCardDetails: {
    position: 'absolute',
    top: -200,
    left: -80,
    width: 160,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    borderRadius: 10,
    padding: 10,
    borderWidth: 2,
    borderColor: '#FFD700',
    zIndex: 1001,
  },
  skillCardName: {
    color: '#FFD700',
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 5,
  },
  skillCardDescription: {
    color: '#FFFFFF',
    fontSize: 10,
    textAlign: 'center',
    marginBottom: 5,
    lineHeight: 14,
  },
  skillCardCost: {
    color: '#FFD700',
    fontSize: 10,
    textAlign: 'center',
    marginBottom: 3,
  },
  skillCardDuration: {
    color: '#87CEEB',
    fontSize: 10,
    textAlign: 'center',
    marginBottom: 3,
  },
  skillCardRestriction: {
    color: '#FF6B6B',
    fontSize: 9,
    textAlign: 'center',
    fontStyle: 'italic',
    lineHeight: 12,
  },
});
