import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { CardSystem, SKILL_CARDS } from './CardSystem';

// 技能卡牌系統使用示例
export const SkillCardExample = () => {
  const [playerHand, setPlayerHand] = useState([
    // 只使用技能卡牌
    SKILL_CARDS.HOLY_SHIELD,
    SKILL_CARDS.SPIKED_ARMOR,
    SKILL_CARDS.BURNING_ARROW,
    SKILL_CARDS.LIGHTNING_BOLT,
    SKILL_CARDS.HAIL_STORM,
    SKILL_CARDS.SHADOW_CLOAK,
    SKILL_CARDS.DEATH_CURSE,
  ]);
  
  const [enemyHand, setEnemyHand] = useState([]);
  const [playerDeck, setPlayerDeck] = useState([]);
  const [enemyDeck, setEnemyDeck] = useState([]);
  const [selectedCard, setSelectedCard] = useState(null);
  const [actionPoints] = useState({ current: 10, max: 10 });
  const [currentPlayer] = useState('human');

  const handlePlayCard = (card) => {
    console.log('打出卡牌:', card);
    setSelectedCard(card);
  };

  const handleRemoveCard = (card) => {
    setPlayerHand(prev => prev.filter(c => c.id !== card.id));
    setSelectedCard(null);
  };

  const handleDrawCard = (player) => {
    console.log('抽卡:', player);
  };

  const handleEndTurn = () => {
    console.log('結束回合');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>技能卡牌系統示例</Text>
      
      <View style={styles.cardList}>
        <Text style={styles.sectionTitle}>可用的技能卡牌：</Text>
        {Object.values(SKILL_CARDS).map((skill) => (
          <TouchableOpacity
            key={skill.id}
            style={[styles.skillCardPreview, { backgroundColor: skill.color }]}
            onPress={() => handlePlayCard(skill)}
          >
            <Text style={styles.skillIcon}>{skill.icon}</Text>
            <Text style={styles.skillName}>{skill.name}</Text>
            <Text style={styles.skillCost}>消耗: {skill.cost}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <CardSystem
        playerHand={playerHand}
        enemyHand={enemyHand}
        playerDeck={playerDeck}
        enemyDeck={enemyDeck}
        onPlayCard={handlePlayCard}
        onRemoveCard={handleRemoveCard}
        onDrawCard={handleDrawCard}
        selectedCard={selectedCard}
        onEndTurn={handleEndTurn}
        currentPlayer={currentPlayer}
        actionPoints={actionPoints}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a1a',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 20,
  },
  cardList: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFD700',
    marginBottom: 10,
  },
  skillCardPreview: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    marginVertical: 5,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  skillIcon: {
    fontSize: 24,
    marginRight: 10,
  },
  skillName: {
    flex: 1,
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  skillCost: {
    fontSize: 14,
    color: '#FFD700',
    fontWeight: 'bold',
  },
});

export default SkillCardExample;
