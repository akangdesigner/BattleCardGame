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
    name: '士兵', 
    color: '#8B4513', // 棕色
    darkColor: '#654321',
    symbol: 'S',
    material: 'bronze',
    category: '基礎型',
    skill: '基礎近戰攻擊，移動範圍小但穩定',
    description: '忠誠的士兵，基礎戰鬥單位，穩定可靠',
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
  
  // 卡牌系統狀態
  const [playerHand, setPlayerHand] = useState([]);
  const [enemyHand, setEnemyHand] = useState([]);
  const [playerCardDeck, setPlayerCardDeck] = useState([]);
  const [enemyCardDeck, setEnemyCardDeck] = useState([]);
  const [selectedCard, setSelectedCard] = useState(null);
  
  // 行動點系統
  const [actionPoints, setActionPoints] = useState({ 
    current: 11, 
    max: 11 
  });
  
  // AI出牌動畫狀態
  const [aiPlayedCard, setAiPlayedCard] = useState(null);
  const [showAiPlayedCard, setShowAiPlayedCard] = useState(false);
  
  // 技能卡牌使用狀態
  const [pendingSkillCard, setPendingSkillCard] = useState(null);
  const [isSelectingTarget, setIsSelectingTarget] = useState(false);
  const [skillTargets, setSkillTargets] = useState([]);
  const [hasShownSkillError, setHasShownSkillError] = useState(false);

  // 當初始棋組改變時更新棋盤上的棋子
  useEffect(() => {
    if (initialPlayerDeck && initialPlayerDeck.pieces && Array.isArray(initialPlayerDeck.pieces) && initialPlayerDeck.pieces.length === 6) {
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
      
      console.log('棋組載入調試信息:');
      console.log('frontRowPieces:', frontRowPieces);
      console.log('backRowPieces:', backRowPieces);
      console.log('specialPieces:', specialPieces);
      console.log('heroPieces:', heroPieces);
      console.log('structurePieces:', structurePieces);
      
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
      // AI棋子：弓箭手、螃蟹、城堡、心智扭曲者
      newBoard[1][2] = 'A'; // AI弓箭手
      newBoard[1][4] = 'CC'; // AI螃蟹
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
            newPieceStates[pieceKey] = {
              hasMoved: false,
              health: getPieceHealth(piece),
              maxHealth: getPieceMaxHealth(piece),
              attackPower: getPieceAttackPower(piece),
              defense: 25,
              specialAbilityUsed: false,
              isStunned: false,
              isPoisoned: false,
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
      
      // 棋盤初始化完成，設置載入完成狀態
      setTimeout(() => {
        setIsLoading(false);
      }, 500); // 給一點時間讓動畫完成
    }
  
  }, []); // 只在組件首次加載時執行，不依賴initialPlayerDeck

  // 初始化卡牌系統
  useEffect(() => {
    const allCards = Object.values(SKILL_CARDS);
    const shuffledCards = [...allCards].sort(() => Math.random() - 0.5);
    
    // 由於只有7張技能卡片，我們需要重複使用
    const repeatedCards = [];
    for (let i = 0; i < 6; i++) {
      repeatedCards.push(...shuffledCards);
    }
    
    setPlayerCardDeck(repeatedCards.slice(0, 15));
    setEnemyCardDeck(repeatedCards.slice(15, 30));
    setPlayerHand(repeatedCards.slice(30, 35));
    setEnemyHand(repeatedCards.slice(35, 40));
  }, []);

  // 檢查玩家是否擁有技能卡牌所需的棋子
  const hasRequiredPieces = (card) => {
    if (!card || !card.requiredPieces) return true;
    
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
        // 如果點擊已選中的卡片，取消選中
        setSelectedCard(null);
        setPendingSkillCard(null);
        setIsSelectingTarget(false);
        setSkillTargets([]);
        setHasShownSkillError(false); // 重置錯誤提示狀態
      } else if (isSelectingTarget && pendingSkillCard) {
        // 如果正在選擇目標，則取消技能使用
        setSelectedCard(null);
        setPendingSkillCard(null);
        setIsSelectingTarget(false);
        setSkillTargets([]);
        setHasShownSkillError(false); // 重置錯誤提示狀態
      } else {
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
        
        // 如果點擊未選中的卡片，則選中它並進入目標選擇模式
        setSelectedCard(card);
        setPendingSkillCard(card);
        setIsSelectingTarget(true);
        setSkillTargets(getValidTargets(card));
      }
    }
  };

  // 獲取技能卡牌的有效目標
  const getValidTargets = (card) => {
    if (!card || !card.type) return [];
    
    const targets = [];
    
    // 遍歷棋盤找到有效目標
    for (let row = 0; row < BOARD_SIZE; row++) {
      for (let col = 0; col < BOARD_SIZE; col++) {
        const piece = board[row][col];
        if (piece === 'empty') continue;
        
        const pieceKey = `${row}-${col}`;
        const pieceOwner = pieceOwners[pieceKey];
        
        // 根據技能卡牌類型確定有效目標
        switch (card.type) {
          case 'basic_melee_shared':
            // 基礎近戰共用技能：只能對己方的對應棋子使用
            if (pieceOwner === 'human' && card.requiredPieces.includes(piece)) {
              targets.push({ row, col, piece, owner: pieceOwner });
            }
            break;
          case 'ranged_exclusive':
            // 遠程專屬：只能對己方遠程單位使用
            if (pieceOwner === 'human' && card.requiredPieces.includes(piece)) {
              targets.push({ row, col, piece, owner: pieceOwner });
            }
            break;
          case 'mage_exclusive':
            // 魔法師專屬：只能對己方魔法師使用
            if (pieceOwner === 'human' && card.requiredPieces.includes(piece)) {
              targets.push({ row, col, piece, owner: pieceOwner });
            }
            break;
          case 'assassin_exclusive':
            // 刺客專屬：只能對己方刺客使用
            if (pieceOwner === 'human' && card.requiredPieces.includes(piece)) {
              targets.push({ row, col, piece, owner: pieceOwner });
            }
            break;
          case 'knight_exclusive':
            // 騎士專屬：可以對敵方棋子使用
            if (card.id === 'CHARGE_ATTACK') {
              if (pieceOwner !== 'human' && piece !== 'empty') {
                targets.push({ row, col, piece, owner: pieceOwner });
              }
            } else {
              // 其他騎士技能：只能對己方騎士使用
              if (pieceOwner === 'human' && card.requiredPieces.includes(piece)) {
                targets.push({ row, col, piece, owner: pieceOwner });
              }
            }
            break;
          case 'priest_exclusive':
            // 牧師專屬：只能對己方棋子使用
            if (pieceOwner === 'human' && piece !== 'empty') {
              targets.push({ row, col, piece, owner: pieceOwner });
            }
            break;
          case 'architect_exclusive':
            // 戰爭建築師專屬：只能對己方棋子使用
            if (pieceOwner === 'human' && piece !== 'empty') {
              targets.push({ row, col, piece, owner: pieceOwner });
            }
            break;
          case 'mind_controller_exclusive':
            // 心靈控制者專屬：可以對敵方基礎單位使用
            if (card.id === 'DEATH_CURSE') {
              const pieceCategory = getPieceCategory(piece);
              if (pieceCategory === 'basic' && pieceOwner !== 'human') {
                targets.push({ row, col, piece, owner: pieceOwner });
              }
            } else {
              // 其他心靈控制者技能：只能對己方心智扭曲者使用
              if (pieceOwner === 'human' && card.requiredPieces.includes(piece)) {
                targets.push({ row, col, piece, owner: pieceOwner });
              }
            }
            break;
          default:
            // 默認：只能對己方的對應棋子使用
            if (pieceOwner === 'human' && card.requiredPieces.includes(piece)) {
              targets.push({ row, col, piece, owner: pieceOwner });
            }
        }
      }
    }
    
    return targets;
  };

  // 應用技能效果
  const applySkillEffect = (card, targetRow, targetCol) => {
    if (!card || !targetRow || !targetCol) return false;
    
    const pieceKey = `${targetRow}-${targetCol}`;
    const targetPiece = board[targetRow][targetCol];
    
    switch (card.id) {
      case 'HOLY_SHIELD':
        // 聖盾術：抵擋下一次所受傷害
        setPieceStates(prev => ({
          ...prev,
          [pieceKey]: {
            ...prev[pieceKey],
            buffs: [...(prev[pieceKey]?.buffs || []), { type: 'holy_shield', endTurn: currentTurn + 2 }]
          }
        }));
        break;
        
      case 'SPIKED_ARMOR':
        // 尖刺戰甲：下回合若被近戰攻擊，反彈同等傷害
        setPieceStates(prev => ({
          ...prev,
          [pieceKey]: {
            ...prev[pieceKey],
            buffs: [...(prev[pieceKey]?.buffs || []), { type: 'spiked_armor', endTurn: currentTurn + 2 }]
          }
        }));
        break;
        
          case 'BURNING_ARROW':
            // 燃燒箭：為己方弓箭手或弩手添加燃燒箭效果，下一次攻擊會造成燃燒
            setPieceStates(prev => ({
              ...prev,
              [pieceKey]: {
                ...prev[pieceKey],
                buffs: [...(prev[pieceKey]?.buffs || []), { type: 'burning_arrow', endTurn: currentTurn + 2 }]
              }
            }));
            break;
        
      case 'LIGHTNING_BOLT':
        // 落雷術：以攻擊格為中心，額外對前後格造成同等傷害
        applyAreaDamage(targetRow, targetCol, 'lightning');
        break;
        
      case 'HAIL_STORM':
        // 冰雹術：以攻擊格為中心，額外對左右格造成同等傷害
        applyAreaDamage(targetRow, targetCol, 'hail');
        break;
        
      case 'SHADOW_CLOAK':
        // 飛影披風：隱身一回合，不可被指定為攻擊或技能目標
        setPieceStates(prev => ({
          ...prev,
          [pieceKey]: {
            ...prev[pieceKey],
            buffs: [...(prev[pieceKey]?.buffs || []), { type: 'shadow_cloak', endTurn: currentTurn + 2 }]
          }
        }));
        break;
        
      case 'DEATH_CURSE':
        // 死亡詛咒：指定一名基礎單位，該單位在下一回合結束時死亡
        setPieceStates(prev => ({
          ...prev,
          [pieceKey]: {
            ...prev[pieceKey],
            debuffs: [...(prev[pieceKey]?.debuffs || []), { type: 'death_curse', endTurn: currentTurn + 2 }]
          }
        }));
        break;
        
      case 'CHARGE_ATTACK':
        // 衝鋒攻擊：騎士移動到敵方位置並造成額外傷害
        const attackPower = getPieceAttackPower('K');
        const currentHealth = pieceStates[pieceKey]?.health || getPieceHealth(targetPiece);
        const newHealth = Math.max(0, currentHealth - attackPower * 1.5);
        
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
        break;
        
      case 'HEALING_PRAYER':
        // 治療禱告：恢復目標棋子100點生命值
        const maxHealth = getPieceHealth(targetPiece);
        const currentHealthForHeal = pieceStates[pieceKey]?.health || maxHealth;
        const healedHealth = Math.min(maxHealth, currentHealthForHeal + 100);
        
        setPieceStates(prev => ({
          ...prev,
          [pieceKey]: {
            ...prev[pieceKey],
            health: healedHealth
          }
        }));
        break;
        
      case 'DEFENSIVE_WALL':
        // 防禦牆：為己方棋子提供額外防禦力
        setPieceStates(prev => ({
          ...prev,
          [pieceKey]: {
            ...prev[pieceKey],
            buffs: [...(prev[pieceKey]?.buffs || []), { type: 'defensive_wall', endTurn: currentTurn + 2, defense: 50 }]
          }
        }));
        break;
        
      default:
        console.log('未知技能卡牌:', card.id);
        return false;
    }
    
    // 消耗行動點
    consumeActionPoints('card', card.cost);
    
    // 移除手牌
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
            const attackPower = getPieceAttackPower(board[centerRow][centerCol]);
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
            debuff.type === 'death_curse' && debuff.duration === 1
          );
          
          deathCurses.forEach(curse => {
            // 執行死亡詛咒效果
            const [row, col] = pieceKey.split('-').map(Number);
            const piece = board[row][col];
            if (piece !== 'empty') {
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
      console.log(`消耗行動點: ${actionType} 消耗 ${actualCost} 點，剩餘 ${newPoints} 點`);
      return { ...prev, current: newPoints };
    });
    
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
    initialBoard[6][1] = 'S'; // 玩家士兵
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

  // 初始化棋子擁有者
  useEffect(() => {
    const owners = {};
    for (let row = 0; row < BOARD_SIZE; row++) {
      for (let col = 0; col < BOARD_SIZE; col++) {
        const piece = board[row][col];
        if (piece !== 'empty') {
          // 根據初始位置設定擁有者，這個不會改變（行0-1是AI，行5-7是玩家）
          owners[`${row}-${col}`] = row <= 1 ? 'ai' : 'human';
        }
      }
    }
    setPieceOwners(owners);
  }, [board]);

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
    
    // 如果沒有記錄但有棋子，根據初始位置判斷（僅用於初始化）（行0-1是AI，行5-7是玩家）
    return row <= 1 ? 'ai' : 'human';
  };

  const isEnemyPiece = (row, col) => {
    // 如果該位置沒有棋子，不是敵方棋子
    if (board[row][col] === 'empty') {
      return false;
    }
    
    // 普通棋子（包括城堡）
    const piecePlayer = getPiecePlayer(row, col);
    return piecePlayer !== currentPlayer;
  };

  const handleCombat = (attackerRow, attackerCol, targetRow, targetCol) => {
    // 普通棋子戰鬥邏輯
    const attackerPiece = board[attackerRow][attackerCol];
    const targetPiece = board[targetRow][targetCol];
    const targetKey = `${targetRow}-${targetCol}`;
    const attackerKey = `${attackerRow}-${attackerCol}`;
    const targetState = pieceStates[targetKey];
    const attackerState = pieceStates[attackerKey];
    
    // 獲取攻擊力
    const attackPower = attackerState?.attackPower || getPieceAttackPower(attackerPiece);
    
    // 計算新血量
    const currentHealth = targetState?.health || getPieceHealth(targetPiece);
    const newHealth = currentHealth - attackPower;
    
    // 更新目標血量
    setPieceStates(prev => ({
      ...prev,
      [targetKey]: {
        ...prev[targetKey],
        health: Math.max(0, newHealth), // 確保血量不會低於0
        hasBeenAttacked: true
      }
    }));
    
    // 如果血量歸零，敵人被擊敗
    if (newHealth <= 0) {
      return 'enemy_defeated';
    } else {
      return 'enemy_damaged';
    }
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
          }
          return newOwners;
        });
        
        return 'moved_through_ally';
      } else {
        // 不能穿過己方棋子
        return 'invalid';
      }
    } else if (isEnemyPiece(toRow, toCol)) {
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
              console.log(`    英雄型棋子: ${piece}`);
              return true;
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
              console.log(`    城堡: ${piece}`);
              return true;
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

  // 獲取可能的移動
  const getPossibleMoves = (row, col) => {
    const moves = [];
    const directions = [[-1, 0], [1, 0], [0, -1], [0, 1]]; // 上下左右
    
    directions.forEach(([dRow, dCol]) => {
      const newRow = row + dRow;
      const newCol = col + dCol;
      
      if (isValidPosition(newRow, newCol)) {
        const targetPiece = board[newRow][newCol];
        if (targetPiece === 'empty' || isEnemyPiece(newRow, newCol)) {
          moves.push({ row: newRow, col: newCol, piece: targetPiece });
        }
      }
    });
    
    return moves;
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
            // 可以攻擊敵方棋子
            allMoves.push({
              from: { row, col, piece },
              to: { row: newRow, col: newCol, type: 'attack' }
            });
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
      // AI回合：先嘗試出牌，再移動棋子
      
      // 1. 嘗試出牌
      const aiCard = getAICardPlay();
      if (aiCard) {
        playAICard(aiCard);
      }
      
      // 2. 移動棋子
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
        executeMove(from.row, from.col, to.row, to.col);
        
        // AI移動完成後立即檢查遊戲是否結束
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
        applySkillEffect(pendingSkillCard, row, col);
        return;
      } else {
        // 無效目標，取消技能使用
        setPendingSkillCard(null);
        setIsSelectingTarget(false);
        setSkillTargets([]);
        setSelectedCard(null);
        return;
      }
    }
    
    const piece = board[row][col];
    
    if (selectedPiece && selectedPosition) {
      // 使用新的規則系統檢查移動和攻擊
      const isValidMoveAction = isValidMove(selectedPiece, selectedPosition.row, selectedPosition.col, row, col, board, pieceOwners, currentPlayer);
      const isValidAttackAction = isValidAttack(selectedPiece, selectedPosition.row, selectedPosition.col, row, col, board, pieceOwners, currentPlayer);
      
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
          
          const combatResult = handleCombat(selectedPosition.row, selectedPosition.col, row, col);
          
          if (combatResult === 'enemy_damaged') {
            // 攻擊方留在原地，只扣血，不移動
            
            // 檢查攻擊者是否有燃燒箭效果
            const attackerKey = `${selectedPosition.row}-${selectedPosition.col}`;
            const attackerState = pieceStates[attackerKey];
            const hasBurningArrow = attackerState?.buffs?.some(buff => buff.type === 'burning_arrow');
            
            if (hasBurningArrow) {
              // 對被攻擊的目標施加燃燒效果
              const targetKey = `${row}-${col}`;
              setPieceStates(prev => ({
                ...prev,
                [targetKey]: {
                  ...prev[targetKey],
                  debuffs: [...(prev[targetKey]?.debuffs || []), { type: 'burning', endTurn: currentTurn + 2, damage: 50 }]
                }
              }));
              
              // 移除攻擊者的燃燒箭效果
              setPieceStates(prev => ({
                ...prev,
                [attackerKey]: {
                  ...prev[attackerKey],
                  buffs: prev[attackerKey]?.buffs?.filter(buff => buff.type !== 'burning_arrow') || []
                }
              }));
            }
            
            // 消耗行動點
            consumeActionPoints('attack');
          } else if (combatResult === 'enemy_defeated') {
            // 敵人血量歸零，從棋盤上移除
            
            // 檢查攻擊者是否有燃燒箭效果（即使敵人被擊敗也要處理）
            const attackerKey = `${selectedPosition.row}-${selectedPosition.col}`;
            const attackerState = pieceStates[attackerKey];
            const hasBurningArrow = attackerState?.buffs?.some(buff => buff.type === 'burning_arrow');
            
            if (hasBurningArrow) {
              // 移除攻擊者的燃燒箭效果
              setPieceStates(prev => ({
                ...prev,
                [attackerKey]: {
                  ...prev[attackerKey],
                  buffs: prev[attackerKey]?.buffs?.filter(buff => buff.type !== 'burning_arrow') || []
                }
              }));
            }
            
            const newBoard = board.map(row => [...row]);
            newBoard[row][col] = 'empty'; // 敵人被移除，位置變空
            setBoard(newBoard);
            
            const targetKey = `${row}-${col}`;
            
            // 移除被擊敗的敵人的狀態和歸屬權
            setPieceStates(prev => {
              const newStates = { ...prev };
              delete newStates[targetKey];
              return newStates;
            });
            
            setPieceOwners(prev => {
              const newOwners = { ...prev };
              delete newOwners[targetKey];
              
              // 立即檢查遊戲是否結束（在狀態更新後）
              console.log('=== 立即檢查遊戲結束 (handleCellPress) ===');
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
            
            // 消耗行動點
            consumeActionPoints('attack');
            
            // 攻擊成功，不自動切換回合，等待玩家點擊結束回合按鈕
          }
        } else {
          // 不能攻擊己方棋子
        }
      
      setSelectedPiece(null);
      setSelectedPosition(null);
    } else if (piece !== 'empty' && !isEnemyPiece(row, col)) {
      setSelectedPiece(piece);
      setSelectedPosition({ row, col });
      // 已選擇棋子
    } else if (piece !== 'empty' && isEnemyPiece(row, col)) {
      // 不能選擇敵方棋子
    } else if (piece === 'empty') {
      // 點擊空格子，可以選擇位置（用於調試）
      setSelectedPiece(null);
      setSelectedPosition({ row, col });
      console.log(`點擊空格子 [${row}, ${col}]`);
    }
  };

  // 棋子組件
  const Piece3D = ({ piece, row, col, isSelected, isHighlighted, currentTurn }) => {
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
        <View style={styles.pieceContainer}>
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
        </View>
      </TouchableOpacity>
    );
  };


  // 載入畫面
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
    <View style={styles.container}>
      {/* 返回按鈕 */}
      <TouchableOpacity style={styles.backButton} onPress={onBack}>
        <View style={styles.backIcon}>
          <Text style={styles.backIconText}>←</Text>
        </View>
        <Text style={styles.backText}>返回</Text>
      </TouchableOpacity>
      
      <Text style={styles.title}>戰棋大師</Text>
      
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
        {/* 左方行座標 */}
        <View style={styles.rowCoordinates}>
          {board.map((_, rowIndex) => (
            <Text key={rowIndex} style={styles.coordinateText}>
              {rowIndex}
            </Text>
          ))}
        </View>
        
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
                    isHighlighted={(() => {
                      // 如果正在選擇技能卡牌目標
                      if (isSelectingTarget && pendingSkillCard) {
                        return skillTargets.some(target => target.row === rowIndex && target.col === colIndex);
                      }
                      
                      // 如果選中的是空格子，不顯示高亮
                      if (!selectedPiece || !selectedPosition) {
                        return false;
                      }
                      
                      const isValidMoveAction = isValidMove(selectedPiece, selectedPosition.row, selectedPosition.col, rowIndex, colIndex, board, pieceOwners, currentPlayer);
                      const isValidAttackAction = isValidAttack(selectedPiece, selectedPosition.row, selectedPosition.col, rowIndex, colIndex, board, pieceOwners, currentPlayer);
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
          
          {/* 下方列座標 */}
          <View style={styles.columnCoordinates}>
            {board[0].map((_, colIndex) => (
              <Text key={colIndex} style={styles.coordinateText}>
                {colIndex}
              </Text>
            ))}
          </View>
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
  // 移除城堡容器樣式
});

export default ChessBoard3D;
