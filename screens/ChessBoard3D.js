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
  PIECE_TYPES as RULE_PIECE_TYPES
} from './pieceRules';
import { CardSystem, CARD_TYPES } from './CardSystem';

const BOARD_SIZE = 8;
const { width: screenWidth, height: screenHeight } = Dimensions.get('window');
const CELL_SIZE = Math.floor((screenWidth - 40) / BOARD_SIZE);

// 座標轉換函數：將1-8座標轉換為0-7數組索引
const toArrayIndex = (coord) => {
  return coord - 1;
};
const toDisplayCoord = (index) => {
  return index + 1;
};

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

const ChessBoard3D = ({ onBack }) => {
  // 卡牌系統狀態
  const [playerHand, setPlayerHand] = useState([]);
  const [enemyHand, setEnemyHand] = useState([]);
  const [playerDeck, setPlayerDeck] = useState([]);
  const [enemyDeck, setEnemyDeck] = useState([]);
  const [selectedCard, setSelectedCard] = useState(null);
  const [mana, setMana] = useState({ current: 100, max: 100 });
  
  // AI出牌動畫狀態
  const [aiPlayedCard, setAiPlayedCard] = useState(null);
  const [showAiPlayedCard, setShowAiPlayedCard] = useState(false);

  // 初始化卡牌系統
  useEffect(() => {
    const allCards = Object.values(CARD_TYPES);
    const shuffledCards = [...allCards].sort(() => Math.random() - 0.5);
    
    // 由於只有5張卡片，我們需要重複使用
    const repeatedCards = [];
    for (let i = 0; i < 8; i++) {
      repeatedCards.push(...shuffledCards);
    }
    
    setPlayerDeck(repeatedCards.slice(0, 15));
    setEnemyDeck(repeatedCards.slice(15, 30));
    setPlayerHand(repeatedCards.slice(30, 35));
    setEnemyHand(repeatedCards.slice(35, 40));
  }, []);

  // 卡牌相關函數 - 只處理選中邏輯
  const playCard = (card) => {
    console.log('playCard 被調用:', card ? card.name : 'null', 'currentPlayer:', currentPlayer);
    if (currentPlayer === 'human') {
      if (card === null) {
        // 取消選中
        console.log('取消選中卡片');
        setSelectedCard(null);
      } else if (selectedCard && selectedCard.id === card.id) {
        // 如果點擊已選中的卡片，取消選中
        console.log('取消選中已選中的卡片');
        setSelectedCard(null);
      } else {
        // 如果點擊未選中的卡片，則選中它查看說明
        console.log('選中卡片:', card.name);
        setSelectedCard(card);
      }
    } else {
      console.log('不是玩家回合，無法選中卡片');
    }
  };

  // 移除手牌函數（用於 CardSystem）
  const removeCard = (card) => {
    setPlayerHand(prev => prev.filter(c => c.id !== card.id));
    setSelectedCard(null);
    // 移除手牌後不自動切換回合，等待玩家點擊結束回合按鈕
  };

  // 結束回合函數
  const handleEndTurn = () => {
    console.log('Player ended turn');
    setCurrentPlayer('ai');
    setIsAITurn(true);
  };

  // AI出牌決策函數
  const getAICardPlay = () => {
    if (enemyHand.length === 0) {
      console.log('AI has no cards to play');
      return null;
    }

    // AI簡單策略：隨機選擇一張可以出得起的牌
    const affordableCards = enemyHand.filter(card => card.cost <= mana.current);
    
    if (affordableCards.length === 0) {
      console.log('AI cannot afford any cards');
      return null;
    }

    // 隨機選擇一張牌
    const selectedCard = affordableCards[Math.floor(Math.random() * affordableCards.length)];
    console.log(`AI selected card: ${selectedCard.name}, cost: ${selectedCard.cost}`);
    
    return selectedCard;
  };

  // AI出牌函數
  const playAICard = (card) => {
    if (card && card.cost && mana.current >= card.cost) {
      // 顯示AI出牌動畫
      setAiPlayedCard(card);
      setShowAiPlayedCard(true);
      
      // 1秒後隱藏動畫並執行出牌邏輯
      setTimeout(() => {
        setShowAiPlayedCard(false);
        
        // 消耗法力
        setMana(prev => ({ ...prev, current: prev.current - card.cost }));
        
        // 移除AI手牌
        setEnemyHand(prev => prev.filter(c => c.id !== card.id));
        
        console.log(`AI played card: ${card.name}`);
        
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
    if (card && card.cost && mana.current >= card.cost) {
      // 消耗法力
      setMana(prev => ({ ...prev, current: prev.current - card.cost }));
      // 移除手牌
      removeCard(card);
    }
  };

  const drawCard = (player) => {
    if (player === 'human' && playerDeck.length > 0 && playerHand.length < 5) {
      const newCard = playerDeck[0];
      setPlayerDeck(prev => prev.slice(1));
      setPlayerHand(prev => [...prev, newCard]);
    } else if (player === 'ai' && enemyDeck.length > 0 && enemyHand.length < 5) {
      const newCard = enemyDeck[0];
      setEnemyDeck(prev => prev.slice(1));
      setEnemyHand(prev => [...prev, newCard]);
    }
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
    
    // 設置初始棋子位置 - AI方（第0-2行）
    initialBoard[0][1] = 'S'; // AI士兵
    initialBoard[1][1] = 'A'; // AI弓箭手
    initialBoard[1][2] = 'W'; // AI戰士
    initialBoard[1][3] = 'M'; // AI法師
    initialBoard[1][4] = 'K'; // AI騎士
    initialBoard[0][2] = 'P'; // AI牧師
    initialBoard[0][3] = 'AS'; // AI刺客
    initialBoard[0][4] = 'MT'; // AI心智扭曲者
    
    console.log('棋盤初始化完成，新棋子位置:');
    console.log('玩家牧師:', initialBoard[6][2], '位置 [6][2]');
    console.log('玩家刺客:', initialBoard[6][3], '位置 [6][3]');
    console.log('玩家心智扭曲者:', initialBoard[6][4], '位置 [6][4]');
    console.log('AI牧師:', initialBoard[0][2], '位置 [0][2]');
    console.log('AI刺客:', initialBoard[0][3], '位置 [0][3]');
    console.log('AI心智扭曲者:', initialBoard[0][4], '位置 [0][4]');
    
    return initialBoard;
  });

  // 棋子狀態追蹤
  const [pieceStates, setPieceStates] = useState(() => {
    const states = {};
    for (let row = 0; row < BOARD_SIZE; row++) {
      for (let col = 0; col < BOARD_SIZE; col++) {
        const piece = board[row][col];
        if (piece !== 'empty') {
          states[`${row}-${col}`] = {
            hasBeenAttacked: false,
            player: row < 4 ? 'ai' : 'human' // 第0-3行是AI，第4-7行是玩家
          };
        }
      }
    }
    return states;
  });

  // 棋子擁有者追蹤（基於初始位置，不會改變）
  const [pieceOwners, setPieceOwners] = useState(() => {
    const owners = {};
    for (let row = 0; row < BOARD_SIZE; row++) {
      for (let col = 0; col < BOARD_SIZE; col++) {
        const piece = board[row][col];
        if (piece !== 'empty') {
          // 根據初始位置設定擁有者，這個不會改變
          owners[`${row}-${col}`] = row < 4 ? 'ai' : 'human';
        }
      }
    }
    return owners;
  });

  const [selectedPiece, setSelectedPiece] = useState(null);
  const [selectedPosition, setSelectedPosition] = useState(null);
  const [currentPlayer, setCurrentPlayer] = useState('human');
  const [isAITurn, setIsAITurn] = useState(false);
  // 移除AI進度狀態，使用簡單AI

  // 移除3D動畫效果來解決 rotateX 問題

  // 遊戲邏輯函數（保持原有邏輯）
  const isValidPosition = (row, col) => {
    return row >= 0 && row < BOARD_SIZE && col >= 0 && col < BOARD_SIZE;
  };

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
    
    // 如果沒有記錄，根據初始位置判斷（僅用於初始化）
    return row < 4 ? 'ai' : 'human';
  };

  const isEnemyPiece = (row, col) => {
    const piecePlayer = getPiecePlayer(row, col);
    return piecePlayer !== currentPlayer;
  };

  const handleCombat = (attackerRow, attackerCol, targetRow, targetCol) => {
    const targetPiece = board[targetRow][targetCol];
    const targetKey = `${targetRow}-${targetCol}`;
    const targetState = pieceStates[targetKey];
    
    console.log(`Combat: ${targetPiece} at (${targetRow},${targetCol}), hasBeenAttacked: ${targetState?.hasBeenAttacked}`);
    
    if (targetPiece === 'W' && targetState && !targetState.hasBeenAttacked) {
      setPieceStates(prev => ({
        ...prev,
        [targetKey]: {
          ...prev[targetKey],
          hasBeenAttacked: true
        }
      }));
      console.log('Warrior protected from first attack');
      return 'warrior_protected';
    } else {
      console.log('Enemy defeated');
      return 'enemy_defeated';
    }
  };

  const executeMove = (fromRow, fromCol, toRow, toCol) => {
    const piece = board[fromRow][fromCol];
    const targetPiece = board[toRow][toCol];
    
    console.log(`ExecuteMove: ${piece} from (${fromRow},${fromCol}) to (${toRow},${toCol}), target: ${targetPiece}`);
    
    if (targetPiece === 'empty') {
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
          newStates[newKey] = { ...newStates[oldKey] };
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
      
      console.log(`Move successful: ${piece} moved to (${toRow},${toCol})`);
      return 'moved';
    } else if (isEnemyPiece(toRow, toCol)) {
      const combatResult = handleCombat(fromRow, fromCol, toRow, toCol);
      
      if (combatResult === 'warrior_protected') {
        console.log('Attack blocked by warrior protection');
        return 'warrior_protected';
      } else if (combatResult === 'enemy_defeated') {
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
            newStates[newKey] = { ...newStates[oldKey] };
            delete newStates[oldKey];
          }
          // 移除被擊敗的敵方棋子狀態
          delete newStates[newKey];
          return newStates;
        });
        
        // 更新棋子擁有者資訊 - 攻擊方棋子佔領位置
        setPieceOwners(prev => {
          const newOwners = { ...prev };
          if (newOwners[oldKey]) {
            newOwners[newKey] = newOwners[oldKey];
            delete newOwners[oldKey];
          }
          return newOwners;
        });
        
        console.log(`Attack successful: ${piece} defeated enemy at (${toRow},${toCol})`);
        return 'attacked';
      }
    }
    
    console.log('Invalid move');
    return 'invalid';
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
    
    console.log('AI pieces found:', aiPieces);
    console.log('Current board state:', board);
    console.log('Current pieceOwners:', pieceOwners);
    
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
    
    console.log('Total AI moves available:', allMoves.length);
    
    if (allMoves.length === 0) {
      console.log('AI has no valid moves');
      return null;
    }
    
    const attackMoves = allMoves.filter(move => move.to.type === 'attack');
    
    if (attackMoves.length > 0) {
      const selectedMove = attackMoves[Math.floor(Math.random() * attackMoves.length)];
      console.log('AI selected attack move:', selectedMove);
      return selectedMove;
    } else {
      const selectedMove = allMoves[Math.floor(Math.random() * allMoves.length)];
      console.log('AI selected move:', selectedMove);
      return selectedMove;
    }
  };

  const makeAIMove = () => {
    console.log('AI turn starting...');
    setTimeout(() => {
      // AI回合：先嘗試出牌，再移動棋子
      
      // 1. 嘗試出牌
      const aiCard = getAICardPlay();
      if (aiCard) {
        playAICard(aiCard);
        console.log('AI played a card, now moving piece...');
      } else {
        console.log('AI cannot play any cards, proceeding to move pieces...');
      }
      
      // 2. 移動棋子
      setTimeout(() => {
        const aiMove = getSimpleAIMove();
        
        if (!aiMove) {
          console.log('AI has no valid moves, turn completed');
          // AI沒有可移動的棋子
          setCurrentPlayer('human');
          setIsAITurn(false);
          return;
        }
        
        const { from, to } = aiMove;
        console.log(`AI executing move from (${from.row},${from.col}) to (${to.row},${to.col})`);
        const result = executeMove(from.row, from.col, to.row, to.col);
        console.log('AI move result:', result);
        
        setTimeout(() => {
          // AI移動完成
          console.log('AI turn completed');
          setCurrentPlayer('human');
          setIsAITurn(false);
        }, 500);
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

  // 回合開始時恢復法力值
  useEffect(() => {
    // 每個回合開始時都恢復法力值（包括AI回合）
    setMana(prev => ({ ...prev, current: prev.max }));
    console.log(`Turn started for ${currentPlayer}, mana restored to ${mana.max}`);
  }, [currentPlayer]);

  const handleCellPress = (row, col) => {
    if (isAITurn || currentPlayer === 'ai') {
      // 等待AI完成回合
      return;
    }
    
    const piece = board[row][col];
    
    if (selectedPiece && selectedPosition) {
      // 使用新的規則系統檢查移動和攻擊
      const isValidMoveAction = isValidMove(selectedPiece, selectedPosition.row, selectedPosition.col, row, col, board, pieceOwners, currentPlayer);
      const isValidAttackAction = isValidAttack(selectedPiece, selectedPosition.row, selectedPosition.col, row, col, board, pieceOwners, currentPlayer);
      
      if (isValidMoveAction && piece === 'empty') {
          const newBoard = board.map(row => [...row]);
          newBoard[row][col] = selectedPiece;
          newBoard[selectedPosition.row][selectedPosition.col] = 'empty';
          setBoard(newBoard);
          
          const newKey = `${row}-${col}`;
          const oldKey = `${selectedPosition.row}-${selectedPosition.col}`;
          setPieceStates(prev => {
            const newStates = { ...prev };
            if (newStates[oldKey]) {
              newStates[newKey] = { ...newStates[oldKey] };
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
          
          // 移動成功，不自動切換回合，等待玩家點擊結束回合按鈕
        } else if (isValidAttackAction && isEnemyPiece(row, col)) {
          const combatResult = handleCombat(selectedPosition.row, selectedPosition.col, row, col);
          
          if (combatResult === 'warrior_protected') {
            // 攻擊失敗，戰士被保護
          } else if (combatResult === 'enemy_defeated') {
            const newBoard = board.map(row => [...row]);
            newBoard[row][col] = selectedPiece;
            newBoard[selectedPosition.row][selectedPosition.col] = 'empty';
            setBoard(newBoard);
            
            const newKey = `${row}-${col}`;
            const oldKey = `${selectedPosition.row}-${selectedPosition.col}`;
            setPieceStates(prev => {
              const newStates = { ...prev };
              if (newStates[oldKey]) {
                newStates[newKey] = { ...newStates[oldKey] };
                delete newStates[oldKey];
              }
              return newStates;
            });
            
            // 更新棋子擁有者資訊 - 攻擊方棋子佔領位置
            setPieceOwners(prev => {
              const newOwners = { ...prev };
              if (newOwners[oldKey]) {
                newOwners[newKey] = newOwners[oldKey];
                delete newOwners[oldKey];
              }
              return newOwners;
            });
            
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
    }
  };

  // 簡化的棋子組件
  const Piece3D = ({ piece, row, col, isSelected, isHighlighted }) => {
    // 修正Z軸層級 - 前面的棋子（row值大）應該有更高的zIndex
    // row 7 (最前面) = zIndex 17, row 6 = zIndex 16, ..., row 0 (最後面) = zIndex 10
    const baseZIndex = 17 - (7 - row); // 前面的行有更高的zIndex
    const zIndex = isSelected ? baseZIndex + 20 : baseZIndex;
    
    if (piece === 'empty') {
      return (
        <TouchableOpacity
          style={[
            styles.cell,
            {
              backgroundColor: isHighlighted ? '#85C1E9' : (row + col) % 2 === 0 ? '#F5DEB3' : '#8B4513',
              width: CELL_SIZE,
              height: CELL_SIZE,
            },
          ]}
          onPress={() => handleCellPress(row, col)}
        />
      );
    }

    const pieceData = PIECE_TYPES[piece];

    return (
      <TouchableOpacity
        style={[
          styles.cell,
          {
            backgroundColor: isHighlighted 
              ? '#E74C3C' 
              : (row + col) % 2 === 0 ? '#F5DEB3' : '#8B4513',
            width: CELL_SIZE,
            height: CELL_SIZE,
            zIndex: zIndex,
          },
        ]}
        onPress={() => handleCellPress(row, col)}
        activeOpacity={0.8}
      >
        <View style={styles.pieceContainer}>
          {/* 使用統一的棋子管理器 */}
          <PieceManager 
            piece={piece}
            isSelected={isSelected}
            isHighlighted={isHighlighted}
          />
        </View>
      </TouchableOpacity>
    );
  };

  // 重製遊戲函數
  const resetGame = () => {
    const initialBoard = Array(BOARD_SIZE).fill(null).map(() => 
      Array(BOARD_SIZE).fill('empty')
    );
    
    // 重新設置初始棋子位置 - 玩家方（第5-7行）
    initialBoard[6][1] = 'S'; // 玩家士兵
    initialBoard[7][1] = 'A'; // 玩家弓箭手
    initialBoard[7][2] = 'W'; // 玩家戰士
    initialBoard[7][3] = 'M'; // 玩家法師
    initialBoard[7][4] = 'K'; // 玩家騎士
    initialBoard[6][2] = 'P'; // 玩家牧師
    initialBoard[6][3] = 'AS'; // 玩家刺客
    initialBoard[6][4] = 'MT'; // 玩家心智扭曲者
    
    // 重新設置初始棋子位置 - AI方（第0-2行）
    initialBoard[0][1] = 'S'; // AI士兵
    initialBoard[1][1] = 'A'; // AI弓箭手
    initialBoard[1][2] = 'W'; // AI戰士
    initialBoard[1][3] = 'M'; // AI法師
    initialBoard[1][4] = 'K'; // AI騎士
    initialBoard[0][2] = 'P'; // AI牧師
    initialBoard[0][3] = 'AS'; // AI刺客
    initialBoard[0][4] = 'MT'; // AI心智扭曲者
    
    setBoard(initialBoard);
    
    // 重製棋子狀態
    const states = {};
    const owners = {};
    for (let row = 0; row < BOARD_SIZE; row++) {
      for (let col = 0; col < BOARD_SIZE; col++) {
        const piece = initialBoard[row][col];
        if (piece !== 'empty') {
          states[`${row}-${col}`] = {
            hasBeenAttacked: false,
            player: row < 4 ? 'ai' : 'human'
          };
          owners[`${row}-${col}`] = row < 4 ? 'ai' : 'human';
        }
      }
    }
    
    setPieceStates(states);
    setPieceOwners(owners);
    setSelectedPiece(null);
    setSelectedPosition(null);
    setCurrentPlayer('human');
    setIsAITurn(false);
    
    // 重製卡牌系統
    const allCards = Object.values(CARD_TYPES);
    const shuffledCards = [...allCards].sort(() => Math.random() - 0.5);
    
    // 由於只有5張卡片，我們需要重複使用
    const repeatedCards = [];
    for (let i = 0; i < 8; i++) {
      repeatedCards.push(...shuffledCards);
    }
    
    setPlayerDeck(repeatedCards.slice(0, 15));
    setEnemyDeck(repeatedCards.slice(15, 30));
    setPlayerHand(repeatedCards.slice(30, 35));
    setEnemyHand(repeatedCards.slice(35, 40));
    setSelectedCard(null);
    setMana({ current: 100, max: 100 });
    
    // 重製AI出牌動畫狀態
    setAiPlayedCard(null);
    setShowAiPlayedCard(false);
  };

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
      </View>

      {/* 增強透視效果的棋盤容器 */}
      <View style={styles.board3DContainer}>
        {/* 棋盤底座 */}
        <LinearGradient
          colors={['#8B4513', '#654321', '#2F1B14']}
          style={styles.boardBase}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          {/* 木質紋理 */}
          <View style={styles.woodTexture} />
          
          {/* 透視光源效果 */}
          <View style={styles.perspectiveLight} />

          {/* 主棋盤 */}
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
                    isHighlighted={selectedPosition && (
                      isValidMove(selectedPiece, selectedPosition.row, selectedPosition.col, rowIndex, colIndex, board, pieceOwners, currentPlayer) ||
                      isValidAttack(selectedPiece, selectedPosition.row, selectedPosition.col, rowIndex, colIndex, board, pieceOwners, currentPlayer)
                    )}
                  />
                ))}
              </View>
            ))}
          </View>

        </LinearGradient>
      </View>
      
      {/* 重製遊戲按鈕 - 右上角 */}
      <TouchableOpacity 
        style={styles.resetButtonTopRight} 
        onPress={resetGame}
        activeOpacity={0.8}
      >
        <Text style={styles.resetButtonText}>🔄 重製遊戲</Text>
      </TouchableOpacity>

      {/* 卡牌系統 */}
      <CardSystem
        playerHand={playerHand}
        enemyHand={enemyHand}
        playerDeck={playerDeck}
        enemyDeck={enemyDeck}
        onPlayCard={playCard}
        onDrawCard={drawCard}
        selectedCard={selectedCard}
        mana={mana}
        onRemoveCard={removeCard}
        onEndTurn={handleEndTurn}
        currentPlayer={currentPlayer}
        aiPlayedCard={aiPlayedCard}
        showAiPlayedCard={showAiPlayedCard}
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
  backButton: {
    position: 'absolute',
    top: 50,
    left: 20,
    zIndex: 10,
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
  board3DContainer: {
    position: 'absolute',
    top: '55%',
    left: '50%',
    transform: [
      { translateX: -(CELL_SIZE * BOARD_SIZE + 30) / 2 }, 
      { translateY: -(CELL_SIZE * BOARD_SIZE + 30) / 2 },
    ],
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
    width: CELL_SIZE * BOARD_SIZE + 30,
    height: CELL_SIZE * BOARD_SIZE + 30,
  },
  lightSource: {
    position: 'absolute',
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    top: -50,
    left: -50,
    zIndex: 1,
  },
  perspectiveLight: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    top: -100,
    left: -100,
    zIndex: 2,
    shadowColor: 'rgba(255, 255, 255, 0.3)',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 50,
    elevation: 5,
  },
  boardBase: {
    padding: 15,
    borderRadius: 15,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.5,
    shadowRadius: 15,
    elevation: 12,
    width: '100%',
    height: '100%',
  },
  woodTexture: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 20,
    backgroundColor: 'rgba(139, 69, 19, 0.3)',
    // 這裡可以添加更多木質紋理效果
  },
  board: {
    borderWidth: 2,
    borderColor: '#2F1B14',
    borderRadius: 6,
    overflow: 'visible', // 允許棋子超出棋盤邊界
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
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
    borderWidth: 0.5,
    borderColor: '#654321',
    position: 'relative',
    width: CELL_SIZE,
    height: CELL_SIZE,
    overflow: 'visible', // 允許棋子超出格子邊界
  },
  pieceContainer: {
    position: 'relative',
    width: CELL_SIZE * 0.95,
    height: CELL_SIZE * 0.95,
    overflow: 'visible', // 允許棋子內容超出容器邊界
  },
  emptyPiece: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyPieceText: {
    color: '#FFFFFF',
    fontSize: CELL_SIZE * 0.3,
    fontWeight: 'bold',
  },
  resetButtonTopRight: {
    position: 'absolute',
    top: 50,
    right: 20,
    zIndex: 10,
    backgroundColor: '#E74C3C',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  resetButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});

export default ChessBoard3D;
