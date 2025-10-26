import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
// 移除MCTS AI導入，改用簡單規則AI
import PieceManager from './pieces/PieceManager';
import { 
  getPossibleMoves, 
  getPossibleAttacks, 
  isValidMove, 
  isValidAttack,
  isAdjacent as rulesIsAdjacent,
  PIECE_TYPES as RULE_PIECE_TYPES,
  getPieceMaxHealth,
  getPieceHealth,
  getPieceAttackPower,
  getPieceSpecialRules,
  getPieceAttackRange,
  getPieceCategory
} from './pieceRules';
import { CardSystem, SKILL_CARDS } from './CardSystem';

const BOARD_SIZE = 8;
const { width: screenWidth, height: screenHeight } = Dimensions.get('window');
const CELL_SIZE = Math.floor((screenWidth - 40) / BOARD_SIZE);

// 座標系統：統一使用0-7座標系統
// 棋盤大小：8x8，座標範圍：row 0-7, col 0-7

// 棋子類型定義（增強3D效果）
const PIECE_TYPES = {
  S: { 
    name: '皇家護衛', 
    color: '#8B4513', // 棕色
    darkColor: '#654321',
    symbol: 'S',
    material: 'bronze',
    category: '基礎型',
    skill: '基礎近戰攻擊，移動範圍小但穩定',
    description: '忠誠的皇家護衛，基礎戰鬥單位，穩定可靠',
  },
  W: { 
    name: '戰士', 
    color: '#FFD700', // 金色
    darkColor: '#B8860B',
    symbol: 'W',
    material: 'gold',
    category: '攻擊型',
    skill: '近戰攻擊，第一次被攻擊不會死亡',
    description: '勇敢的戰士，擁有強大的近戰能力和特殊防護',
  },
  A: { 
    name: '弓箭手', 
    color: '#C0C0C0', // 銀色
    darkColor: '#808080',
    symbol: 'A',
    material: 'silver',
    category: '遠程型',
    skill: '遠程攻擊，移動範圍廣',
    description: '精準的射手，擅長遠距離作戰',
  },
  M: { 
    name: '法師', 
    color: '#8B4513', // 銅色
    darkColor: '#654321',
    symbol: 'M',
    material: 'bronze',
    category: '魔法型',
    skill: '魔法攻擊，特殊能力',
    description: '神秘的魔法師，掌握強大的法術',
  },
  K: { 
    name: '騎士', 
    color: '#2F4F4F', // 深灰色
    darkColor: '#1C1C1C',
    symbol: 'K',
    material: 'steel',
    category: '機動型',
    skill: '高機動性，快速移動',
    description: '敏捷的騎士，擁有出色的機動能力',
  },
  P: { 
    name: '牧師', 
    color: '#FFFFFF', // 白色
    darkColor: '#E0E0E0',
    symbol: 'P',
    material: 'gold',
    category: '支援型',
    skill: '治療與支援單位',
    description: '神聖的牧師，擁有治療和支援能力',
  },
  AS: { 
    name: '刺客', 
    color: '#2C2C2C', // 深灰色
    darkColor: '#1A1A1A',
    symbol: 'AS',
    material: 'obsidian',
    category: '暗殺型',
    skill: '隱身與暗殺單位',
    description: '神秘的刺客，擅長隱身和暗殺',
  },
  MT: { 
    name: '心智扭曲者', 
    color: '#8A2BE2', // 紫色
    darkColor: '#6A1B9A',
    symbol: 'MT',
    material: 'crystal',
    category: '控制型',
    skill: '精神控制單位',
    description: '邪惡的心智扭曲者，能夠控制敵人思想',
  },
  empty: { 
    name: '空', 
    color: 'transparent', 
    symbol: '',
    material: 'none',
  },
};

