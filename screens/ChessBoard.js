import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Alert,
} from 'react-native';
// 移除MCTS AI導入，改用簡單規則AI

const BOARD_SIZE = 10;
const CELL_SIZE = Dimensions.get('window').width / BOARD_SIZE - 2;

// 棋子類型定義
const PIECE_TYPES = {
  W: { name: '戰士', color: '#E74C3C', symbol: 'W' },
  A: { name: '弓箭手', color: '#3498DB', symbol: 'A' },
  M: { name: '法師', color: '#9B59B6', symbol: 'M' },
  K: { name: '騎士', color: '#F39C12', symbol: 'K' },
  empty: { name: '空', color: 'transparent', symbol: '' },
};

const ChessBoard = () => {
  // 初始化 10x10 棋盤，使用二維陣列
  const [board, setBoard] = useState(() => {
    const initialBoard = Array(BOARD_SIZE).fill(null).map(() => 
      Array(BOARD_SIZE).fill('empty')
    );
    
    // 設置初始棋子位置
    initialBoard[7][1] = 'W'; // 戰士
    initialBoard[0][1] = 'A'; // 弓箭手
    initialBoard[0][2] = 'M'; // 法師
    initialBoard[0][3] = 'K'; // 騎士
    
    initialBoard[9][9] = 'W'; // 敵方戰士
    initialBoard[9][8] = 'A'; // 敵方弓箭手
    initialBoard[9][7] = 'M'; // 敵方法師
    initialBoard[9][6] = 'K'; // 敵方騎士
    
    return initialBoard;
  });

  // 棋子狀態追蹤（用於戰士防護機制）
  const [pieceStates, setPieceStates] = useState(() => {
    const states = {};
    // 初始化所有棋子的狀態
    for (let row = 0; row < BOARD_SIZE; row++) {
      for (let col = 0; col < BOARD_SIZE; col++) {
        const piece = board[row][col];
        if (piece !== 'empty') {
          states[`${row}-${col}`] = {
            hasBeenAttacked: false,
            player: row < 5 ? 'human' : 'ai' // 上半部是玩家，下半部是AI
          };
        }
      }
    }
    return states;
  });

  const [selectedPiece, setSelectedPiece] = useState(null);
  const [selectedPosition, setSelectedPosition] = useState(null);
  const [currentPlayer, setCurrentPlayer] = useState('human'); // human 或 ai
  const [isAITurn, setIsAITurn] = useState(false);

  // 重啟對局函數
  const resetGame = () => {
    // 重置棋盤到初始狀態
    const initialBoard = Array(BOARD_SIZE).fill(null).map(() => 
      Array(BOARD_SIZE).fill('empty')
    );
    
    // 設置初始棋子位置
    initialBoard[7][1] = 'W'; // 戰士
    initialBoard[0][1] = 'A'; // 弓箭手
    initialBoard[0][2] = 'M'; // 法師
    initialBoard[0][3] = 'K'; // 騎士
    
    initialBoard[9][9] = 'W'; // 敵方戰士
    initialBoard[9][8] = 'A'; // 敵方弓箭手
    initialBoard[9][7] = 'M'; // 敵方法師
    initialBoard[9][6] = 'K'; // 敵方騎士
    
    setBoard(initialBoard);
    
    // 重置棋子狀態追蹤
    const states = {};
    for (let row = 0; row < BOARD_SIZE; row++) {
      for (let col = 0; col < BOARD_SIZE; col++) {
        const piece = initialBoard[row][col];
        if (piece !== 'empty') {
          states[`${row}-${col}`] = {
            hasBeenAttacked: false,
            player: row < 5 ? 'human' : 'ai'
          };
        }
      }
    }
    setPieceStates(states);
    
    // 重置遊戲狀態
    setSelectedPiece(null);
    setSelectedPosition(null);
    setCurrentPlayer('human');
    setIsAITurn(false);
    
    // 遊戲重啟完成
  };

  // 檢查位置是否在棋盤範圍內
  const isValidPosition = (row, col) => {
    return row >= 0 && row < BOARD_SIZE && col >= 0 && col < BOARD_SIZE;
  };

  // 檢查是否為鄰近格子（上下左右相鄰）
  const isAdjacent = (row1, col1, row2, col2) => {
    const rowDiff = Math.abs(row1 - row2);
    const colDiff = Math.abs(col1 - col2);
    return (rowDiff === 1 && colDiff === 0) || (rowDiff === 0 && colDiff === 1);
  };

  // 判斷棋子屬於哪個玩家
  const getPiecePlayer = (row, col) => {
    return row < 5 ? 'human' : 'ai';
  };

  // 檢查是否為敵方棋子
  const isEnemyPiece = (row, col) => {
    const piecePlayer = getPiecePlayer(row, col);
    return piecePlayer !== currentPlayer;
  };

  // 處理戰鬥邏輯
  const handleCombat = (attackerRow, attackerCol, targetRow, targetCol) => {
    const targetPiece = board[targetRow][targetCol];
    const targetKey = `${targetRow}-${targetCol}`;
    const targetState = pieceStates[targetKey];
    
    // 如果是戰士且第一次被攻擊
    if (targetPiece === 'W' && targetState && !targetState.hasBeenAttacked) {
      // 戰士第一次被攻擊不會死亡，但標記為已被攻擊
      setPieceStates(prev => ({
        ...prev,
        [targetKey]: {
          ...prev[targetKey],
          hasBeenAttacked: true
        }
      }));
      return 'warrior_protected';
    } else {
      // 其他情況，敵方棋子被移除
      return 'enemy_defeated';
    }
  };

  // AI移動邏輯
  const getAIPieces = () => {
    const aiPieces = [];
    for (let row = 0; row < BOARD_SIZE; row++) {
      for (let col = 0; col < BOARD_SIZE; col++) {
        if (board[row][col] !== 'empty' && getPiecePlayer(row, col) === 'ai') {
          aiPieces.push({ row, col, piece: board[row][col] });
        }
      }
    }
    return aiPieces;
  };

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

  const executeMove = (fromRow, fromCol, toRow, toCol) => {
    const piece = board[fromRow][fromCol];
    const targetPiece = board[toRow][toCol];
    
    if (targetPiece === 'empty') {
      // 移動到空位置
      const newBoard = board.map(row => [...row]);
      newBoard[toRow][toCol] = piece;
      newBoard[fromRow][fromCol] = 'empty';
      setBoard(newBoard);
      
      // 更新棋子狀態追蹤
      const newKey = `${toRow}-${toCol}`;
      const oldKey = `${fromRow}-${fromCol}`;
      setPieceStates(prev => {
        const newStates = { ...prev };
        if (newStates[oldKey]) {
          newStates[newKey] = { ...newStates[oldKey] };
          delete newStates[oldKey];
        }
        return newStates;
      });
      
      return 'moved';
    } else if (isEnemyPiece(toRow, toCol)) {
      // 攻擊敵方棋子
      const combatResult = handleCombat(fromRow, fromCol, toRow, toCol);
      
      if (combatResult === 'warrior_protected') {
        return 'warrior_protected';
      } else if (combatResult === 'enemy_defeated') {
        const newBoard = board.map(row => [...row]);
        newBoard[toRow][toCol] = piece;
        newBoard[fromRow][fromCol] = 'empty';
        setBoard(newBoard);
        
        // 更新棋子狀態追蹤
        const newKey = `${toRow}-${toCol}`;
        const oldKey = `${fromRow}-${fromCol}`;
        setPieceStates(prev => {
          const newStates = { ...prev };
          if (newStates[oldKey]) {
            newStates[newKey] = { ...newStates[oldKey] };
            delete newStates[oldKey];
          }
          return newStates;
        });
        
        return 'attacked';
      }
    }
    
    return 'invalid';
  };

  // 簡單AI移動函數
  const getSimpleAIMove = () => {
    const aiPieces = getAIPieces();
    const allMoves = [];
    
    // 收集所有可能的移動
    aiPieces.forEach(({ row, col, piece }) => {
      const moves = getPossibleMoves(row, col);
      moves.forEach(move => {
        allMoves.push({
          from: { row, col, piece },
          to: move
        });
      });
    });
    
    if (allMoves.length === 0) {
      return null; // 沒有可用移動
    }
    
    // 簡單策略：優先攻擊，然後隨機移動
    const attackMoves = allMoves.filter(move => move.to.piece !== 'empty');
    
    if (attackMoves.length > 0) {
      // 如果有攻擊機會，隨機選擇一個攻擊
      return attackMoves[Math.floor(Math.random() * attackMoves.length)];
    } else {
      // 否則隨機選擇一個移動
      return allMoves[Math.floor(Math.random() * allMoves.length)];
    }
  };

  const makeAIMove = () => {
    // 短暫延遲讓玩家看到AI回合開始
    setTimeout(() => {
      const aiMove = getSimpleAIMove();
      
      if (!aiMove) {
        // AI沒有可移動的棋子，跳過回合
        // AI沒有可移動的棋子
        setCurrentPlayer('human');
        setIsAITurn(false);
        return;
      }
      
      const { from, to } = aiMove;
      const result = executeMove(from.row, from.col, to.row, to.col);
      
      // 顯示AI移動結果
      setTimeout(() => {
        // AI移動完成
        
        // 切換回玩家回合
        setCurrentPlayer('human');
        setIsAITurn(false);
      }, 500);
    }, 800); // 短暫延遲讓玩家看到回合切換
  };

  // AI回合處理
  useEffect(() => {
    if (isAITurn && currentPlayer === 'ai') {
      const timer = setTimeout(() => {
        makeAIMove();
      }, 1000); // 1秒延遲讓玩家看到回合切換
      
      return () => clearTimeout(timer);
    }
  }, [isAITurn, currentPlayer]);

  // 處理格子點擊
  const handleCellPress = (row, col) => {
    // 如果是AI回合，不允許玩家操作
    if (isAITurn || currentPlayer === 'ai') {
      // 等待AI完成回合
      return;
    }
    
    const piece = board[row][col];
    
    if (selectedPiece && selectedPosition) {
      // 如果已經選擇了棋子，嘗試移動
      if (isAdjacent(selectedPosition.row, selectedPosition.col, row, col)) {
        if (piece === 'empty') {
          // 移動棋子到空位置
          const newBoard = board.map(row => [...row]);
          newBoard[row][col] = selectedPiece;
          newBoard[selectedPosition.row][selectedPosition.col] = 'empty';
          setBoard(newBoard);
          
          // 更新棋子狀態追蹤
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
          
          // 切換到AI回合
          setCurrentPlayer('ai');
          setIsAITurn(true);
          
          // 移動成功
        } else if (isEnemyPiece(row, col)) {
          // 攻擊敵方棋子
          const combatResult = handleCombat(selectedPosition.row, selectedPosition.col, row, col);
          
          if (combatResult === 'warrior_protected') {
            // 戰士被保護，攻擊失敗
            // 攻擊失敗，戰士被保護
          } else if (combatResult === 'enemy_defeated') {
            // 敵方棋子被擊敗
            const newBoard = board.map(row => [...row]);
            newBoard[row][col] = selectedPiece;
            newBoard[selectedPosition.row][selectedPosition.col] = 'empty';
            setBoard(newBoard);
            
            // 更新棋子狀態追蹤
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
            
            // 切換到AI回合
            setCurrentPlayer('ai');
            setIsAITurn(true);
            
            // 攻擊成功
          }
        } else {
          // 不能攻擊己方棋子
        }
      } else {
        // 只能移動到相鄰的格子
      }
      
      // 清除選擇
      setSelectedPiece(null);
      setSelectedPosition(null);
    } else if (piece !== 'empty' && !isEnemyPiece(row, col)) {
      // 選擇己方棋子
      setSelectedPiece(piece);
      setSelectedPosition({ row, col });
      // 已選擇棋子
    } else if (piece !== 'empty' && isEnemyPiece(row, col)) {
      // 不能選擇敵方棋子
    }
  };

  // 渲染單個格子
  const renderCell = (row, col) => {
    const piece = board[row][col];
    const isSelected = selectedPosition && selectedPosition.row === row && selectedPosition.col === col;
    const isAdjacentToSelected = selectedPosition && isAdjacent(selectedPosition.row, selectedPosition.col, row, col);
    const isEnemy = piece !== 'empty' && isEnemyPiece(row, col);
    const pieceKey = `${row}-${col}`;
    const pieceState = pieceStates[pieceKey];
    const isWarriorProtected = piece === 'W' && pieceState && !pieceState.hasBeenAttacked;
    
    return (
      <TouchableOpacity
        key={`${row}-${col}`}
        style={[
          styles.cell,
          {
            backgroundColor: isSelected 
              ? '#F1C40F' 
              : isAdjacentToSelected 
                ? isEnemy 
                  ? '#E74C3C'  // 敵方棋子用紅色提示
                  : '#85C1E9'  // 空位置用藍色提示
                : (row + col) % 2 === 0 ? '#F8F9FA' : '#E8E8E8',
            width: CELL_SIZE,
            height: CELL_SIZE,
          },
        ]}
        onPress={() => handleCellPress(row, col)}
      >
        {piece !== 'empty' && (
          <View style={[
            styles.piece, 
            { 
              backgroundColor: PIECE_TYPES[piece].color,
              borderWidth: isWarriorProtected ? 3 : 0,
              borderColor: isWarriorProtected ? '#F1C40F' : 'transparent',
            }
          ]}>
            <Text style={styles.pieceText}>{PIECE_TYPES[piece].symbol}</Text>
            {isWarriorProtected && (
              <Text style={styles.protectionText}>🛡️</Text>
            )}
          </View>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
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
      
      <View style={styles.board}>
        {board.map((row, rowIndex) => (
          <View key={rowIndex} style={styles.row}>
            {row.map((_, colIndex) => renderCell(rowIndex, colIndex))}
          </View>
        ))}
      </View>
      
      <TouchableOpacity style={styles.resetButton} onPress={resetGame}>
        <Text style={styles.resetButtonText}>🔄 重啟對局</Text>
      </TouchableOpacity>
      
      <View style={styles.legend}>
        <Text style={styles.legendTitle}>棋子說明:</Text>
        {Object.entries(PIECE_TYPES).map(([key, piece]) => {
          if (key === 'empty') return null;
          return (
            <View key={key} style={styles.legendItem}>
              <View style={[styles.legendPiece, { backgroundColor: piece.color }]}>
                <Text style={styles.legendText}>{piece.symbol}</Text>
              </View>
              <Text style={styles.legendLabel}>{piece.name}</Text>
            </View>
          );
        })}
        
        <View style={styles.rulesSection}>
          <Text style={styles.rulesTitle}>遊戲規則:</Text>
          <Text style={styles.ruleText}>• 玩家先行，然後輪到AI</Text>
          <Text style={styles.ruleText}>• AI使用簡單規則：優先攻擊，否則隨機移動</Text>
          <Text style={styles.ruleText}>• 點擊己方棋子選擇</Text>
          <Text style={styles.ruleText}>• 移動到相鄰格子</Text>
          <Text style={styles.ruleText}>• 攻擊敵方棋子會移除敵方</Text>
          <Text style={styles.ruleText}>• 戰士🛡️第一次被攻擊不會死亡</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#2C3E50',
    alignItems: 'center',
    paddingTop: 50,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ECF0F1',
    marginBottom: 10,
  },
  turnIndicator: {
    alignItems: 'center',
    marginBottom: 20,
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
  board: {
    borderWidth: 2,
    borderColor: '#34495E',
    borderRadius: 8,
    overflow: 'hidden',
  },
  resetButton: {
    backgroundColor: '#E74C3C',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
    marginTop: 15,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  resetButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  row: {
    flexDirection: 'row',
  },
  cell: {
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 0.5,
    borderColor: '#7F8C8D',
  },
  piece: {
    width: CELL_SIZE * 0.7,
    height: CELL_SIZE * 0.7,
    borderRadius: CELL_SIZE * 0.35,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  pieceText: {
    color: '#FFFFFF',
    fontSize: CELL_SIZE * 0.3,
    fontWeight: 'bold',
  },
  protectionText: {
    position: 'absolute',
    top: -5,
    right: -5,
    fontSize: CELL_SIZE * 0.2,
  },
  legend: {
    marginTop: 20,
    padding: 15,
    backgroundColor: '#34495E',
    borderRadius: 8,
    width: '90%',
  },
  legendTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ECF0F1',
    marginBottom: 10,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  legendPiece: {
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  legendText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
  legendLabel: {
    color: '#BDC3C7',
    fontSize: 14,
  },
  rulesSection: {
    marginTop: 15,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: '#7F8C8D',
  },
  rulesTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ECF0F1',
    marginBottom: 8,
  },
  ruleText: {
    color: '#BDC3C7',
    fontSize: 12,
    marginBottom: 3,
  },
});

export default ChessBoard;
