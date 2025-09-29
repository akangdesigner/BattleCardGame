// 棋子規則定義檔案
// 定義每個棋子的移動和攻擊規則

// 方向定義
export const DIRECTIONS = {
  UP: [-1, 0],
  DOWN: [1, 0],
  LEFT: [0, -1],
  RIGHT: [0, 1],
  UP_LEFT: [-1, -1],
  UP_RIGHT: [-1, 1],
  DOWN_LEFT: [1, -1],
  DOWN_RIGHT: [1, 1]
};

// 棋子類型枚舉
export const PIECE_TYPES = {
  S: 'S', // 士兵
  W: 'W', // 戰士
  A: 'A', // 弓箭手
  M: 'M', // 法師
  K: 'K', // 騎士
  EMPTY: 'empty'
};

// 棋子規則定義
export const PIECE_RULES = {
  [PIECE_TYPES.S]: {
    name: '士兵',
    moveRange: 1, // 移動範圍：1格
    moveDirections: [DIRECTIONS.UP, DIRECTIONS.DOWN, DIRECTIONS.LEFT, DIRECTIONS.RIGHT], // 只能上下左右移動
    attackRange: 1, // 攻擊範圍：1格
    attackDirections: [DIRECTIONS.UP, DIRECTIONS.DOWN, DIRECTIONS.LEFT, DIRECTIONS.RIGHT], // 只能攻擊相鄰格子
    specialRules: {
      // 士兵沒有特殊規則
    }
  },
  
  [PIECE_TYPES.W]: {
    name: '戰士',
    moveRange: 1,
    moveDirections: [DIRECTIONS.UP, DIRECTIONS.DOWN, DIRECTIONS.LEFT, DIRECTIONS.RIGHT],
    attackRange: 1,
    attackDirections: [DIRECTIONS.UP, DIRECTIONS.DOWN, DIRECTIONS.LEFT, DIRECTIONS.RIGHT],
    specialRules: {
      firstAttackImmunity: true, // 第一次被攻擊不會死亡
      protection: true // 可以保護相鄰的己方棋子
    }
  },
  
  [PIECE_TYPES.A]: {
    name: '弓箭手',
    moveRange: 2, // 移動範圍：2格
    moveDirections: [DIRECTIONS.UP, DIRECTIONS.DOWN, DIRECTIONS.LEFT, DIRECTIONS.RIGHT],
    attackRange: 3, // 攻擊範圍：3格
    attackDirections: [DIRECTIONS.UP, DIRECTIONS.DOWN, DIRECTIONS.LEFT, DIRECTIONS.RIGHT],
    specialRules: {
      requiresAllyInFront: true, // 攻擊時前方需要有己方棋子
      canAttackOverPieces: true, // 可以越過棋子攻擊
      cannotAttackAdjacent: true // 不能攻擊相鄰的敵人
    }
  },
  
  [PIECE_TYPES.M]: {
    name: '法師',
    moveRange: 1,
    moveDirections: [DIRECTIONS.UP, DIRECTIONS.DOWN, DIRECTIONS.LEFT, DIRECTIONS.RIGHT],
    attackRange: 2, // 攻擊範圍：2格
    attackDirections: [
      DIRECTIONS.UP, DIRECTIONS.DOWN, DIRECTIONS.LEFT, DIRECTIONS.RIGHT,
      DIRECTIONS.UP_LEFT, DIRECTIONS.UP_RIGHT, DIRECTIONS.DOWN_LEFT, DIRECTIONS.DOWN_RIGHT
    ],
    specialRules: {
      areaAttack: true, // 範圍攻擊
      canAttackOverPieces: true // 可以越過棋子攻擊
    }
  },
  
  [PIECE_TYPES.K]: {
    name: '騎士',
    moveRange: 3, // 移動範圍：3格
    moveDirections: [DIRECTIONS.UP, DIRECTIONS.DOWN, DIRECTIONS.LEFT, DIRECTIONS.RIGHT],
    attackRange: 1,
    attackDirections: [DIRECTIONS.UP, DIRECTIONS.DOWN, DIRECTIONS.LEFT, DIRECTIONS.RIGHT],
    specialRules: {
      highMobility: true, // 高機動性
      canMoveThroughPieces: false // 不能穿過其他棋子
    }
  }
};

// 獲取棋子的移動範圍
export const getPieceMoveRange = (pieceType) => {
  return PIECE_RULES[pieceType]?.moveRange || 1;
};

// 獲取棋子的攻擊範圍
export const getPieceAttackRange = (pieceType) => {
  return PIECE_RULES[pieceType]?.attackRange || 1;
};

// 獲取棋子的移動方向
export const getPieceMoveDirections = (pieceType) => {
  return PIECE_RULES[pieceType]?.moveDirections || [DIRECTIONS.UP, DIRECTIONS.DOWN, DIRECTIONS.LEFT, DIRECTIONS.RIGHT];
};

// 獲取棋子的攻擊方向
export const getPieceAttackDirections = (pieceType) => {
  return PIECE_RULES[pieceType]?.attackDirections || [DIRECTIONS.UP, DIRECTIONS.DOWN, DIRECTIONS.LEFT, DIRECTIONS.RIGHT];
};

// 獲取棋子的特殊規則
export const getPieceSpecialRules = (pieceType) => {
  return PIECE_RULES[pieceType]?.specialRules || {};
};