const ChessBoard3D = ({ onBack, gameMode, playerDeck: initialPlayerDeck }) => {
  // 載入狀態
  const [isLoading, setIsLoading] = useState(true);
  
  // 檢測場上棋子的函數
  const checkInjuredPieces = () => {
    let injuredCount = 0;
    let totalPieces = 0;
    let humanPieces = 0;
    let aiPieces = 0;
    let pieceDetails = [];
    
    for (let row = 0; row < BOARD_SIZE; row++) {
      for (let col = 0; col < BOARD_SIZE; col++) {
        const piece = board[row][col];
        if (piece && piece !== 'empty') {
          totalPieces++;
          const pieceKey = `${row}-${col}`;
          const pieceState = pieceStates[pieceKey];
          const pieceOwner = pieceOwners[pieceKey];
          const maxHealth = getPieceMaxHealth(piece);
          const currentHealth = pieceState?.health || maxHealth;
          
          // 統計玩家和AI的棋子
          if (pieceOwner === 'human') {
            humanPieces++;
          } else if (pieceOwner === 'ai') {
            aiPieces++;
          }
          
          const isInjured = pieceState?.isInjured || (currentHealth < maxHealth);
          if (isInjured) {
            injuredCount++;
          }
          
          pieceDetails.push({
            position: `[${row},${col}]`,
            piece: piece,
            owner: pieceOwner,
            health: `${currentHealth}/${maxHealth}`,
            isInjured: isInjured
          });
        }
      }
    }
    
    
    return { 
      totalPieces, 
      injuredCount, 
      humanPieces, 
      aiPieces,
      healthyPieces: totalPieces - injuredCount
    };
  };
  
  // 添加檢測受傷棋子的按鈕
  const addInjuredCheckButton = () => {
    return (
      <TouchableOpacity
        style={{
          position: 'absolute',
          top: 50,
          right: 10,
          backgroundColor: '#FF6B6B',
          padding: 10,
          borderRadius: 5,
          zIndex: 1000
        }}
        onPress={() => {
          const result = checkInjuredPieces();
          Alert.alert(
            '場上棋子統計',
            `總棋子數: ${result.totalPieces}\n玩家棋子: ${result.humanPieces}\nAI棋子: ${result.aiPieces}\n健康棋子: ${result.healthyPieces}\n受傷棋子: ${result.injuredCount}`,
            [{ text: '確定' }]
          );
        }}
      >
        <Text style={{ color: 'white', fontSize: 12 }}>檢測棋子</Text>
      </TouchableOpacity>
    );
  };
  
  // 防止重複初始化的標誌
  const [isInitialized, setIsInitialized] = useState(false);
  
  // 卡牌系統狀態
  const [playerHand, setPlayerHand] = useState([]);
  const [enemyHand, setEnemyHand] = useState([]);
  const [playerCardDeck, setPlayerCardDeck] = useState([]);
  const [enemyCardDeck, setEnemyCardDeck] = useState([]);
  const [selectedCard, setSelectedCard] = useState(null);
  
  // 行動點系統
  const [actionPoints, setActionPoints] = useState({ 
    current: 100, 
    max: 100 
  });
  
  // AI出牌動畫狀態
  const [aiPlayedCard, setAiPlayedCard] = useState(null);
  const [showAiPlayedCard, setShowAiPlayedCard] = useState(false);
  
  // 技能卡牌使用狀態
  const [pendingSkillCard, setPendingSkillCard] = useState(null);
  const [isSelectingTarget, setIsSelectingTarget] = useState(false);
  const [skillTargets, setSkillTargets] = useState([]);
  const [hasShownSkillError, setHasShownSkillError] = useState(false);
  const [hasConsumedActionPoints, setHasConsumedActionPoints] = useState(false);

  // 當初始棋組改變時更新棋盤上的棋子
  useEffect(() => {
    if (initialPlayerDeck && initialPlayerDeck.pieces && Array.isArray(initialPlayerDeck.pieces) && initialPlayerDeck.pieces.length === 6 && !isInitialized) {
      // 獲取前排和中後排棋子
      const frontRowPieces = initialPlayerDeck.frontRowPieces || initialPlayerDeck.pieces.slice(0, 2);
      const backRowPieces = initialPlayerDeck.backRowPieces || initialPlayerDeck.pieces.slice(2, 6);
      
      // 重新初始化棋盤，使用自定義棋組
      const newBoard = Array(BOARD_SIZE).fill(null).map(() => 
        Array(BOARD_SIZE).fill('empty')
      );
      
      // === 玩家方布局 (第6-7行) ===
      // 分類中後排棋子
      const specialPieces = backRowPieces.filter(piece => getPieceCategory(piece) === 'special');
      const heroPieces = backRowPieces.filter(piece => getPieceCategory(piece) === 'hero');
      const structurePieces = backRowPieces.filter(piece => getPieceCategory(piece) === 'structure');
      
      
      // 前排棋子 (基礎型)：交錯排列填滿整行
      // 第6行：基礎型1和基礎型2交錯排列
      for (let col = 0; col < BOARD_SIZE; col++) {
        if (col % 2 === 0) {
          newBoard[6][col] = frontRowPieces[0] || 'S'; // 偶數列放第1個基礎型
        } else {
          newBoard[6][col] = frontRowPieces[1] || 'SM'; // 奇數列放第2個基礎型
        }
      }
      
      // 第7行：在0,1,2列和5,6,7列放特殊棋子（複製1,2,3列到5,6,7列）
      // 先清空第7行
      for (let col = 0; col < BOARD_SIZE; col++) {
        newBoard[7][col] = 'empty';
      }
      
      // 在0,1,2列放置特殊棋子
      for (let i = 0; i < 3 && i < specialPieces.length; i++) {
        newBoard[7][i] = specialPieces[i];
        console.log(`第7行特殊棋子 ${specialPieces[i]} 放置在 [7,${i}]`);
      }
      
      // 在5,6,7列鏡向排列1,2,3列的棋子（321的順序）
      for (let i = 0; i < 3 && i < specialPieces.length; i++) {
        const mirrorIndex = 2 - i; // 鏡向索引：0->2, 1->1, 2->0
        newBoard[7][i + 5] = specialPieces[mirrorIndex]; // 鏡向排列到5,6,7列
        console.log(`第7行特殊棋子 ${specialPieces[mirrorIndex]} 鏡向排列到 [7,${i + 5}]`);
      }
      
      // 城堡棋子固定放在第7行的位置3
      newBoard[7][3] = 'CASTLE';
      console.log(`城堡棋子固定放置在 [7,3]`);
      
      // 英雄卡放在第7行的位置4
      if (heroPieces.length > 0) {
        newBoard[7][4] = heroPieces[0];
        console.log(`英雄卡 ${heroPieces[0]} 放置在 [7,4]`);
      }
      
      console.log(`前排棋子交錯排列完成：第6行使用 ${frontRowPieces[0] || 'S'} 和 ${frontRowPieces[1] || 'SM'}`);
      
      // 中後排棋子：放在第5行（玩家方後排）
      // 注意：城堡和英雄卡已經移到第7行，第5行現在主要用於其他棋子
      
      // === AI方布局 (第0-1行) ===
      // AI棋子：弓箭手、螃蟹、城堡、心智扭曲者、太刀武士、牧師
      newBoard[0][0] = 'A'; // AI弓箭手（最左邊）
      newBoard[1][2] = 'A'; // AI弓箭手
      newBoard[1][4] = 'CC'; // AI螃蟹
      newBoard[1][5] = 'SM'; // AI太刀武士（在螃蟹右邊）
      newBoard[0][4] = 'P'; // AI牧師（在螃蟹上方）
      newBoard[1][3] = 'CASTLE'; // AI城堡（與玩家城堡相對位置）
      newBoard[0][3] = 'MT'; // AI心智扭曲者（在城堡上方）
      
      
      setBoard(newBoard);
      
      // 重新初始化棋子狀態和歸屬權
      const newPieceStates = {};
      const newPieceOwners = {};
      for (let row = 0; row < BOARD_SIZE; row++) {
        for (let col = 0; col < BOARD_SIZE; col++) {
          const piece = newBoard[row][col];
          if (piece && piece !== 'empty') {
            const pieceKey = `${row}-${col}`;
            // 使用規則中定義的棋子狀態
            // 前排棋子設為滿血
            const fullHealth = getPieceHealth(piece);
            const isFrontRow = row === 6; // 玩家前排
            // 皇家護衛在前排時設為受傷狀態（扣50血）
            const initialHealth = (piece === 'S' && isFrontRow) ? Math.max(1, fullHealth - 50) : fullHealth;
            
  // 調試信息
  if (isFrontRow) {
    console.log(`前排棋子 [${row},${col}] ${piece}: 滿血=${fullHealth}, 初始血量=${initialHealth}`);
  }
  
  // 額外調試：檢查所有第6行的棋子
  if (row === 6) {
    console.log(`第6行棋子檢測: [${row},${col}] ${piece} - 是否為前排: ${isFrontRow}, 初始血量: ${initialHealth}`);
  }
            
            newPieceStates[pieceKey] = {
              hasMoved: false,
              health: initialHealth,
              maxHealth: getPieceMaxHealth(piece),
              attackPower: getPieceAttackPower(piece),
              defense: 25,
              specialAbilityUsed: false,
              isStunned: false,
              isPoisoned: false,
              isInjured: false, // 受傷狀態標記
              buffs: [],
              debuffs: []
            };
            // 設置棋子歸屬權：根據行來判斷（行0-1是AI，行5-7是玩家）
            newPieceOwners[pieceKey] = row <= 1 ? 'ai' : 'human';
          }
        }
      }
      setPieceStates(newPieceStates);
      setPieceOwners(newPieceOwners);
      
      // 設置初始化完成標誌
      setIsInitialized(true);
      
      // 棋盤初始化完成，設置載入完成狀態
      setTimeout(() => {
        setIsLoading(false);
        
        // 遊戲開始時檢測受傷棋子
        setTimeout(() => {
          checkInjuredPieces();
        }, 1000);
      }, 500); // 給一點時間讓動畫完成
    }
  
  }, [initialPlayerDeck]); // 當initialPlayerDeck變化時重新初始化

  // 根據場上棋子生成牌組的函數
  const generateDeckBasedOnPieces = (playerPieces) => {
    const availableCards = [];
    
    // 遍歷所有技能卡牌，只選擇玩家場上有對應棋子的卡牌
    Object.values(SKILL_CARDS).forEach(card => {
      if (!card.requiredPieces || card.requiredPieces.length === 0) {
        // 通用卡牌（不需要特定棋子）
        availableCards.push(card);
      } else {
        // 檢查玩家是否有任何所需的棋子
        const hasRequiredPiece = card.requiredPieces.some(requiredPiece => 
          playerPieces.includes(requiredPiece)
        );
        if (hasRequiredPiece) {
          availableCards.push(card);
        }
      }
    });
    
    console.log('根據場上棋子生成的可用卡牌:', availableCards.map(card => card.name));
    
    // 如果可用卡牌太少，重複使用以確保有足夠的卡牌
    const repeatedCards = [];
    if (availableCards.length > 0) {
      const shuffleCards = [...availableCards].sort(() => Math.random() - 0.5);
      const repeatCount = Math.ceil(30 / availableCards.length); // 確保有足夠的卡牌
      
      for (let i = 0; i < repeatCount; i++) {
        repeatedCards.push(...shuffleCards);
      }
    } else {
      // 如果沒有可用卡牌，使用基本卡牌
      const basicCards = Object.values(SKILL_CARDS).filter(card => 
        card.type === 'basic'
      );
      for (let i = 0; i < 6; i++) {
        repeatedCards.push(...basicCards);
      }
    }
    
    return repeatedCards;
  };

  // 初始化卡牌系統 - 根據場上棋子生成
  useEffect(() => {
    // 只有在棋盤初始化完成後才執行牌組初始化
    if (!isInitialized || Object.keys(pieceOwners).length === 0) {
      return;
    }
    
    // 獲取玩家場上的棋子
    const playerPieces = [];
    for (let row = 0; row < BOARD_SIZE; row++) {
      for (let col = 0; col < BOARD_SIZE; col++) {
        const piece = board[row][col];
        const pieceKey = `${row}-${col}`;
        const pieceOwner = pieceOwners[pieceKey];
        
        if (piece !== 'empty' && pieceOwner === 'human') {
          playerPieces.push(piece);
        }
      }
    }
    
    console.log('玩家場上的棋子:', playerPieces);
    
    // 根據玩家棋子生成牌組
    const playerCards = generateDeckBasedOnPieces(playerPieces);
    
    // 為AI生成牌組（使用AI的棋子）
    const aiPieces = [];
    for (let row = 0; row < BOARD_SIZE; row++) {
      for (let col = 0; col < BOARD_SIZE; col++) {
        const piece = board[row][col];
        const pieceKey = `${row}-${col}`;
        const pieceOwner = pieceOwners[pieceKey];
        
        if (piece !== 'empty' && pieceOwner === 'ai') {
          aiPieces.push(piece);
        }
      }
    }
    
    console.log('AI場上的棋子:', aiPieces);
    const aiCards = generateDeckBasedOnPieces(aiPieces);
    
    // 設置牌組和手牌
    setPlayerCardDeck(playerCards.slice(0, 15));
    setEnemyCardDeck(aiCards.slice(0, 15));
    setPlayerHand(playerCards.slice(15, 20));
    setEnemyHand(aiCards.slice(15, 20));
    
    console.log('牌組初始化完成 - 玩家牌組:', playerCards.length, 'AI牌組:', aiCards.length);
  }, [isInitialized, board, pieceOwners]); // 當棋盤初始化完成、棋盤或棋子歸屬權改變時重新初始化

  // 攻擊動畫效果
  const [attackAnimation, setAttackAnimation] = useState(null);
  const [screenShake, setScreenShake] = useState(false);
  
  const performAttackAnimation = (attackerRow, attackerCol, targetRow, targetCol, onComplete) => {
    setAttackAnimation({
      from: { row: attackerRow, col: attackerCol },
      to: { row: targetRow, col: targetCol },
      onComplete
    });
    
    // 添加震動效果
    setScreenShake(true);
    setTimeout(() => setScreenShake(false), 200);
    
    // 動畫持續時間
    setTimeout(() => {
      setAttackAnimation(null);
      if (onComplete) onComplete();
    }, 600); // 600ms 動畫時間，更流暢
  };

  // 檢查玩家是否擁有技能卡牌所需的棋子
  const hasRequiredPieces = (card) => {
    if (!card || !card.requiredPieces) return true;
    
    // 基本卡不需要特定棋子
    if (card.type === 'basic') return true;
    
    // 如果沒有需要特定棋子，直接返回true
    if (card.requiredPieces.length === 0) return true;
    
    // 遍歷棋盤找到玩家的棋子
    const playerPieces = [];
    for (let row = 0; row < BOARD_SIZE; row++) {
      for (let col = 0; col < BOARD_SIZE; col++) {
        const piece = board[row][col];
        const pieceKey = `${row}-${col}`;
        const pieceOwner = pieceOwners[pieceKey];
        
        if (piece !== 'empty' && pieceOwner === 'human') {
          playerPieces.push(piece);
        }
      }
    }
    
    // 檢查是否有任何所需的棋子
    return card.requiredPieces.some(requiredPiece => 
      playerPieces.includes(requiredPiece)
    );
  };

  // 獲取棋子攻擊力（考慮buff效果）
  const getPieceAttackPowerWithBuffs = (pieceType, pieceKey) => {
    let baseAttackPower = getPieceAttackPower(pieceType);
    
    if (pieceStates && pieceKey) {
      const pieceState = pieceStates[pieceKey];
      if (pieceState && pieceState.buffs) {
        // 檢查衝鋒令buff
        const chargeOrderBuff = pieceState.buffs.find(buff => buff.type === 'charge_order');
        if (chargeOrderBuff) {
          baseAttackPower += chargeOrderBuff.attackBonus || 0;
        }
        
        // 檢查榮譽之血buff
        const honorBloodBuff = pieceState.buffs.find(buff => buff.type === 'honor_blood');
        if (honorBloodBuff && honorBloodBuff.triggered) {
          baseAttackPower += honorBloodBuff.attackBonus || 0;
        }
        
        // 檢查拔刀斬buff
        const drawSwordBuff = pieceState.buffs.find(buff => buff.type === 'draw_sword_slash');
        if (drawSwordBuff) {
          baseAttackPower += drawSwordBuff.attackBonus || 0;
        }
      }
    }
    
    return baseAttackPower;
  };

  // 卡牌相關函數 - 處理技能卡牌使用
  const playCard = (card) => {
    if (currentPlayer === 'human') {
      if (card === null) {
        // 取消選中
        setSelectedCard(null);
        setPendingSkillCard(null);
        setIsSelectingTarget(false);
        setSkillTargets([]);
        setHasShownSkillError(false); // 重置錯誤提示狀態
      } else if (selectedCard && selectedCard.id === card.id) {
        // 如果點擊已選中的卡片
        if (selectedCard.type === 'basic') {
          // 基本卡再次點擊直接執行
          applySkillEffect(selectedCard, null, null);
          setSelectedCard(null);
          setPendingSkillCard(null);
          setIsSelectingTarget(false);
          setSkillTargets([]);
          setHasShownSkillError(false);
          setHasConsumedActionPoints(false);
        } else if (isSelectingTarget && pendingSkillCard) {
          // 非基本卡正在選擇目標時，取消選中
          setSelectedCard(null);
          setPendingSkillCard(null);
          setIsSelectingTarget(false);
          setSkillTargets([]);
          setHasShownSkillError(false);
          setHasConsumedActionPoints(false);
        } else {
          // 非基本卡未選擇目標時，取消選中
          setSelectedCard(null);
          setPendingSkillCard(null);
          setIsSelectingTarget(false);
          setSkillTargets([]);
          setHasShownSkillError(false);
          setHasConsumedActionPoints(false);
        }
      } else if (isSelectingTarget && pendingSkillCard) {
        // 如果正在選擇目標，則阻止新卡牌使用但保持當前狀態
        Alert.alert('請先完成當前技能', '請先選擇目標或取消當前技能');
        return; // 阻止繼續執行
      } else {
        // 檢查是否有足夠的行動點
        if (actionPoints.current < card.cost) {
          Alert.alert(
            '無法出牌',
            '行動點不足'
          );
          return;
        }
        
        // 檢查是否擁有所需的棋子
        if (!hasRequiredPieces(card)) {
          // 只在第一次嘗試使用時顯示錯誤提示
          if (!hasShownSkillError) {
            Alert.alert(
              '無法使用技能',
              `使用 ${card.name} 需要擁有對應的棋子：${card.requiredPieces.join(', ')}`
            );
            setHasShownSkillError(true);
          }
          return;
        }
        
        // 檢查是否為基本卡牌（不需要目標）
        if (card.type === 'basic') {
          // 基本卡牌也需要先選中，讓玩家可以查看詳情
          setSelectedCard(card);
          setPendingSkillCard(card);
          // 不直接執行，等待下一次點擊
        } else {
          // 其他卡牌需要選擇目標
          setSelectedCard(card);
          setPendingSkillCard(card);
          // 消耗行動點後設置選擇目標狀態
          consumeActionPoints('card', card.cost);
          setIsSelectingTarget(true);
          setSkillTargets(getValidTargets(card));
          setHasConsumedActionPoints(true);
        }
      }
    }
  };

  // 獲取技能卡牌的有效目標
  const getValidTargets = (card) => {
    if (!card || !card.type) return [];
    
    const targets = [];
    console.log(`檢查技能卡 ${card.name} 的有效目標`);
    
    // 遍歷棋盤找到有效目標
    for (let row = 0; row < BOARD_SIZE; row++) {
      for (let col = 0; col < BOARD_SIZE; col++) {
        const piece = board[row][col];
        
        
        // 特殊處理：防禦牆需要空格子作為目標
        if (card.id === 'DEFENSIVE_WALL') {
          if (piece === 'empty' && row >= 4 && row <= 7) {
            targets.push({ row, col, piece: 'empty', owner: 'empty' });
          }
          continue;
        }
        
        const pieceKey = `${row}-${col}`;
        const pieceOwner = pieceOwners[pieceKey];
        
        // 如果沒有歸屬權記錄，根據位置推斷歸屬權
        const inferredOwner = pieceOwner || (row <= 1 ? 'ai' : 'human');
        
        // 檢查目標是否有隱身狀態（暗影披風效果）
        const pieceState = pieceStates[pieceKey];
        if (pieceState && pieceState.buffs) {
          const shadowCloakBuff = pieceState.buffs.find(buff => 
            buff.type === 'shadow_cloak' && buff.endTurn > currentTurn
          );
          
          if (shadowCloakBuff) {
            console.log(`跳過隱身目標: [${row},${col}] 棋子 ${piece} 處於隱身狀態，不能作為技能目標`);
            continue; // 跳過隱身的棋子
          }
        }
        
        // 跳過空格子（除了特殊處理的防禦牆）
        if (piece === 'empty') continue;
        
        // 調試第0列的棋子
        
        // 根據技能卡牌類型確定有效目標
        switch (card.type) {
          case 'basic_melee_shared':
            // 基礎近戰共用技能：只能對己方的對應棋子使用
            if (inferredOwner === 'human' && card.requiredPieces.includes(piece)) {
              targets.push({ row, col, piece, owner: inferredOwner });
            }
            break;
          case 'ranged_exclusive':
            // 遠程專屬：只能對己方遠程單位使用
            if (inferredOwner === 'human' && card.requiredPieces.includes(piece)) {
              targets.push({ row, col, piece, owner: inferredOwner });
            }
            break;
          case 'ranged_attack':
            // 遠程攻擊：可以攻擊任何格子（放置燃燒效果，並影響格子上的棋子）
            targets.push({ row, col, piece: piece, owner: inferredOwner });
            break;
          case 'mage_exclusive':
            // 魔法師專屬：只能對己方魔法師使用
            console.log(`檢查魔法師專屬技能: piece=${piece}, requiredPieces=${card.requiredPieces}, 包含=${card.requiredPieces.includes(piece)}`);
            if (inferredOwner === 'human' && card.requiredPieces.includes(piece)) {
              targets.push({ row, col, piece, owner: inferredOwner });
              console.log(`添加魔法師目標: [${row},${col}]`);
            }
            break;
          case 'assassin_exclusive':
            // 刺客專屬：只能對己方刺客使用
            if (inferredOwner === 'human' && card.requiredPieces.includes(piece)) {
              targets.push({ row, col, piece, owner: inferredOwner });
            }
            break;
          case 'knight_exclusive':
            // 騎士專屬：只能對己方騎士使用
            if (inferredOwner === 'human' && card.requiredPieces.includes(piece)) {
              targets.push({ row, col, piece, owner: inferredOwner });
            }
            break;
          case 'priest_exclusive':
            // 牧師專屬：可以對所有己方棋子使用（治療禱告）
            if (inferredOwner === 'human' && piece !== 'empty') {
              targets.push({ row, col, piece, owner: inferredOwner });
            }
            break;
          case 'priest_group_exclusive':
            // 牧師群體專屬：只能對己方牧師使用（群體祈禱）
            if (inferredOwner === 'human' && card.requiredPieces.includes(piece)) {
              targets.push({ row, col, piece, owner: inferredOwner });
            }
            break;
          case 'crab_exclusive':
            // 螃蟹專屬：只能對己方螃蟹使用（堅殼防禦）
            if (inferredOwner === 'human' && card.requiredPieces.includes(piece)) {
              targets.push({ row, col, piece, owner: inferredOwner });
            }
            break;
          case 'architect_exclusive':
            // 戰爭建築師專屬：只能對己方棋子使用
            if (inferredOwner === 'human' && piece !== 'empty') {
              targets.push({ row, col, piece, owner: inferredOwner });
            }
            break;
          case 'mind_controller_exclusive':
            // 心靈控制者專屬：可以對敵方基礎單位使用
            if (card.id === 'DEATH_CURSE') {
              const pieceCategory = getPieceCategory(piece);
              if (pieceCategory === 'basic' && inferredOwner !== 'human') {
                // 檢查是否在心智扭曲者四格範圍內
                const mindTwisterPos = getMindTwisterPosition();
                if (mindTwisterPos) {
                  const distance = getDistance(mindTwisterPos.row, mindTwisterPos.col, row, col);
                  if (distance <= 4) {
                    targets.push({ row, col, piece, owner: inferredOwner });
                  }
                }
              }
            } else {
              // 其他心靈控制者技能：只能對己方心智扭曲者使用
              if (inferredOwner === 'human' && card.requiredPieces.includes(piece)) {
                targets.push({ row, col, piece, owner: inferredOwner });
              }
            }
            break;
          case 'soldier_exclusive':
            // 皇家護衛專屬：只能對己方皇家護衛使用
            if (inferredOwner === 'human' && card.requiredPieces.includes(piece)) {
              // 榮譽之血特殊邏輯：只能對受傷的前排皇家護衛使用
              if (card.id === 'HONOR_BLOOD') {
                const pieceKey = `${row}-${col}`;
                const pieceState = pieceStates[pieceKey];
                const isFrontRow = row === 6; // 玩家前排
                const isInjured = pieceState && pieceState.health < pieceState.maxHealth;
                
                if (isFrontRow && isInjured) {
                  targets.push({ row, col, piece, owner: inferredOwner });
                }
              } else {
                // 其他皇家護衛專屬技能正常處理
                targets.push({ row, col, piece, owner: inferredOwner });
              }
            }
            break;
          case 'soldier_samurai_shared':
            // 皇家護衛和太刀武士共用：只能對己方皇家護衛或太刀武士使用
            if (inferredOwner === 'human' && card.requiredPieces.includes(piece)) {
              targets.push({ row, col, piece, owner: inferredOwner });
            }
            break;
          case 'samurai_exclusive':
            // 太刀武士專屬：只能對己方太刀武士使用
            if (inferredOwner === 'human' && card.requiredPieces.includes(piece)) {
              targets.push({ row, col, piece, owner: inferredOwner });
            }
            break;
          case 'sleepy_dog_exclusive':
            // 睏睏狗專屬：只能對己方睏睏狗使用
            if (inferredOwner === 'human' && card.requiredPieces.includes(piece)) {
              targets.push({ row, col, piece, owner: inferredOwner });
            }
            break;
          case 'basic':
            // 基本卡牌：不需要目標
            return [];
          default:
            // 默認：只能對己方的對應棋子使用
            if (inferredOwner === 'human' && card.requiredPieces.includes(piece)) {
              targets.push({ row, col, piece, owner: inferredOwner });
            }
        }
      }
    }
    
    // 死亡詛咒特殊檢查：如果沒有有效目標，顯示失敗訊息
    if (card.id === 'DEATH_CURSE' && targets.length === 0) {
      Alert.alert('施放失敗', '死亡詛咒：心智扭曲者四格範圍內沒有敵方基礎單位');
    }
    
    return targets;
  };

  // 應用技能效果
  const applySkillEffect = (card, targetRow, targetCol) => {
    if (!card) return false;
    
    // 基本卡牌不需要目標
    if (card.type === 'basic') {
      // 直接執行基本卡牌效果
    } else if (targetRow === null || targetRow === undefined || targetCol === null || targetCol === undefined) {
      return false;
    }
    
    const pieceKey = targetRow !== null && targetCol !== null ? `${targetRow}-${targetCol}` : null;
    const targetPiece = targetRow !== null && targetCol !== null ? board[targetRow][targetCol] : null;
    
    // 檢查目標是否有效（非基本卡牌需要檢查）
    if (card.type !== 'basic' && targetRow !== null && targetCol !== null) {
      const isValidTarget = skillTargets.some(target => target.row === targetRow && target.col === targetCol);
      if (!isValidTarget) {
        console.log('無效目標，技能施放失敗');
        return false;
      }
    }
    
    switch (card.id) {
      case 'HOLY_SHIELD':
        // 聖盾術：抵擋下一次所受傷害
        console.log('使用聖盾術卡片，目標位置:', targetRow, targetCol);
        console.log('聖盾術buff將持續到回合:', currentTurn + 2);
        
        // 檢查是否已經有聖盾術buff，如果有則不重複添加
        const currentPieceState = pieceStates[pieceKey];
        const hasHolyShield = currentPieceState?.buffs?.find(buff => 
          buff.type === 'holy_shield' && buff.endTurn > currentTurn
        );
        
        if (!hasHolyShield) {
        setPieceStates(prev => ({
          ...prev,
          [pieceKey]: {
            ...prev[pieceKey],
            buffs: [...(prev[pieceKey]?.buffs || []), { type: 'holy_shield', endTurn: currentTurn + 2 }]
          }
        }));
        console.log('聖盾術buff已添加');
        } else {
          console.log('聖盾術buff已存在，不重複添加');
        }
        break;
        
      case 'SPIKED_ARMOR':
        // 尖刺戰甲：下回合若被近戰攻擊，反彈同等傷害
        // 檢查是否已經有尖刺戰甲buff，如果有則不重複添加
        const hasSpikedArmor = pieceStates[pieceKey]?.buffs?.find(buff => 
          buff.type === 'spiked_armor' && buff.endTurn > currentTurn
        );
        
        if (!hasSpikedArmor) {
        setPieceStates(prev => ({
          ...prev,
          [pieceKey]: {
            ...prev[pieceKey],
            buffs: [...(prev[pieceKey]?.buffs || []), { type: 'spiked_armor', endTurn: currentTurn + 2 }]
          }
        }));
          console.log('尖刺戰甲buff已添加');
        } else {
          console.log('尖刺戰甲buff已存在，不重複添加');
        }
        break;
        
          case 'BURNING_ARROW':
            // 燃燒箭：給射手添加燃燒箭buff，攻擊時會轉移燃燒效果到被攻擊的格子
            setPieceStates(prev => ({
              ...prev,
              [pieceKey]: {
                ...prev[pieceKey],
                buffs: [...(prev[pieceKey]?.buffs || []), { type: 'burning_arrow', endTurn: currentTurn + 2 }]
              }
            }));
            break;
        
      case 'LIGHTNING_BOLT':
        // 落雷術：附加在魔法師身上，攻擊時觸發
        setPieceStates(prev => ({
          ...prev,
          [pieceKey]: {
            ...prev[pieceKey],
            buffs: [...(prev[pieceKey]?.buffs || []), { type: 'lightning_bolt', endTurn: currentTurn + 1 }]
          }
        }));
        break;
        
      case 'HAIL_STORM':
        // 冰雹術：掛在法師身上，攻擊時對左右格造成額外傷害
        setPieceStates(prev => ({
          ...prev,
          [pieceKey]: {
            ...prev[pieceKey],
            buffs: [...(prev[pieceKey]?.buffs || []), { 
              type: 'hail_storm', 
              endTurn: currentTurn + 1,
              range: 1 // 影響範圍：1格內
            }]
          }
        }));
        break;
        
      case 'SHADOW_CLOAK':
        // 飛影披風：隱身一回合，不可被指定為攻擊或技能目標
        // 檢查是否已經有暗影披風buff，如果有則不重複添加
        const hasShadowCloak = pieceStates[pieceKey]?.buffs?.find(buff => 
          buff.type === 'shadow_cloak' && buff.endTurn > currentTurn
        );
        
        if (!hasShadowCloak) {
        setPieceStates(prev => ({
          ...prev,
          [pieceKey]: {
            ...prev[pieceKey],
            buffs: [...(prev[pieceKey]?.buffs || []), { type: 'shadow_cloak', endTurn: currentTurn + 2 }]
          }
        }));
          console.log('暗影披風buff已添加');
        } else {
          console.log('暗影披風buff已存在，不重複添加');
        }
        break;
        
      case 'DEATH_CURSE':
        // 死亡詛咒：指定一名基礎單位，該單位在6回合後死亡
        setPieceStates(prev => ({
          ...prev,
          [pieceKey]: {
            ...prev[pieceKey],
            debuffs: [...(prev[pieceKey]?.debuffs || []), { type: 'death_curse', endTurn: currentTurn + 6 }]
          }
        }));
        break;
        
      case 'HEALING_PRAYER':
        // 治療禱告：直接回復到生命值上限
        const maxHealth = getPieceHealth(targetPiece);
        
        setPieceStates(prev => ({
          ...prev,
          [pieceKey]: {
            ...prev[pieceKey],
            health: maxHealth // 直接回復到滿血
          }
        }));
        break;
        
      case 'DEFENSIVE_WALL':
        // 防禦牆：創造一個300血的牆壁衍生物
        // 需要選擇目標位置（只能在我方陣營的四列內，即第4-7行）
        if (targetRow === null || targetCol === null) {
          return false;
        }
        
        // 檢查目標位置是否在我方陣營（第4-7行）
        if (targetRow < 4 || targetRow > 7) {
          Alert.alert('無效位置', '防禦牆只能放置在我方陣營（第4-7行）');
          return false;
        }
        
        // 檢查目標位置是否為空
        if (board[targetRow][targetCol] !== 'empty') {
          Alert.alert('位置被佔用', '該位置已有棋子');
          return false;
        }
        
        
        // 在目標位置創造牆壁衍生物
        const wallKey = `${targetRow}-${targetCol}`;
        const newBoard = board.map(row => [...row]);
        newBoard[targetRow][targetCol] = 'WALL'; // 牆壁棋子類型
        
        setBoard(newBoard);
        
        // 設置牆壁的狀態
        setPieceStates(prev => ({
          ...prev,
          [wallKey]: {
            health: 300,
            maxHealth: 300,
            isWall: true, // 標記為牆壁
            canMove: false, // 無法移動
            canAttack: false, // 無法攻擊
            isDerivative: true, // 標記為衍生物
            endTurn: currentTurn + 6 // 6回合後消失
          }
        }));
        
        // 設置牆壁的歸屬權為玩家
        setPieceOwners(prev => ({
          ...prev,
          [wallKey]: 'human'
        }));
        
        console.log(`防禦牆已放置在 [${targetRow}, ${targetCol}]`);
        return true;
        
      case 'BATTLEFIELD_SUPPLY':
        // 戰地補給：抽取2張牌（不超過手牌上限）
        const maxHandSize = 7; // 手牌上限
        const cardsToDraw = Math.min(2, maxHandSize - playerHand.length);
        
        // 抽取卡牌
        for (let i = 0; i < cardsToDraw; i++) {
          if (playerCardDeck.length > 0) {
            const newCard = playerCardDeck[0];
            setPlayerCardDeck(prev => prev.slice(1));
            setPlayerHand(prev => [...prev, newCard]);
          }
        }
        break;
        
      case 'CHARGE_ORDER':
        // 衝鋒令：下一次移動多1格，攻擊力+50
        setPieceStates(prev => ({
          ...prev,
          [pieceKey]: {
            ...prev[pieceKey],
            buffs: [...(prev[pieceKey]?.buffs || []), { 
              type: 'charge_order', 
              endTurn: currentTurn + 2,
              moveBonus: 1,
              attackBonus: 50
            }]
          }
        }));
        break;
        
      case 'HONOR_BLOOD':
        // 榮譽之血：受傷時攻擊力+100
        const currentHealth = pieceStates[pieceKey]?.health || getPieceHealth(targetPiece);
        const pieceMaxHealth = pieceStates[pieceKey]?.maxHealth || getPieceMaxHealth(targetPiece);
        const isAlreadyInjured = currentHealth < pieceMaxHealth;
        
        setPieceStates(prev => ({
          ...prev,
          [pieceKey]: {
            ...prev[pieceKey],
            buffs: [...(prev[pieceKey]?.buffs || []), { 
              type: 'honor_blood', 
              endTurn: currentTurn + 4,
              attackBonus: 100,
              triggered: isAlreadyInjured // 如果已經受傷，立即觸發
            }]
          }
        }));
        
        if (isAlreadyInjured) {
          console.log(`榮譽之血立即觸發：棋子已受傷，攻擊力+100`);
        }
        break;
        
      case 'DRAW_SWORD_SLASH':
        // 拔刀斬：攻擊力+100，回合結束時受到50傷害
        setPieceStates(prev => ({
          ...prev,
          [pieceKey]: {
            ...prev[pieceKey],
            buffs: [...(prev[pieceKey]?.buffs || []), { 
              type: 'draw_sword_slash', 
              endTurn: currentTurn + 1, // 持續1回合
              attackBonus: 100,
              turnEndDamage: 50
            }]
          }
        }));
        break;
        
      case 'SLEEPY_AURA':
        // 安眠氣息：睏睏狗為中心內敵人移動力-1格，持續1回合
        setPieceStates(prev => ({
          ...prev,
          [pieceKey]: {
            ...prev[pieceKey],
            buffs: [...(prev[pieceKey]?.buffs || []), { 
              type: 'sleepy_aura', 
              endTurn: currentTurn + 2,
              range: 1 // 影響範圍：1格內
            }]
          }
        }));
        break;
        
      case 'LOYAL_GUARDIAN':
        // 忠犬守護：替自身9宮格內的友方承受傷害
        setPieceStates(prev => ({
          ...prev,
          [pieceKey]: {
            ...prev[pieceKey],
            buffs: [...(prev[pieceKey]?.buffs || []), { 
              type: 'loyal_guardian', 
              endTurn: currentTurn + 4, // 持續4回合
              protectionRange: 1, // 9宮格範圍
              protectedPieces: [] // 受保護的棋子列表
            }]
          }
        }));
        break;
        
      case 'CHARGE_ASSAULT':
        // 衝鋒突擊：直線移動距離增加一格，撞擊敵人造成50傷害
        // 檢查是否已經有衝鋒突擊buff，如果有則不重複添加
        const hasChargeAssault = pieceStates[pieceKey]?.buffs?.find(buff => 
          buff.type === 'charge_assault' && buff.endTurn > currentTurn
        );
        
        if (!hasChargeAssault) {
        setPieceStates(prev => ({
          ...prev,
          [pieceKey]: {
            ...prev[pieceKey],
            buffs: [...(prev[pieceKey]?.buffs || []), { 
              type: 'charge_assault', 
              endTurn: currentTurn + 2,
              moveBonus: 1, // 移動距離+1
                impactDamage: 100 // 撞擊傷害
            }]
          }
        }));
          console.log('衝鋒突擊buff已添加，目標位置:', targetRow, targetCol, '持續到回合:', currentTurn + 2);
        } else {
          console.log('衝鋒突擊buff已存在，不重複添加');
        }
        break;
        
      case 'GROUP_PRAYER':
        // 群體祈禱：牧師為中心九宮格內所有友軍回復50HP
        const centerRow = targetRow;
        const centerCol = targetCol;
        const healAmount = 50;
        
        // 檢查九宮格內的所有友軍
        for (let dRow = -1; dRow <= 1; dRow++) {
          for (let dCol = -1; dCol <= 1; dCol++) {
            const checkRow = centerRow + dRow;
            const checkCol = centerCol + dCol;
            
            // 確保在棋盤範圍內
            if (checkRow >= 0 && checkRow < 8 && checkCol >= 0 && checkCol < 8) {
              const checkPiece = board[checkRow][checkCol];
              if (checkPiece !== 'empty') {
                const checkKey = `${checkRow}-${checkCol}`;
                const checkOwner = pieceOwners[checkKey];
                
                // 只治療友軍
                if (checkOwner === currentPlayer) {
                  const checkState = pieceStates[checkKey];
                  if (checkState) {
                    const maxHealth = getPieceMaxHealth(checkPiece);
                    const currentHealth = checkState.health || getPieceHealth(checkPiece);
                    const newHealth = Math.min(maxHealth, currentHealth + healAmount);
                    
                    setPieceStates(prev => ({
                      ...prev,
                      [checkKey]: {
                        ...prev[checkKey],
                        health: newHealth
                      }
                    }));
                    
                    console.log(`群體祈禱：${checkPiece} 回復了 ${newHealth - currentHealth} 點生命值`);
                  }
                }
              }
            }
          }
        }
        break;
        
      case 'SHELL_DEFENSE':
        // 堅殼防禦：螃蟹專屬，四回合內不會受到傷害，但無法移動
        console.log('施放堅殼防禦，目標位置:', targetRow, targetCol, 'pieceKey:', pieceKey);
        console.log('目標棋子:', targetPiece);
        
        setPieceStates(prev => {
          const newState = {
            ...prev,
            [pieceKey]: {
              ...prev[pieceKey],
              buffs: [...(prev[pieceKey]?.buffs || []), { 
                type: 'shell_defense', 
                endTurn: currentTurn + 4,
                damageImmunity: true,
                cannotMove: true
              }]
            }
          };
          console.log('堅殼防禦buff已添加:', newState[pieceKey]?.buffs);
          return newState;
        });
        
        console.log('堅殼防禦：螃蟹獲得傷害免疫，但無法移動');
        break;
        
      case 'GLORY_STRIKE':
        // 光耀斬擊：牧師專屬，攻擊敵人時驅散敵方增益並附帶50額外傷害
        setPieceStates(prev => ({
          ...prev,
          [pieceKey]: {
            ...prev[pieceKey],
            buffs: [...(prev[pieceKey]?.buffs || []), { 
              type: 'glory_strike', 
              endTurn: currentTurn + 1,
              extraDamage: 50,
              dispelBuffs: true
            }]
          }
        }));
        
        console.log('光耀斬擊：牧師獲得攻擊增益，下次攻擊時驅散敵方增益並造成額外傷害');
        break;
        
      default:
        console.log('未知技能卡牌:', card.id);
        return false;
    }
    
    // 只有在成功施放時才消耗行動點和移除手牌
    consumeActionPoints('card', card.cost);
    removeCard(card);
    
    // 清除技能使用狀態
    setPendingSkillCard(null);
    setIsSelectingTarget(false);
    setSkillTargets([]);
    setHasShownSkillError(false); // 重置錯誤提示狀態
    
    return true;
  };

  // 區域傷害效果
  const applyAreaDamage = (centerRow, centerCol, type) => {
    const directions = type === 'lightning' ? 
      [[-1, 0], [1, 0]] : // 前後格
      [[0, -1], [0, 1]];   // 左右格
    
    directions.forEach(([dRow, dCol]) => {
      const targetRow = centerRow + dRow;
      const targetCol = centerCol + dCol;
      
      if (isValidPosition(targetRow, targetCol)) {
        const piece = board[targetRow][targetCol];
        if (piece !== 'empty') {
          const pieceKey = `${targetRow}-${targetCol}`;
          const pieceOwner = pieceOwners[pieceKey];
          
          // 只對敵方棋子造成傷害
          if (pieceOwner !== currentPlayer) {
            const centerPieceKey = `${centerRow}-${centerCol}`;
            const attackPower = getPieceAttackPowerWithBuffs(board[centerRow][centerCol], centerPieceKey);
            const currentHealth = pieceStates[pieceKey]?.health || getPieceHealth(piece);
            const newHealth = Math.max(0, currentHealth - attackPower);
            
            setPieceStates(prev => ({
              ...prev,
              [pieceKey]: {
                ...prev[pieceKey],
                health: newHealth
              }
            }));
            
            // 如果血量歸零，移除棋子
            if (newHealth <= 0) {
              const newBoard = board.map(row => [...row]);
              newBoard[targetRow][targetCol] = 'empty';
              setBoard(newBoard);
              
              setPieceStates(prev => {
                const newStates = { ...prev };
                delete newStates[pieceKey];
                return newStates;
              });
              
              setPieceOwners(prev => {
                const newOwners = { ...prev };
                delete newOwners[pieceKey];
                return newOwners;
              });
            }
          }
        }
      }
    });
  };

  // 移除手牌函數（用於 CardSystem）
  const removeCard = (card) => {
    setPlayerHand(prev => prev.filter(c => c.id !== card.id));
    setSelectedCard(null);
    // 移除手牌後不自動切換回合，等待玩家點擊結束回合按鈕
  };

  // 處理技能效果持續時間
  const processSkillEffects = (turnNumber = currentTurn) => {
    console.log(`processSkillEffects 被調用，當前回合: ${turnNumber}`);
    
    setPieceStates(prev => {
      const newStates = { ...prev };
      
      // 列出場上的特殊效果
      const activeEffects = [];
      Object.keys(newStates).forEach(pieceKey => {
        const pieceState = newStates[pieceKey];
        if (pieceState && pieceState.buffs && pieceState.buffs.length > 0) {
          pieceState.buffs.forEach(buff => {
            const remainingTurns = Math.max(0, buff.endTurn - turnNumber);
            activeEffects.push(`棋子 ${pieceKey}: ${buff.type} (剩餘 ${remainingTurns} 回合，結束於回合 ${buff.endTurn})`);
          });
        }
        if (pieceState && pieceState.debuffs && pieceState.debuffs.length > 0) {
          pieceState.debuffs.forEach(debuff => {
            const remainingTurns = Math.max(0, debuff.endTurn - turnNumber);
            activeEffects.push(`棋子 ${pieceKey}: ${debuff.type} (剩餘 ${remainingTurns} 回合，結束於回合 ${debuff.endTurn})`);
          });
        }
      });
      
      if (activeEffects.length > 0) {
        console.log('=== 場上特殊效果 ===');
        activeEffects.forEach(effect => console.log(effect));
        console.log('==================');
      }
      
      Object.keys(newStates).forEach(pieceKey => {
        const pieceState = newStates[pieceKey];
        if (pieceState && pieceState.buffs && pieceState.buffs.length > 0) {
          // 處理增益效果 - 基於結束回合數過濾
          const updatedBuffs = pieceState.buffs.filter(buff => {
            const remainingTurns = Math.max(0, buff.endTurn - turnNumber);
            return remainingTurns > 0;
          });
          
          // 處理拔刀斬的回合結束傷害
          const drawSwordBuffs = pieceState.buffs.filter(buff => buff.type === 'draw_sword_slash');
          drawSwordBuffs.forEach(buff => {
            const remainingTurns = Math.max(0, buff.endTurn - turnNumber);
            if (remainingTurns > 0) {
              // 如果還有剩餘回合，檢查是否需要造成回合結束傷害
              if (buff.turnEndDamage && remainingTurns === 1) {
                // 回合結束時造成傷害
                const [row, col] = pieceKey.split('-').map(Number);
                const piece = board[row][col];
                const currentHealth = pieceState.health || getPieceHealth(piece);
                const newHealth = Math.max(0, currentHealth - buff.turnEndDamage);
                
                console.log(`拔刀斬回合結束傷害: 棋子[${row},${col}] 從${currentHealth}血減少到${newHealth}血`);
                
                newStates[pieceKey] = {
                  ...newStates[pieceKey],
                  health: newHealth,
                  isInjured: newHealth < (newStates[pieceKey]?.maxHealth || getPieceMaxHealth(piece))
                };
                
                console.log(`血量更新後檢查: newStates[${pieceKey}].health = ${newStates[pieceKey].health}`);
              }
            } else {
              // buff已經結束，造成回合結束傷害
              if (buff.turnEndDamage) {
                const [row, col] = pieceKey.split('-').map(Number);
                const piece = board[row][col];
                const currentHealth = pieceState.health || getPieceHealth(piece);
                const newHealth = Math.max(0, currentHealth - buff.turnEndDamage);
                
                console.log(`拔刀斬buff結束傷害: 棋子[${row},${col}] 從${currentHealth}血減少到${newHealth}血`);
                
                newStates[pieceKey] = {
                  ...newStates[pieceKey],
                  health: newHealth,
                  isInjured: newHealth < (newStates[pieceKey]?.maxHealth || getPieceMaxHealth(piece))
                };
                
                console.log(`血量更新後檢查: newStates[${pieceKey}].health = ${newStates[pieceKey].health}`);
              }
            }
          });
          
          // 處理安眠氣息的範圍效果
          const sleepyAuraBuffs = pieceState.buffs.filter(buff => buff.type === 'sleepy_aura');
          sleepyAuraBuffs.forEach(buff => {
            const remainingTurns = Math.max(0, buff.endTurn - turnNumber);
            if (remainingTurns > 0) {
              // 為周圍的敵人添加安眠氣息debuff
              const [centerRow, centerCol] = pieceKey.split('-').map(Number);
              const range = buff.range || 1;
              
              // 檢查周圍8個方向
              const directions = [[-1, -1], [-1, 0], [-1, 1], [0, -1], [0, 1], [1, -1], [1, 0], [1, 1]];
              directions.forEach(([dRow, dCol]) => {
                const targetRow = centerRow + dRow;
                const targetCol = centerCol + dCol;
                
                if (targetRow >= 0 && targetRow < 8 && targetCol >= 0 && targetCol < 8) {
                  const targetKey = `${targetRow}-${targetCol}`;
                  const targetPiece = board[targetRow][targetCol];
                  
                  if (targetPiece !== 'empty') {
                    const targetOwner = pieceOwners[targetKey];
                    // 只對敵方棋子施加debuff
                    if (targetOwner !== pieceOwners[pieceKey]) {
                      if (!newStates[targetKey]) {
                        newStates[targetKey] = { ...pieceStates[targetKey] };
                      }
                      if (!newStates[targetKey].debuffs) {
                        newStates[targetKey].debuffs = [];
                      }
                      
                      // 檢查是否已經有安眠氣息debuff
                      const existingDebuff = newStates[targetKey].debuffs.find(debuff => debuff.type === 'sleepy_aura');
                      if (!existingDebuff) {
                        newStates[targetKey].debuffs.push({
                          type: 'sleepy_aura',
                          endTurn: buff.endTurn
                        });
                      }
                    }
                  }
                }
              });
            }
          });
          
          newStates[pieceKey] = {
            ...pieceState,
            buffs: updatedBuffs
          };
        }
        
        if (pieceState && pieceState.debuffs) {
          // 處理減益效果 - 基於結束回合數過濾
          const updatedDebuffs = pieceState.debuffs.filter(debuff => {
            const remainingTurns = Math.max(0, debuff.endTurn - turnNumber);
            return remainingTurns > 0;
          });
          
          // 處理燃燒效果
          const burningEffects = pieceState.debuffs.filter(debuff => 
            debuff.type === 'burning' && debuff.damage
          );
          
          burningEffects.forEach(burning => {
            // 執行燃燒傷害
            const [row, col] = pieceKey.split('-').map(Number);
            const piece = board[row][col];
            if (piece !== 'empty') {
              const currentHealth = pieceState.health || getPieceHealth(piece);
              const newHealth = Math.max(0, currentHealth - burning.damage);
              
              newStates[pieceKey] = {
                ...pieceState,
                health: newHealth
              };
              
              // 如果血量歸零，移除棋子
              if (newHealth <= 0) {
                const newBoard = board.map(r => [...r]);
                newBoard[row][col] = 'empty';
                setBoard(newBoard);
                
                delete newStates[pieceKey];
                setPieceOwners(prev => {
                  const newOwners = { ...prev };
                  delete newOwners[pieceKey];
                  return newOwners;
                });
              }
            }
          });
          
          // 處理死亡詛咒效果
          const deathCurses = pieceState.debuffs.filter(debuff => 
            debuff.type === 'death_curse' && debuff.endTurn <= turnNumber
          );
          
          deathCurses.forEach(curse => {
            // 執行死亡詛咒效果
            const [row, col] = pieceKey.split('-').map(Number);
            const piece = board[row][col];
            if (piece !== 'empty') {
              console.log(`死亡詛咒生效：棋子 [${row},${col}] 被摧毀`);
              // 移除棋子
              const newBoard = board.map(r => [...r]);
              newBoard[row][col] = 'empty';
              setBoard(newBoard);
              
              // 清除棋子狀態
              delete newStates[pieceKey];
              setPieceOwners(prev => {
                const newOwners = { ...prev };
                delete newOwners[pieceKey];
                return newOwners;
              });
            }
          });
          
          newStates[pieceKey] = {
            ...pieceState,
            debuffs: updatedDebuffs
          };
        }
      });
      
      // 處理牆壁衍生物消失
      const wallsToRemove = [];
      Object.keys(newStates).forEach(pieceKey => {
        const pieceState = newStates[pieceKey];
        if (pieceState && pieceState.isWall && pieceState.endTurn) {
          if (turnNumber >= pieceState.endTurn) {
            wallsToRemove.push(pieceKey);
          }
        }
      });
      
      // 移除到期的牆壁
      wallsToRemove.forEach(pieceKey => {
        const [row, col] = pieceKey.split('-').map(Number);
        const newBoard = board.map(r => [...r]);
        newBoard[row][col] = 'empty';
        setBoard(newBoard);
        
        delete newStates[pieceKey];
        setPieceOwners(prev => {
          const newOwners = { ...prev };
          delete newOwners[pieceKey];
          return newOwners;
        });
        
        console.log(`牆壁衍生物 [${row}, ${col}] 已消失（第${turnNumber}回合）`);
      });
      
      // 處理格子燃燒效果
      Object.keys(newStates).forEach(pieceKey => {
        const pieceState = newStates[pieceKey];
        if (pieceState && pieceState.burningField) {
          const burningField = pieceState.burningField;
          const remainingTurns = Math.max(0, burningField.endTurn - turnNumber);
          
          if (remainingTurns > 0) {
            // 檢查該格子上是否有棋子
            const [row, col] = pieceKey.split('-').map(Number);
            const piece = board[row][col];
            
            if (piece !== 'empty') {
              // 對該格子的棋子造成燃燒傷害
              const currentHealth = pieceStates[pieceKey]?.health || getPieceHealth(piece);
              const newHealth = Math.max(0, currentHealth - burningField.damage);
              
              newStates[pieceKey] = {
                ...pieceState,
                health: newHealth
              };
              
              console.log(`格子 [${row}, ${col}] 的燃燒效果對棋子造成 ${burningField.damage} 傷害，剩餘血量: ${newHealth}`);
              
              // 如果血量歸零，移除棋子
              if (newHealth <= 0) {
                const newBoard = board.map(r => [...r]);
                newBoard[row][col] = 'empty';
                setBoard(newBoard);
                
                // 清除棋子狀態
                delete newStates[pieceKey];
                setPieceOwners(prev => {
                  const newOwners = { ...prev };
                  delete newOwners[pieceKey];
                  return newOwners;
                });
              }
            }
          } else {
            // 燃燒效果結束，移除格子燃燒效果
            delete newStates[pieceKey].burningField;
            console.log(`格子 [${row}, ${col}] 的燃燒效果已結束`);
          }
        }
      });
      
      return newStates;
    });
    
    // 強制重新渲染UI
    setForceUpdate(prev => prev + 1);
  };

  // 結束回合函數
  const handleEndTurn = () => {
    // 玩家結束回合，增加回合數
    const newTurn = currentTurn + 1;
    setCurrentTurn(newTurn);
    
    // 立即處理技能效果，傳入新的回合數
    processSkillEffects(newTurn);
    
    setCurrentPlayer('ai');
    setIsAITurn(true);
  };

  // AI出牌決策函數
  const getAICardPlay = () => {
    if (enemyHand.length === 0) {
      return null;
    }

    // AI簡單策略：隨機選擇一張牌（不再檢查法力值）
    const selectedCard = enemyHand[Math.floor(Math.random() * enemyHand.length)];
    
    return selectedCard;
  };

  // AI出牌函數
  const playAICard = (card) => {
    if (card) {
      // 顯示AI出牌動畫
      setAiPlayedCard(card);
      setShowAiPlayedCard(true);
      
      // 1秒後隱藏動畫並執行出牌邏輯
      setTimeout(() => {
        setShowAiPlayedCard(false);
        
        // 移除AI手牌
        setEnemyHand(prev => prev.filter(c => c.id !== card.id));
        
        // 再過0.5秒後清除卡片狀態
        setTimeout(() => {
          setAiPlayedCard(null);
        }, 500);
      }, 1000);
      
      return true;
    }
    return false;
  };

  // 處理選中卡片的出牌（用於 CardSystem）
  const handleSelectedCardPlay = (card) => {
    if (card) {
      // 檢查是否有足夠的行動點（卡牌消耗由卡牌本身決定）
      const cardActionCost = card.actionCost || 0;
      if (!hasEnoughActionPoints('card', cardActionCost)) {
        Alert.alert('行動點不足', `使用此卡牌需要${cardActionCost}點行動點`);
        return;
      }
      
      // 消耗行動點
      consumeActionPoints('card', cardActionCost);
      // 移除手牌
      removeCard(card);
    }
  };

  const drawCard = (player) => {
    if (player === 'human' && playerCardDeck.length > 0 && playerHand.length < 5) {
      const newCard = playerCardDeck[0];
      setPlayerCardDeck(prev => prev.slice(1));
      setPlayerHand(prev => [...prev, newCard]);
      console.log(`玩家抽卡: ${newCard.name}, 手牌數量: ${playerHand.length + 1}`);
    } else if (player === 'ai' && enemyCardDeck.length > 0 && enemyHand.length < 5) {
      const newCard = enemyCardDeck[0];
      setEnemyCardDeck(prev => prev.slice(1));
      setEnemyHand(prev => [...prev, newCard]);
      console.log(`AI抽卡: ${newCard.name}, 手牌數量: ${enemyHand.length + 1}`);
    } else if (player === 'human' && playerHand.length >= 5) {
      console.log('玩家手牌已滿，無法抽卡');
    } else if (player === 'ai' && enemyHand.length >= 5) {
      console.log('AI手牌已滿，無法抽卡');
    }
  };

  // 行動消耗函數
  const consumeActionPoints = (actionType, cost = null) => {
    let actualCost = cost;
    
    // 根據行動類型設定消耗
    switch (actionType) {
      case 'move':
        actualCost = 3;
        break;
      case 'attack':
        actualCost = 2;
        break;
      case 'card':
        actualCost = cost || 0; // 卡牌消耗由卡牌本身決定
        break;
      default:
        actualCost = cost || 1;
    }
    
    setActionPoints(prev => {
      const newPoints = Math.max(0, prev.current - actualCost);
      return { ...prev, current: newPoints };
    });
    
    // 如果是卡牌消耗，設置已消耗行動點標記
    if (actionType === 'card') {
      setHasConsumedActionPoints(true);
    }
    
    return actualCost;
  };

  // 檢查是否有足夠的行動點
  const hasEnoughActionPoints = (actionType, cost = null) => {
    let requiredCost = cost;
    
    switch (actionType) {
      case 'move':
        requiredCost = 3;
        break;
      case 'attack':
        requiredCost = 2;
        break;
      case 'card':
        requiredCost = cost || 0;
        break;
      default:
        requiredCost = cost || 1;
    }
    
    return actionPoints.current >= requiredCost;
  };

  // 初始化棋盤狀態
  const [board, setBoard] = useState(() => {
    const initialBoard = Array(BOARD_SIZE).fill(null).map(() => 
      Array(BOARD_SIZE).fill('empty')
    );
    
    // 設置初始棋子位置 - 玩家方（第5-7行）
    initialBoard[6][1] = 'S'; // 玩家皇家護衛
    initialBoard[7][1] = 'A'; // 玩家弓箭手
    initialBoard[7][2] = 'W'; // 玩家戰士
    initialBoard[7][3] = 'M'; // 玩家法師
    initialBoard[7][4] = 'K'; // 玩家騎士
    initialBoard[6][2] = 'P'; // 玩家牧師
    initialBoard[6][3] = 'AS'; // 玩家刺客
    initialBoard[6][4] = 'MT'; // 玩家心智扭曲者
    
    // 設置初始棋子位置 - AI方（簡化棋組：只有弓箭手和螃蟹）
    initialBoard[1][3] = 'A'; // AI弓箭手
    initialBoard[1][4] = 'CC'; // AI螃蟹
    
    
    return initialBoard;
  });

  // 棋子狀態追蹤
  const [pieceStates, setPieceStates] = useState({});
  

  // 注意：棋子狀態的初始化已經在上面的 useEffect 中完成

  // 棋子擁有者追蹤（基於初始位置，不會改變）
  const [pieceOwners, setPieceOwners] = useState({});
  

  // 歸屬權已經在棋盤初始化時設置，不需要重複初始化
  // useEffect(() => {
  //   // 歸屬權初始化已移至棋盤初始化邏輯中
  // }, []);

  const [selectedPiece, setSelectedPiece] = useState(null);
  const [selectedPosition, setSelectedPosition] = useState(null);
  const [currentPlayer, setCurrentPlayer] = useState('human');
  const [isAITurn, setIsAITurn] = useState(false);
  const [currentTurn, setCurrentTurn] = useState(0);
  const [forceUpdate, setForceUpdate] = useState(0);
  
  // 移除城堡狀態追蹤
  // 移除AI進度狀態，使用簡單AI

  // 移除3D動畫效果來解決 rotateX 問題

  // 遊戲邏輯函數（保持原有邏輯）
  const isValidPosition = (row, col) => {
    return row >= 0 && row < BOARD_SIZE && col >= 0 && col < BOARD_SIZE;
  };

  // 移除城堡位置檢查函數

  const isAdjacent = (row1, col1, row2, col2) => {
    const rowDiff = Math.abs(row1 - row2);
    const colDiff = Math.abs(col1 - col2);
    return (rowDiff === 1 && colDiff === 0) || (rowDiff === 0 && colDiff === 1);
  };

  // 計算兩個位置之間的距離（曼哈頓距離）
  const getDistance = (row1, col1, row2, col2) => {
    return Math.abs(row1 - row2) + Math.abs(col1 - col2);
  };

  // 獲取心智扭曲者的位置
  const getMindTwisterPosition = () => {
    for (let row = 0; row < BOARD_SIZE; row++) {
      for (let col = 0; col < BOARD_SIZE; col++) {
        const piece = board[row][col];
        const pieceKey = `${row}-${col}`;
        const pieceOwner = pieceOwners[pieceKey];
        if (piece === 'MT' && pieceOwner === 'human') {
          return { row, col };
        }
      }
    }
    return null;
  };

  const getPiecePlayer = (row, col) => {
    const pieceKey = `${row}-${col}`;
    const owner = pieceOwners[pieceKey];
    
    // 如果pieceOwners中有記錄，使用記錄的值
    if (owner) {
      return owner;
    }
    
    // 如果該位置沒有棋子，返回null（不屬於任何玩家）
    if (board[row][col] === 'empty') {
      return null;
    }
    
    // 如果沒有記錄但有棋子，記錄錯誤但不要重新同步
    // 因為重新同步會破壞移動後的歸屬權
    
    // 返回null表示歸屬權未知，讓調用者處理
    return null;
  };

  const isEnemyPiece = (row, col) => {
    // 如果該位置沒有棋子，不是敵方棋子
    if (board[row][col] === 'empty') {
      return false;
    }
    
    // 普通棋子（包括城堡）
    const piecePlayer = getPiecePlayer(row, col);
    // 如果歸屬權未知，不視為敵方棋子
    if (piecePlayer === null) {
      return false;
    }
    return piecePlayer !== currentPlayer;
  };

  const handleCombat = (attackerRow, attackerCol, targetRow, targetCol) => {
    // 普通棋子戰鬥邏輯
    console.log('開始戰鬥處理：攻擊者[', attackerRow, ',', attackerCol, '] 攻擊目標[', targetRow, ',', targetCol, ']');
    
    const attackerPiece = board[attackerRow][attackerCol];
    const targetPiece = board[targetRow][targetCol];
    const targetKey = `${targetRow}-${targetCol}`;
    const attackerKey = `${attackerRow}-${attackerCol}`;
    const targetState = pieceStates[targetKey];
    const attackerState = pieceStates[attackerKey];
    
    console.log('攻擊者棋子:', attackerPiece, '目標棋子:', targetPiece);
    console.log('目標狀態:', targetState);
    
    // 獲取攻擊力
    const attackPower = getPieceAttackPowerWithBuffs(attackerPiece, attackerKey);
    
    // 檢查是否有忠犬守護效果
    let actualDamage = attackPower;
    let guardianKey = null;
    
    // 檢查目標9宮格內是否有睏睏狗提供忠犬守護
    const directions = [[-1, -1], [-1, 0], [-1, 1], [0, -1], [0, 1], [1, -1], [1, 0], [1, 1]];
    for (const [dRow, dCol] of directions) {
      const guardianRow = targetRow + dRow;
      const guardianCol = targetCol + dCol;
      
      if (guardianRow >= 0 && guardianRow < 8 && guardianCol >= 0 && guardianCol < 8) {
        const guardianPieceKey = `${guardianRow}-${guardianCol}`;
        const guardianPiece = board[guardianRow][guardianCol];
        const guardianState = pieceStates[guardianPieceKey];
        
        if (guardianPiece === 'SD' && guardianState && guardianState.buffs) {
          const loyalGuardianBuff = guardianState.buffs.find(buff => 
            buff.type === 'loyal_guardian' && buff.endTurn > currentTurn
          );
          
          if (loyalGuardianBuff) {
            // 找到忠犬守護，轉移全部傷害
            const damageToTransfer = actualDamage;
            actualDamage = 0; // 目標不受傷害
            guardianKey = guardianPieceKey;
            
            // 睏睏狗承受全部傷害
            const guardianHealth = guardianState.health || getPieceHealth(guardianPiece);
            const newGuardianHealth = Math.max(0, guardianHealth - damageToTransfer);
            
            setPieceStates(prev => ({
              ...prev,
              [guardianPieceKey]: {
                ...prev[guardianPieceKey],
                health: newGuardianHealth,
                hasBeenAttacked: true
              }
            }));
            
            if (newGuardianHealth <= 0) {
              console.log(`忠犬守護：睏睏狗陣亡，忠犬守護效果結束`);
            }
            
            console.log(`忠犬守護：睏睏狗承受了 ${damageToTransfer} 點傷害`);
            break;
          }
        }
      }
    }
    
    // 檢查目標是否有聖盾術buff
    console.log('檢查聖盾術：目標狀態=', targetState);
    console.log('目標buff列表=', targetState?.buffs);
    
    if (targetState && targetState.buffs) {
      const holyShieldBuff = targetState.buffs.find(buff => 
        buff.type === 'holy_shield' && buff.endTurn > currentTurn
      );
      
      console.log('找到的聖盾術buff:', holyShieldBuff);
      console.log('當前回合:', currentTurn);
      
      if (holyShieldBuff) {
        // 聖盾術抵擋所有傷害
        console.log('聖盾術效果：抵擋了所有傷害');
        
        // 移除聖盾術buff（一次性效果）
        setPieceStates(prev => ({
          ...prev,
          [targetKey]: {
            ...prev[targetKey],
            buffs: prev[targetKey].buffs.filter(buff => buff.type !== 'holy_shield')
          }
        }));
        
        // 強制重新渲染UI
        setForceUpdate(prev => prev + 1);
        
        return 'enemy_damaged'; // 返回傷害被抵擋的狀態
      } else {
        console.log('沒有找到有效的聖盾術buff');
      }
    } else {
      console.log('目標沒有buff或目標狀態為空');
    }
    
    // 檢查目標是否有堅殼防禦buff，免疫傷害
    if (targetState && targetState.buffs) {
      const shellDefenseBuff = targetState.buffs.find(buff => 
        buff.type === 'shell_defense' && buff.endTurn > currentTurn && buff.damageImmunity
      );
      
      if (shellDefenseBuff) {
        console.log('堅殼防禦：目標免疫所有傷害，傷害從', actualDamage, '設為0');
        actualDamage = 0; // 傷害設為0
      }
    }
    
    // 計算新血量
    const currentHealth = targetState?.health || getPieceHealth(targetPiece);
    const newHealth = currentHealth - actualDamage;
    
    // 更新目標血量
    setPieceStates(prev => ({
      ...prev,
      [targetKey]: {
        ...prev[targetKey],
        health: Math.max(0, newHealth), // 確保血量不會低於0
        hasBeenAttacked: true,
        isInjured: newHealth < (prev[targetKey]?.maxHealth || getPieceMaxHealth(targetPiece)) // 受傷狀態
      }
    }));
    
    // 檢查目標是否有榮譽之血buff，受傷時觸發
    const targetStateForHonor = pieceStates[targetKey];
    if (targetStateForHonor && targetStateForHonor.buffs) {
      const honorBloodBuff = targetStateForHonor.buffs.find(buff => 
        buff.type === 'honor_blood' && !buff.triggered
      );
      
      if (honorBloodBuff && newHealth < (targetStateForHonor?.maxHealth || getPieceMaxHealth(targetPiece))) {
        // 觸發榮譽之血效果
        setPieceStates(prev => ({
          ...prev,
          [targetKey]: {
            ...prev[targetKey],
            buffs: prev[targetKey].buffs.map(buff => 
              buff.type === 'honor_blood' && !buff.triggered
                ? { ...buff, triggered: true }
                : buff
            )
          }
        }));
        console.log(`榮譽之血觸發：目標攻擊力+100`);
      }
    }
    
    // 檢查攻擊者是否有燃燒箭buff
    if (attackerState && attackerState.buffs) {
      const burningArrowBuff = attackerState.buffs.find(buff => 
        buff.type === 'burning_arrow' && buff.endTurn > currentTurn
      );
      
      if (burningArrowBuff) {
        // 在目標格子上放置燃燒效果
        setPieceStates(prev => ({
          ...prev,
          [targetKey]: {
            ...prev[targetKey],
            burningField: {
              endTurn: currentTurn + 5, // 燃燒效果持續5回合
              damage: 50
            }
          }
        }));
        
        console.log(`燃燒箭效果已轉移到格子 [${targetRow}, ${targetCol}]`);
      }
    }
    
    // 檢查攻擊者是否有落雷術buff
    if (attackerState && attackerState.buffs) {
      console.log('檢查攻擊者buff:', attackerState.buffs);
      const lightningBoltBuff = attackerState.buffs.find(buff => 
        buff.type === 'lightning_bolt' && buff.endTurn > currentTurn
      );
      
      console.log('落雷術buff:', lightningBoltBuff);
      
      if (lightningBoltBuff) {
        // 為被攻擊的本體添加雷電效果
        setPieceStates(prev => ({
          ...prev,
          [targetKey]: {
            ...prev[targetKey],
            lightningEffect: true
          }
        }));
        
        // 2秒後移除本體的雷電效果
        setTimeout(() => {
          setPieceStates(prev => ({
            ...prev,
            [targetKey]: {
              ...prev[targetKey],
              lightningEffect: false
            }
          }));
        }, 2000);
        
        // 以目標為中心，對前後格造成額外傷害
        const directions = [
          { row: -1, col: 0 }, // 前
          { row: 1, col: 0 }   // 後
        ];
        
        directions.forEach(dir => {
          const lightningRow = targetRow + dir.row;
          const lightningCol = targetCol + dir.col;
          
          console.log(`檢查落雷術目標位置: [${lightningRow}, ${lightningCol}]`);
          
          if (isValidPosition(lightningRow, lightningCol)) {
            const lightningPiece = board[lightningRow][lightningCol];
            console.log(`位置 [${lightningRow}, ${lightningCol}] 的棋子:`, lightningPiece);
            
            if (lightningPiece !== 'empty') {
              const lightningKey = `${lightningRow}-${lightningCol}`;
              const lightningOwner = pieceOwners[lightningKey];
              
              console.log(`棋子擁有者: ${lightningOwner}, 當前玩家: ${currentPlayer}`);
              
              // 只對敵方棋子造成傷害
              if (lightningOwner !== currentPlayer) {
                const lightningState = pieceStates[lightningKey];
                const lightningDamage = attackPower;
                const lightningCurrentHealth = lightningState?.health || getPieceHealth(lightningPiece);
                const lightningNewHealth = Math.max(0, lightningCurrentHealth - lightningDamage);
                
                // 立即顯示雷電效果
                setPieceStates(prev => ({
                  ...prev,
                  [lightningKey]: {
                    ...prev[lightningKey],
                    lightningEffect: true
                  }
                }));
                
                // 執行落雷術攻擊動畫
                performAttackAnimation(attackerRow, attackerCol, lightningRow, lightningCol, () => {
                  // 動畫完成後更新血量
                  setPieceStates(prev => ({
                    ...prev,
                    [lightningKey]: {
                      ...prev[lightningKey],
                      health: lightningNewHealth,
                      hasBeenAttacked: true,
                      isInjured: lightningNewHealth < (prev[lightningKey]?.maxHealth || getPieceMaxHealth(lightningPiece))
                    }
                  }));
                });
                
                // 2秒後移除雷電效果
                setTimeout(() => {
                  setPieceStates(prev => ({
                    ...prev,
                    [lightningKey]: {
                      ...prev[lightningKey],
                      lightningEffect: false
                    }
                  }));
                }, 2000);
                
                console.log(`落雷術效果：對 [${lightningRow},${lightningCol}] 造成 ${lightningDamage} 傷害`);
              }
            }
          }
        });
        
        console.log('落雷術效果：對目標前後格造成額外傷害');
      }
    }
    
    // 檢查攻擊者是否有冰雹術buff
    if (attackerState && attackerState.buffs) {
      console.log('檢查攻擊者buff:', attackerState.buffs);
      const hailStormBuff = attackerState.buffs.find(buff => 
        buff.type === 'hail_storm' && buff.endTurn > currentTurn
      );
      
      console.log('冰雹術buff:', hailStormBuff);
      
      if (hailStormBuff) {
        // 為被攻擊的本體添加冰雹效果
        setPieceStates(prev => ({
          ...prev,
          [targetKey]: {
            ...prev[targetKey],
            hailEffect: true
          }
        }));
        
        // 2秒後移除本體的冰雹效果
        setTimeout(() => {
          setPieceStates(prev => ({
            ...prev,
            [targetKey]: {
              ...prev[targetKey],
              hailEffect: false
            }
          }));
        }, 2000);
        
        // 以目標為中心，對左右格造成額外傷害
        const directions = [
          { row: 0, col: -1 }, // 左
          { row: 0, col: 1 }   // 右
        ];
        
        directions.forEach(dir => {
          const hailRow = targetRow + dir.row;
          const hailCol = targetCol + dir.col;
          
          console.log(`檢查冰雹術目標位置: [${hailRow}, ${hailCol}]`);
          
          if (isValidPosition(hailRow, hailCol)) {
            const hailPiece = board[hailRow][hailCol];
            console.log(`位置 [${hailRow}, ${hailCol}] 的棋子:`, hailPiece);
            
            if (hailPiece !== 'empty') {
              const hailKey = `${hailRow}-${hailCol}`;
              const hailOwner = pieceOwners[hailKey];
              
              console.log(`棋子擁有者: ${hailOwner}, 當前玩家: ${currentPlayer}`);
              
              // 只對敵方棋子造成傷害
              if (hailOwner !== currentPlayer) {
                const hailState = pieceStates[hailKey];
                const hailDamage = attackPower;
                const hailCurrentHealth = hailState?.health || getPieceHealth(hailPiece);
                const hailNewHealth = Math.max(0, hailCurrentHealth - hailDamage);
                
                // 立即顯示冰雹效果
                setPieceStates(prev => ({
                  ...prev,
                  [hailKey]: {
                    ...prev[hailKey],
                    hailEffect: true
                  }
                }));
                
                // 執行冰雹術攻擊動畫
                performAttackAnimation(attackerRow, attackerCol, hailRow, hailCol, () => {
                  // 動畫完成後更新血量
                  setPieceStates(prev => ({
                    ...prev,
                    [hailKey]: {
                      ...prev[hailKey],
                      health: hailNewHealth,
                      hasBeenAttacked: true,
                      isInjured: hailNewHealth < (prev[hailKey]?.maxHealth || getPieceMaxHealth(hailPiece))
                    }
                  }));
                  
                  // 檢查是否血量歸零，需要移除棋子
                  if (hailNewHealth <= 0) {
                    const newBoard = board.map(row => [...row]);
                    newBoard[hailRow][hailCol] = 'empty';
                    setBoard(newBoard);
                    
                    setPieceOwners(prev => {
                      const newOwners = { ...prev };
                      delete newOwners[hailKey];
                      
                      // 檢查遊戲是否結束
                      const gameEndResult = checkGameEnd(newBoard, newOwners);
                      if (gameEndResult.gameOver) {
                        Alert.alert(
                          '遊戲結束',
                          gameEndResult.winner === 'human' ? '你勝利了！' : 'AI勝利了！',
                          [
                            {
                              text: '確定',
                              onPress: () => {
                                console.log('遊戲結束:', gameEndResult.reason);
                              }
                            }
                          ]
                        );
                      }
                      
                      return newOwners;
                    });
                  }
                });
                
                // 2秒後移除冰雹效果
                setTimeout(() => {
                  setPieceStates(prev => ({
                    ...prev,
                    [hailKey]: {
                      ...prev[hailKey],
                      hailEffect: false
                    }
                  }));
                }, 2000);
                
              }
            }
          }
        });
        
      }
    }
    
    // 檢查攻擊者是否有光耀斬擊buff
    if (attackerState && attackerState.buffs) {
      const gloryStrikeBuff = attackerState.buffs.find(buff => 
        buff.type === 'glory_strike' && buff.endTurn > currentTurn
      );
      
      if (gloryStrikeBuff) {
        console.log('光耀斬擊效果：驅散敵方增益並造成額外傷害');
        
        // 驅散目標的所有增益
        if (targetState && targetState.buffs) {
          setPieceStates(prev => ({
            ...prev,
            [targetKey]: {
              ...prev[targetKey],
              buffs: prev[targetKey].buffs.filter(buff => 
                buff.type !== 'glory_strike' // 保留光耀斬擊本身
              )
            }
          }));
          
          console.log('光耀斬擊：已驅散目標的所有增益');
        }
        
        // 添加額外傷害
        actualDamage += gloryStrikeBuff.extraDamage || 50;
        console.log(`光耀斬擊：額外造成 ${gloryStrikeBuff.extraDamage || 50} 點傷害`);
        
        // 移除光耀斬擊buff（一次性效果）
        setPieceStates(prev => ({
          ...prev,
          [attackerKey]: {
            ...prev[attackerKey],
            buffs: prev[attackerKey].buffs.filter(buff => buff.type !== 'glory_strike')
          }
        }));
      }
    }
    
    // 檢查目標是否有尖刺戰甲buff，反彈傷害給攻擊者
    if (targetState && targetState.buffs) {
      const spikedArmorBuff = targetState.buffs.find(buff => 
        buff.type === 'spiked_armor' && buff.endTurn > currentTurn
      );
      
      if (spikedArmorBuff) {
        console.log('尖刺戰甲效果：反彈傷害給攻擊者');
        
        // 對攻擊者造成反彈傷害
        const attackerCurrentHealth = attackerState?.health || getPieceHealth(attackerPiece);
        const reflectedDamage = 50; // 反彈固定50點傷害
        const attackerNewHealth = Math.max(0, attackerCurrentHealth - reflectedDamage);
        
        setPieceStates(prev => ({
          ...prev,
          [attackerKey]: {
            ...prev[attackerKey],
            health: attackerNewHealth,
            hasBeenAttacked: true,
            isInjured: attackerNewHealth < (prev[attackerKey]?.maxHealth || getPieceMaxHealth(attackerPiece))
          }
        }));
        
        console.log(`尖刺戰甲反彈：攻擊者受到 ${reflectedDamage} 點反彈傷害`);
        
        // 強制重新渲染UI
        setForceUpdate(prev => prev + 1);
      }
    }
    
    // 如果血量歸零，敵人被擊敗
    if (newHealth <= 0) {
      return 'enemy_defeated';
    } else {
      return 'enemy_damaged';
    }
  };

  // 處理衝鋒突擊效果
  const handleChargeAssault = (attackerRow, attackerCol, targetRow, targetCol) => {
    // 衝鋒突擊：直接使用普通攻擊邏輯
    return handleCombat(attackerRow, attackerCol, targetRow, targetCol);
  };

  const executeMove = (fromRow, fromCol, toRow, toCol) => {
    const piece = board[fromRow][fromCol];
    const targetPiece = board[toRow][toCol];
    
    if (targetPiece === 'empty') {
      // 移動到空位置
      const newBoard = board.map(row => [...row]);
      newBoard[toRow][toCol] = piece;
      newBoard[fromRow][fromCol] = 'empty';
      setBoard(newBoard);
      
      const newKey = `${toRow}-${toCol}`;
      const oldKey = `${fromRow}-${fromCol}`;
      
      // 更新棋子狀態追蹤
      setPieceStates(prev => {
        const newStates = { ...prev };
        if (newStates[oldKey]) {
          // 深拷貝棋子狀態，包括buffs和debuffs數組
          newStates[newKey] = { 
            ...newStates[oldKey],
            hasMoved: true, // 標記為已移動
            buffs: newStates[oldKey].buffs ? [...newStates[oldKey].buffs] : [],
            debuffs: newStates[oldKey].debuffs ? [...newStates[oldKey].debuffs] : []
          };
          console.log(`棋子移動: [${fromRow},${fromCol}] -> [${toRow},${toCol}], 設置hasMoved: true`);
          delete newStates[oldKey];
        }
        return newStates;
      });
      
      // 更新棋子擁有者資訊 - 移動的棋子保持原有擁有者
      setPieceOwners(prev => {
        const newOwners = { ...prev };
        if (newOwners[oldKey]) {
          newOwners[newKey] = newOwners[oldKey];
          delete newOwners[oldKey];
        } else {
        }
        return newOwners;
      });
      
      return 'moved';
    } else if (targetPiece !== 'empty' && getPiecePlayer(toRow, toCol) === currentPlayer) {
      // 檢查是否可以穿過己方棋子（騎士特殊能力）
      const specialRules = getPieceSpecialRules(piece);
      if (specialRules.canMoveThroughAllies) {
        // 騎士可以穿過己方棋子，移動到該位置
        const newBoard = board.map(row => [...row]);
        newBoard[toRow][toCol] = piece;
        newBoard[fromRow][fromCol] = 'empty';
        setBoard(newBoard);
        
        const newKey = `${toRow}-${toCol}`;
        const oldKey = `${fromRow}-${fromCol}`;
        
        // 更新棋子狀態追蹤
        setPieceStates(prev => {
          const newStates = { ...prev };
          if (newStates[oldKey]) {
            // 深拷貝棋子狀態，包括buffs和debuffs數組
            newStates[newKey] = { 
              ...newStates[oldKey],
              hasMoved: true, // 標記為已移動
              buffs: newStates[oldKey].buffs ? [...newStates[oldKey].buffs] : [],
              debuffs: newStates[oldKey].debuffs ? [...newStates[oldKey].debuffs] : []
            };
            console.log(`棋子移動(穿過友方): [${fromRow},${fromCol}] -> [${toRow},${toCol}], 設置hasMoved: true`);
            delete newStates[oldKey];
          }
          return newStates;
        });
        
        // 更新棋子擁有者資訊 - 移動的棋子保持原有擁有者
        setPieceOwners(prev => {
          const newOwners = { ...prev };
          if (newOwners[oldKey]) {
            newOwners[newKey] = newOwners[oldKey];
            delete newOwners[oldKey];
          }
          return newOwners;
        });
        
        return 'moved_through_ally';
      } else {
        // 不能穿過己方棋子
        return 'invalid';
      }
    } else if (isEnemyPiece(toRow, toCol)) {
      // 檢查是否有衝鋒突擊效果
      const attackerKey = `${fromRow}-${fromCol}`;
      const attackerState = pieceStates[attackerKey];
      const hasChargeAssault = attackerState && attackerState.buffs && 
        attackerState.buffs.find(buff => buff.type === 'charge_assault' && buff.endTurn > currentTurn);
      
      console.log('檢查衝鋒突擊：攻擊者狀態=', attackerState, '當前回合=', currentTurn, '有衝鋒突擊=', !!hasChargeAssault);
      
      if (hasChargeAssault) {
        console.log('衝鋒突擊觸發：從[', fromRow, ',', fromCol, '] 攻擊 [', toRow, ',', toCol, ']');
        // 衝鋒突擊：撞擊敵人並處理特殊效果
        return handleChargeAssault(fromRow, fromCol, toRow, toCol);
      } else {
        console.log('普通攻擊：從[', fromRow, ',', fromCol, '] 攻擊 [', toRow, ',', toCol, ']');
        // 普通攻擊
        const combatResult = handleCombat(fromRow, fromCol, toRow, toCol);
        
        if (combatResult === 'enemy_damaged') {
          // 攻擊方不移動，只對敵方造成傷害
          return 'attacked';
        } else if (combatResult === 'enemy_defeated') {
          // 敵人血量歸零，從棋盤上移除，攻擊方仍然留在原地
          const newBoard = board.map(row => [...row]);
          newBoard[toRow][toCol] = 'empty'; // 敵人被移除，位置變空
          setBoard(newBoard);
        
          const targetKey = `${toRow}-${toCol}`;
        
        // 移除被擊敗的敵人
        setPieceStates(prev => {
          const newStates = { ...prev };
          delete newStates[targetKey];
          return newStates;
        });
        
        setPieceOwners(prev => {
          const newOwners = { ...prev };
          delete newOwners[targetKey];
          
          // 立即檢查遊戲是否結束（在狀態更新後）
          console.log('=== 立即檢查遊戲結束 ===');
          console.log('被擊敗的棋子位置:', targetKey);
          const gameEndResult = checkGameEnd(newBoard, newOwners);
          console.log('遊戲結束檢查結果:', gameEndResult);
          
          if (gameEndResult.gameOver) {
            console.log('觸發遊戲結束！');
            Alert.alert(
              '遊戲結束',
              gameEndResult.winner === 'human' ? '你勝利了！' : 'AI勝利了！',
              [
                {
                  text: '確定',
                  onPress: () => {
                    console.log('遊戲結束:', gameEndResult.reason);
                  }
                }
              ]
            );
          } else {
            console.log('遊戲繼續');
          }
          
          return newOwners;
        });
        
        return 'attacked';
        }
      }
    }
    
    return 'invalid';
  };

  // 檢查遊戲結束條件
  const checkGameEnd = (customBoard = null, customPieceOwners = null) => {
    const currentBoard = customBoard || board;
    const currentPieceOwners = customPieceOwners || pieceOwners;
    
    // 檢查是否還有英雄型棋子
    const hasHero = (player) => {
      console.log(`檢查 ${player} 的英雄:`);
      for (let row = 0; row < BOARD_SIZE; row++) {
        for (let col = 0; col < BOARD_SIZE; col++) {
          const piece = currentBoard[row][col];
          const pieceKey = `${row}-${col}`;
          const pieceOwner = currentPieceOwners[pieceKey];
          
          // 只檢查非空且有歸屬權的棋子
          if (piece !== 'empty' && pieceOwner === player) {
            console.log(`  [${row},${col}] piece=${piece}, owner=${pieceOwner}`);
            // 檢查是否為英雄型棋子
            if (getPieceCategory(piece) === 'hero') {
              // 檢查英雄的生命值
              const pieceState = pieceStates[pieceKey];
              const currentHealth = pieceState?.health || getPieceHealth(piece);
              console.log(`    英雄生命值: ${currentHealth}`);
              
              // 只有生命值大於0的英雄才算存在
              if (currentHealth > 0) {
                console.log(`    英雄存活: ${piece}`);
                return true;
              } else {
                console.log(`    英雄已摧毀: ${piece}`);
              }
            }
          }
        }
      }
      console.log(`  ${player} 沒有英雄`);
      return false;
    };

    // 檢查是否還有城堡
    const hasCastle = (player) => {
      console.log(`檢查 ${player} 的城堡:`);
      for (let row = 0; row < BOARD_SIZE; row++) {
        for (let col = 0; col < BOARD_SIZE; col++) {
          const piece = currentBoard[row][col];
          const pieceKey = `${row}-${col}`;
          const pieceOwner = currentPieceOwners[pieceKey];
          
          // 只檢查非空且有歸屬權的棋子
          if (piece !== 'empty' && pieceOwner === player) {
            console.log(`  [${row},${col}] piece=${piece}, owner=${pieceOwner}`);
            // 檢查是否為城堡
            if (piece === 'CASTLE') {
              // 檢查城堡的生命值
              const pieceState = pieceStates[pieceKey];
              const currentHealth = pieceState?.health || getPieceHealth('CASTLE');
              console.log(`    城堡生命值: ${currentHealth}`);
              
              // 只有生命值大於0的城堡才算存在
              if (currentHealth > 0) {
                console.log(`    城堡存活: ${piece}`);
                return true;
              } else {
                console.log(`    城堡已摧毀: ${piece}`);
              }
            }
          }
        }
      }
      console.log(`  ${player} 沒有城堡`);
      return false;
    };

    const humanHasHero = hasHero('human');
    const humanHasCastle = hasCastle('human');
    const aiHasHero = hasHero('ai');
    const aiHasCastle = hasCastle('ai');

    console.log(`勝利條件檢查: humanHasHero=${humanHasHero}, humanHasCastle=${humanHasCastle}, aiHasHero=${aiHasHero}, aiHasCastle=${aiHasCastle}`);

    // 失去任何一個英雄或城堡就立即失敗
    if (!humanHasHero) {
      console.log('人類失敗：沒有英雄');
      return { gameOver: true, winner: 'ai', reason: '人類的英雄被摧毀' };
    }
    if (!humanHasCastle) {
      console.log('人類失敗：沒有城堡');
      return { gameOver: true, winner: 'ai', reason: '人類的城堡被摧毀' };
    }
    if (!aiHasHero) {
      console.log('AI失敗：沒有英雄');
      return { gameOver: true, winner: 'human', reason: 'AI的英雄被摧毀' };
    }
    if (!aiHasCastle) {
      console.log('AI失敗：沒有城堡');
      return { gameOver: true, winner: 'human', reason: 'AI的城堡被摧毀' };
    }

    console.log('遊戲繼續：雙方都有英雄和城堡');
    return { gameOver: false };
  };

  // 簡單AI移動函數
  const getSimpleAIMove = () => {
    const aiPieces = [];
    for (let row = 0; row < BOARD_SIZE; row++) {
      for (let col = 0; col < BOARD_SIZE; col++) {
        if (board[row][col] !== 'empty' && getPiecePlayer(row, col) === 'ai') {
          aiPieces.push({ row, col, piece: board[row][col] });
        }
      }
    }
    
    
    const allMoves = [];
    aiPieces.forEach(({ row, col, piece }) => {
      // 使用簡化的移動邏輯，只考慮相鄰移動
      const directions = [[-1, 0], [1, 0], [0, -1], [0, 1]]; // 上下左右
      
      directions.forEach(([dRow, dCol]) => {
        const newRow = row + dRow;
        const newCol = col + dCol;
        
        if (isValidPosition(newRow, newCol)) {
          const targetPiece = board[newRow][newCol];
          if (targetPiece === 'empty') {
            // 可以移動到空位置
            allMoves.push({
              from: { row, col, piece },
              to: { row: newRow, col: newCol, type: 'move' }
            });
          } else if (getPiecePlayer(newRow, newCol) === 'human') {
            // 檢查目標是否有隱身狀態（暗影披風效果）
            const targetKey = `${newRow}-${newCol}`;
            const targetState = pieceStates[targetKey];
            let canAttack = true;
            
            if (targetState && targetState.buffs) {
              const shadowCloakBuff = targetState.buffs.find(buff => 
                buff.type === 'shadow_cloak' && buff.endTurn > currentTurn
              );
              
              if (shadowCloakBuff) {
                console.log(`AI跳過隱身目標: [${newRow},${newCol}] 敵方棋子 ${targetPiece} 處於隱身狀態`);
                canAttack = false; // 不能攻擊隱身的棋子
              }
            }
            
            if (canAttack) {
            // 可以攻擊敵方棋子
            allMoves.push({
              from: { row, col, piece },
              to: { row: newRow, col: newCol, type: 'attack' }
            });
            }
          }
        }
      });
    });
    
    if (allMoves.length === 0) {
      return null;
    }
    
    const attackMoves = allMoves.filter(move => move.to.type === 'attack');
    
    if (attackMoves.length > 0) {
      const selectedMove = attackMoves[Math.floor(Math.random() * attackMoves.length)];
      return selectedMove;
    } else {
      const selectedMove = allMoves[Math.floor(Math.random() * allMoves.length)];
      return selectedMove;
    }
  };

  const makeAIMove = () => {
    setTimeout(() => {
      // AI回合：只移動棋子，不出牌（測試階段）
      
      // 移動棋子
      setTimeout(() => {
        const aiMove = getSimpleAIMove();
        
        if (!aiMove) {
          // AI沒有可移動的棋子，增加回合數
          const newTurn = currentTurn + 1;
          setCurrentTurn(newTurn);
          
          // 處理技能效果後結束回合，傳入新的回合數
          processSkillEffects(newTurn);
          
          setCurrentPlayer('human');
          setIsAITurn(false);
          return;
        }
        
        const { from, to } = aiMove;
        
        // 檢查是否為攻擊（目標位置有敵方棋子）
        const targetPiece = board[to.row][to.col];
        const isAttack = targetPiece !== 'empty' && getPiecePlayer(to.row, to.col) !== 'ai';
        
        if (isAttack) {
          // AI攻擊時也使用攻擊動畫
          performAttackAnimation(from.row, from.col, to.row, to.col, () => {
            // 動畫完成後執行攻擊結果
            const result = executeMove(from.row, from.col, to.row, to.col);
            
            // 攻擊完成後檢查遊戲是否結束
            const gameEndResult = checkGameEnd();
            if (gameEndResult.gameOver) {
              Alert.alert(
                '遊戲結束',
                gameEndResult.winner === 'human' ? '你勝利了！' : 'AI勝利了！',
                [
                  {
                    text: '確定',
                    onPress: () => {
                      console.log('遊戲結束:', gameEndResult.reason);
                    }
                  }
                ]
              );
            } else {
              // AI回合結束，增加回合數
              const newTurn = currentTurn + 1;
              setCurrentTurn(newTurn);
              
              // 處理技能效果持續時間，傳入新的回合數
              processSkillEffects(newTurn);
              
              setCurrentPlayer('human');
              setIsAITurn(false);
            }
          });
        } else {
          // 普通移動
          executeMove(from.row, from.col, to.row, to.col);
          
          // 移動完成後檢查遊戲是否結束
          const gameEndResult = checkGameEnd();
          if (gameEndResult.gameOver) {
            Alert.alert(
              '遊戲結束',
              gameEndResult.winner === 'human' ? '你勝利了！' : 'AI勝利了！',
              [
                {
                  text: '確定',
                  onPress: () => {
                    console.log('遊戲結束:', gameEndResult.reason);
                  }
                }
              ]
            );
          } else {
            // AI回合結束，增加回合數
            const newTurn = currentTurn + 1;
            setCurrentTurn(newTurn);
            
            // 處理技能效果持續時間，傳入新的回合數
            processSkillEffects(newTurn);
            
            setCurrentPlayer('human');
            setIsAITurn(false);
          }
        }
      }, 2000); // 給AI出牌動畫更多時間（2秒）
    }, 800);
  };

  useEffect(() => {
    if (isAITurn && currentPlayer === 'ai') {
      const timer = setTimeout(() => {
        makeAIMove();
      }, 1000);
      
      return () => clearTimeout(timer);
    }
  }, [isAITurn, currentPlayer]);

  // 回合開始時恢復行動點，並抽卡
  useEffect(() => {
    // 每個回合開始時都恢復行動點
    setActionPoints(prev => ({ ...prev, current: prev.max }));
    
    // 玩家回合開始時抽卡
    if (currentPlayer === 'human') {
      drawCard('human');
    }
  }, [currentPlayer]);

  const handleCellPress = (row, col) => {
    if (isAITurn || currentPlayer === 'ai') {
      // 等待AI完成回合
      return;
    }
    
    // 如果正在選擇技能卡牌目標
    if (isSelectingTarget && pendingSkillCard) {
      const isValidTarget = skillTargets.some(target => target.row === row && target.col === col);
      if (isValidTarget) {
        // 應用技能效果
        const success = applySkillEffect(pendingSkillCard, row, col);
        if (success) {
          // 技能成功施放，清除選中狀態
          setPendingSkillCard(null);
          setIsSelectingTarget(false);
          setSkillTargets([]);
          setSelectedCard(null);
          setHasConsumedActionPoints(false);
        }
        return;
      } else {
        // 無效目標，顯示提示但不取消技能使用，讓玩家可以重新選擇
        Alert.alert('無效目標', '請選擇有效的目標棋子');
        return;
      }
    }
    
    const piece = board[row][col];
    
    if (selectedPiece && selectedPosition) {
      // 檢查是否為牆壁棋子（無法移動）
      const pieceKey = `${selectedPosition.row}-${selectedPosition.col}`;
      const pieceState = pieceStates[pieceKey];
      if (pieceState && (pieceState.isWall || pieceState.isDerivative)) {
        Alert.alert('無法移動', '牆壁衍生物無法移動');
        return;
      }
      
      // 使用新的規則系統檢查移動和攻擊
      const isValidMoveAction = isValidMove(selectedPiece, selectedPosition.row, selectedPosition.col, row, col, board, pieceOwners, currentPlayer, pieceStates);
      const isValidAttackAction = isValidAttack(selectedPiece, selectedPosition.row, selectedPosition.col, row, col, board, pieceOwners, currentPlayer, pieceStates);
      
      if (isValidMoveAction && piece === 'empty') {
          // 檢查是否有足夠的行動點
          if (!hasEnoughActionPoints('move')) {
            Alert.alert('行動點不足', '移動需要3點行動點');
            return;
          }
          
          const newBoard = board.map(row => [...row]);
          newBoard[row][col] = selectedPiece;
          newBoard[selectedPosition.row][selectedPosition.col] = 'empty';
          setBoard(newBoard);
          
          const newKey = `${row}-${col}`;
          const oldKey = `${selectedPosition.row}-${selectedPosition.col}`;
          setPieceStates(prev => {
            const newStates = { ...prev };
            if (newStates[oldKey]) {
              // 深拷貝棋子狀態，包括buffs和debuffs數組
              newStates[newKey] = { 
                ...newStates[oldKey],
                buffs: newStates[oldKey].buffs ? [...newStates[oldKey].buffs] : [],
                debuffs: newStates[oldKey].debuffs ? [...newStates[oldKey].debuffs] : []
              };
              delete newStates[oldKey];
            }
            return newStates;
          });
          
          // 更新棋子擁有者資訊 - 移動的棋子保持原有擁有者
          setPieceOwners(prev => {
            const newOwners = { ...prev };
            if (newOwners[oldKey]) {
              newOwners[newKey] = newOwners[oldKey];
              delete newOwners[oldKey];
            } else {
            }
            return newOwners;
          });
          
          // 消耗行動點
          consumeActionPoints('move');
          
          
          // 移動成功，不自動切換回合，等待玩家點擊結束回合按鈕
        } else if (isValidAttackAction && isEnemyPiece(row, col)) {
          
          // 檢查是否有足夠的行動點
          if (!hasEnoughActionPoints('attack')) {
            Alert.alert('行動點不足', '攻擊需要2點行動點');
            return;
          }
          
          // 使用executeMove函數處理攻擊，這樣可以觸發衝鋒突擊等特殊效果
          const result = executeMove(selectedPosition.row, selectedPosition.col, row, col);
          
          // 執行攻擊動畫
          performAttackAnimation(selectedPosition.row, selectedPosition.col, row, col, () => {
            // 動畫完成後處理結果
            if (result === 'attacked' || result === 'enemy_damaged_charge' || result === 'enemy_pushed_charge') {
              // 攻擊成功，消耗行動點
              consumeActionPoints('attack');
            } else if (result === 'enemy_defeated' || result === 'enemy_defeated_charge') {
              // 敵人被擊敗，消耗行動點
              consumeActionPoints('attack');
              
              // 檢查遊戲是否結束
              const gameEndResult = checkGameEnd();
                if (gameEndResult.gameOver) {
                  Alert.alert(
                    '遊戲結束',
                    gameEndResult.winner === 'human' ? '你勝利了！' : 'AI勝利了！',
                    [
                      {
                        text: '確定',
                        onPress: () => {
                          // 遊戲結束處理
                        }
                      }
                    ]
                  );
                }
            }
          });
        } else {
          // 不能攻擊己方棋子
        }
      
      setSelectedPiece(null);
      setSelectedPosition(null);
    } else if (piece !== 'empty' && !isEnemyPiece(row, col)) {
      // 檢查是否為牆壁衍生物（無法選擇）
      const pieceKey = `${row}-${col}`;
      const pieceState = pieceStates[pieceKey];
      if (pieceState && (pieceState.isWall || pieceState.isDerivative)) {
        Alert.alert('無法選擇', '牆壁衍生物無法被選擇');
        return;
      }
      
      setSelectedPiece(piece);
      setSelectedPosition({ row, col });
      // 已選擇棋子
    } else if (piece !== 'empty' && isEnemyPiece(row, col)) {
      // 不能選擇敵方棋子
    } else if (piece === 'empty') {
      // 點擊空格子，可以選擇位置（用於調試）
      setSelectedPiece(null);
      setSelectedPosition({ row, col });
    }
  };

  // 棋子組件
  const Piece3D = ({ piece, row, col, isSelected, isHighlighted, currentTurn, pieceStates }) => {
    // 檢查是否為攻擊動畫中的棋子
    const isAttacking = attackAnimation && 
      attackAnimation.from.row === row && 
      attackAnimation.from.col === col;
    
    const isBeingAttacked = attackAnimation && 
      attackAnimation.to.row === row && 
      attackAnimation.to.col === col;
    
    // 檢查是否有冰雹效果
    const hasHailEffect = pieceStates[`${row}-${col}`]?.hailEffect;
    
    // 檢查是否有雷電效果
    const hasLightningEffect = pieceStates[`${row}-${col}`]?.lightningEffect;
    if (piece === 'empty') {
      return (
        <TouchableOpacity
          style={[
            styles.cell,
            {
              backgroundColor: isHighlighted ? '#85C1E9' : 
                (row + col) % 2 === 0 ? '#F5DEB3' : '#8B4513',
              width: CELL_SIZE,
              height: CELL_SIZE,
            },
          ]}
          onPress={() => handleCellPress(row, col)}
        />
      );
    }

    // 檢查是否為技能目標
    const isSkillTarget = isSelectingTarget && pendingSkillCard && skillTargets.some(target => target.row === row && target.col === col);

    return (
      <TouchableOpacity
        style={[
          styles.cell,
          {
            backgroundColor: isSkillTarget ? '#FFD700' : // 技能目標用黃色背景
              isHighlighted ? '#E74C3C' : // 普通高亮用紅色背景
              (row + col) % 2 === 0 ? '#F5DEB3' : '#8B4513',
            width: CELL_SIZE,
            height: CELL_SIZE,
          },
        ]}
        onPress={() => handleCellPress(row, col)}
        activeOpacity={0.8}
      >
        <View style={[
          styles.pieceContainer,
          isAttacking && styles.attackingPiece,
          isBeingAttacked && styles.beingAttackedPiece
        ]}>
          <PieceManager 
            piece={piece}
            isSelected={isSelected}
            isHighlighted={isHighlighted && !isSkillTarget} // 技能目標時不使用普通高亮
            isSkillTarget={isSkillTarget}
            currentHealth={pieceStates[`${row}-${col}`]?.health}
            maxHealth={pieceStates[`${row}-${col}`]?.maxHealth}
            isPlayerPiece={getPiecePlayer(row, col) === 'human'}
            skillEffects={pieceStates[`${row}-${col}`]} // 傳入技能效果狀態
            currentTurn={currentTurn}
          />
          {/* 冰雹效果顯示 */}
          {hasHailEffect && (
            <View style={styles.hailEffectOverlay}>
              <Text style={styles.hailIcon}>❄️</Text>
            </View>
          )}
          
          {/* 雷電效果顯示 */}
          {hasLightningEffect && (
            <View style={styles.lightningEffectOverlay}>
              <Text style={styles.lightningIcon}>⚡</Text>
            </View>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  // 載入畫面檢查
  if (isLoading) {
    return (
      <View style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingTitle}>戰棋大師</Text>
          <Text style={styles.loadingText}>載入中...</Text>
          <View style={styles.loadingSpinner}>
            <Text style={styles.spinnerText}>⚔️</Text>
          </View>
        </View>
      </View>
    );
  }

  return (
    <View style={[
      styles.container,
      screenShake && styles.screenShake
    ]}>
      {/* 返回按鈕 */}
      <TouchableOpacity style={styles.backButton} onPress={onBack}>
        <View style={styles.backIcon}>
          <Text style={styles.backIconText}>←</Text>
        </View>
        <Text style={styles.backText}>返回</Text>
      </TouchableOpacity>
      
      <Text style={styles.title}>戰棋大師</Text>
      
      {/* 檢測受傷棋子按鈕 */}
      {addInjuredCheckButton()}
      
      
      <View style={styles.turnIndicator}>
        <Text style={[
          styles.currentPlayer,
          { color: currentPlayer === 'human' ? '#2ECC71' : '#E74C3C' }
        ]}>
          {currentPlayer === 'human' ? '👤 玩家回合' : '🤖 AI回合'}
        </Text>
        {isAITurn && (
          <Text style={styles.aiThinking}>AI思考中...</Text>
        )}
        
        {/* 當前回合數顯示 */}
        <View style={styles.turnDisplay}>
          <Text style={styles.turnLabel}>回合</Text>
          <Text style={styles.turnNumber}>{currentTurn}</Text>
        </View>
      </View>

      {/* 簡化的棋盤容器 */}
      <View style={styles.boardContainer}>
        {/* 棋盤主體 */}
        <View style={styles.boardWithCoordinates}>
          <View style={styles.board}>
            {board.map((row, rowIndex) => (
              <View key={rowIndex} style={styles.row}>
                {row.map((piece, colIndex) => (
                  <Piece3D
                    key={`${rowIndex}-${colIndex}`}
                    piece={piece}
                    row={rowIndex}
                    col={colIndex}
                    isSelected={selectedPosition && selectedPosition.row === rowIndex && selectedPosition.col === colIndex}
                    currentTurn={currentTurn}
                    pieceStates={pieceStates}
                    isHighlighted={(() => {
                      // 如果正在選擇技能卡牌目標
                      if (isSelectingTarget && pendingSkillCard) {
                        return skillTargets.some(target => target.row === rowIndex && target.col === colIndex);
                      }
                      
                      // 如果選中的是空格子，不顯示高亮
                      if (!selectedPiece || !selectedPosition) {
                        return false;
                      }
                      
                      const isValidMoveAction = isValidMove(selectedPiece, selectedPosition.row, selectedPosition.col, rowIndex, colIndex, board, pieceOwners, currentPlayer, pieceStates);
                      const isValidAttackAction = isValidAttack(selectedPiece, selectedPosition.row, selectedPosition.col, rowIndex, colIndex, board, pieceOwners, currentPlayer, pieceStates);
                      const isEnemy = getPiecePlayer(rowIndex, colIndex) !== currentPlayer;
                      
                      // 如果這個位置有友方棋子，不顯示任何提示
                      if (board[rowIndex][colIndex] !== 'empty' && !isEnemy) {
                        return false;
                      }
                      
                      const result = isValidMoveAction || (isValidAttackAction && isEnemy);
                      return result;
                    })()}
                  />
                ))}
              </View>
            ))}
          </View>
          
          {/* 選擇目標提示 */}
          {isSelectingTarget && pendingSkillCard && hasConsumedActionPoints && (
            <View style={styles.targetSelectionHint}>
              <Text style={styles.targetSelectionText}>
                請選擇目標棋子或格子
              </Text>
              <TouchableOpacity 
                style={styles.cancelButton}
                onPress={() => {
                  setSelectedCard(null);
                  setPendingSkillCard(null);
                  setIsSelectingTarget(false);
                  setSkillTargets([]);
                  setHasShownSkillError(false);
                  setHasConsumedActionPoints(false);
                }}
              >
                <Text style={styles.cancelButtonText}>✕</Text>
              </TouchableOpacity>
            </View>
          )}
          
        </View>
      </View>

      {/* 卡牌系統 */}
      <CardSystem
        playerHand={playerHand}
        enemyHand={enemyHand}
        playerDeck={playerCardDeck}
        enemyDeck={enemyCardDeck}
        onPlayCard={playCard}
        onDrawCard={drawCard}
        selectedCard={selectedCard}
        onRemoveCard={removeCard}
        onEndTurn={handleEndTurn}
        currentPlayer={currentPlayer}
        aiPlayedCard={aiPlayedCard}
        showAiPlayedCard={showAiPlayedCard}
        actionPoints={actionPoints}
      />
      
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a1a', // 深色背景
    alignItems: 'center',
    paddingTop: 50,
  },
  // 載入畫面樣式
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
  },
  loadingTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFD700',
    marginBottom: 20,
    textShadowColor: 'rgba(255, 215, 0, 0.5)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 10,
  },
  loadingText: {
    fontSize: 18,
    color: '#FFFFFF',
    marginBottom: 30,
    opacity: 0.8,
  },
  loadingSpinner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255, 215, 0, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFD700',
  },
  spinnerText: {
    fontSize: 24,
    color: '#FFD700',
  },
  backButton: {
    position: 'absolute',
    top: 50,
    left: 10,
    zIndex: 99999,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 15,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderRadius: 25,
  },
  backIcon: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  backIconText: {
    fontSize: 18,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  backText: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '500',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFD700', // 金色標題
    marginBottom: 10,
    textShadowColor: 'rgba(255, 215, 0, 0.5)',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 4,
  },
  turnIndicator: {
    alignItems: 'center',
    marginBottom: 20,
    zIndex: 10,
    position: 'relative',
  },
  turnDisplay: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: '#2C3E50',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FFD700',
  },
  turnLabel: {
    color: '#FFD700',
    fontSize: 10,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  turnNumber: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  currentPlayer: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  aiThinking: {
    fontSize: 14,
    color: '#F39C12',
    fontStyle: 'italic',
    marginTop: 5,
  },
  boardContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    paddingBottom: 100,
  },
  rowCoordinates: {
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 5,
    height: CELL_SIZE * BOARD_SIZE,
  },
  boardWithCoordinates: {
    flexDirection: 'column',
    alignItems: 'center',
  },
  columnCoordinates: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 5,
    width: CELL_SIZE * BOARD_SIZE,
  },
  coordinateText: {
    color: '#FFD700',
    fontSize: 12,
    fontWeight: 'bold',
    textAlign: 'center',
    width: CELL_SIZE,
    height: CELL_SIZE,
    lineHeight: CELL_SIZE,
  },
  board: {
    borderWidth: 2,
    borderColor: '#000',
    width: CELL_SIZE * BOARD_SIZE,
    height: CELL_SIZE * BOARD_SIZE,
  },
  row: {
    flexDirection: 'row',
    position: 'relative',
  },
  cell: {
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#000',
    width: CELL_SIZE,
    height: CELL_SIZE,
  },
  cellText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
  },
  pieceContainer: {
    position: 'relative',
    width: CELL_SIZE * 0.95,
    height: CELL_SIZE * 0.95,
    overflow: 'visible',
  },
  // 攻擊動畫樣式
  attackingPiece: {
    transform: [{ scale: 1.5 }], // 放大更多
    zIndex: 1000,
    elevation: 20,
  },
  beingAttackedPiece: {
    transform: [{ scale: 0.7 }], // 縮小更多
    zIndex: 999,
    shadowColor: '#FF0000',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1.0,
    shadowRadius: 30, // 更大的紅色光暈
    elevation: 19,
    borderWidth: 4, // 添加邊框
    borderColor: '#FF0000',
    borderRadius: 10,
  },
  // 冰雹效果樣式
  hailEffectOverlay: {
    position: 'absolute',
    top: -15,
    left: -15,
    right: -15,
    bottom: -15,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
    pointerEvents: 'none',
  },
  hailIcon: {
    fontSize: 30,
    color: '#87CEEB',
    textShadowColor: '#87CEEB',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },
  // 雷電效果樣式
  lightningEffectOverlay: {
    position: 'absolute',
    top: -15,
    left: -15,
    right: -15,
    bottom: -15,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
    pointerEvents: 'none',
  },
  lightningIcon: {
    fontSize: 30,
    color: '#FFD700',
    textShadowColor: '#FFD700',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },
  // 震動效果樣式
  screenShake: {
    transform: [
      { translateX: 5 },
      { translateY: -3 }
    ],
  },
  // 選擇目標提示樣式
  targetSelectionHint: {
    backgroundColor: 'rgba(255, 215, 0, 0.9)',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 6,
    marginHorizontal: 20,
    marginVertical: 8,
    borderWidth: 2,
    borderColor: '#FFD700',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  targetSelectionText: {
    color: '#000000',
    fontSize: 14,
    fontWeight: 'bold',
    flex: 1,
    textAlign: 'center',
  },
  cancelButton: {
    backgroundColor: '#FF4444',
    borderRadius: 15,
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
  },
  cancelButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default ChessBoard3D;