// 檢查位置是否在棋盤範圍內
export const isValidPosition = (row, col, boardSize) => {
  return row >= 0 && row < boardSize && col >= 0 && col < boardSize;
};

// 獲取棋子的所有可能移動位置
export const getPossibleMoves = (pieceType, fromRow, fromCol, board, pieceOwners, currentPlayer) => {
  const moves = [];
  const moveRange = getPieceMoveRange(pieceType);
  const moveDirections = getPieceMoveDirections(pieceType);
  const boardSize = board.length;
  
  moveDirections.forEach(([dRow, dCol]) => {
    for (let distance = 1; distance <= moveRange; distance++) {
      const newRow = fromRow + (dRow * distance);
      const newCol = fromCol + (dCol * distance);
      
      if (!isValidPosition(newRow, newCol, boardSize)) {
        break; // 超出棋盤範圍，停止這個方向
      }
      
      const targetPiece = board[newRow][newCol];
      
      if (targetPiece === PIECE_TYPES.EMPTY) {
        // 空位置，可以移動
        moves.push({ row: newRow, col: newCol, type: 'move' });
      } else {
        // 遇到棋子就停止這個方向，移動不能攻擊
        break;
      }
    }
  });
  
  return moves;
};

// 獲取棋子的所有可能攻擊位置
export const getPossibleAttacks = (pieceType, fromRow, fromCol, board, pieceOwners, currentPlayer) => {
  const attacks = [];
  const attackRange = getPieceAttackRange(pieceType);
  const attackDirections = getPieceAttackDirections(pieceType);
  const specialRules = getPieceSpecialRules(pieceType);
  const boardSize = board.length;
  
  attackDirections.forEach(([dRow, dCol]) => {
    for (let distance = 1; distance <= attackRange; distance++) {
      const newRow = fromRow + (dRow * distance);
      const newCol = fromCol + (dCol * distance);
      
      if (!isValidPosition(newRow, newCol, boardSize)) {
        break;
      }
      
      const targetPiece = board[newRow][newCol];
      
      if (targetPiece !== PIECE_TYPES.EMPTY) {
        const pieceKey = `${newRow}-${newCol}`;
        const targetOwner = pieceOwners[pieceKey];
        
        if (targetOwner && targetOwner !== currentPlayer) {
          // 檢查特殊規則
          if (specialRules.requiresAllyInFront) {
            // 弓箭手需要前方有己方棋子
            if (hasAllyInFront(fromRow, fromCol, newRow, newCol, board, pieceOwners, currentPlayer)) {
              attacks.push({ row: newRow, col: newCol, type: 'attack' });
            }
          } else if (specialRules.cannotAttackAdjacent && distance === 1) {
            // 弓箭手不能攻擊相鄰敵人
            continue;
          } else {
            attacks.push({ row: newRow, col: newCol, type: 'attack' });
          }
        }
        
        // 如果不能越過棋子攻擊，就停止
        if (!specialRules.canAttackOverPieces) {
          break;
        }
      }
    }
  });
  
  return attacks;
};

// 檢查弓箭手前方是否有己方棋子
const hasAllyInFront = (fromRow, fromCol, targetRow, targetCol, board, pieceOwners, currentPlayer) => {
  const dRow = targetRow - fromRow;
  const dCol = targetCol - fromCol;
  const stepRow = dRow > 0 ? 1 : dRow < 0 ? -1 : 0;
  const stepCol = dCol > 0 ? 1 : dCol < 0 ? -1 : 0;
  
  // 檢查從弓箭手到目標之間是否有己方棋子
  let checkRow = fromRow + stepRow;
  let checkCol = fromCol + stepCol;
  
  while (checkRow !== targetRow || checkCol !== targetCol) {
    const piece = board[checkRow][checkCol];
    if (piece !== PIECE_TYPES.EMPTY) {
      const pieceKey = `${checkRow}-${checkCol}`;
      const owner = pieceOwners[pieceKey];
      if (owner === currentPlayer) {
        return true; // 找到己方棋子
      }
    }
    checkRow += stepRow;
    checkCol += stepCol;
  }
  
  return false;
};

// 檢查移動是否合法
export const isValidMove = (pieceType, fromRow, fromCol, toRow, toCol, board, pieceOwners, currentPlayer) => {
  const possibleMoves = getPossibleMoves(pieceType, fromRow, fromCol, board, pieceOwners, currentPlayer);
  return possibleMoves.some(move => move.row === toRow && move.col === toCol);
};

// 檢查攻擊是否合法
export const isValidAttack = (pieceType, fromRow, fromCol, toRow, toCol, board, pieceOwners, currentPlayer) => {
  const possibleAttacks = getPossibleAttacks(pieceType, fromRow, fromCol, board, pieceOwners, currentPlayer);
  return possibleAttacks.some(attack => attack.row === toRow && attack.col === toCol);
};

// 檢查是否為相鄰位置
export const isAdjacent = (row1, col1, row2, col2) => {
  const rowDiff = Math.abs(row1 - row2);
  const colDiff = Math.abs(col1 - col2);
  return (rowDiff === 1 && colDiff === 0) || (rowDiff === 0 && colDiff === 1);
};

// 獲取棋子規則的完整資訊
export const getPieceRuleInfo = (pieceType) => {
  return PIECE_RULES[pieceType] || null;
};
