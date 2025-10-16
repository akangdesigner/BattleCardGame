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
  A: 'A', // 弓箭手
  M: 'M', // 法師
  K: 'K', // 騎士
  P: 'P', // 牧師
  AS: 'AS', // 刺客
  MT: 'MT', // 心智扭曲者
  CB: 'CB', // 弩手
  SM: 'SM', // 太刀武士
  WA: 'WA', // 戰爭建築師
  SD: 'SD', // 睏睏狗
  CC: 'CC', // 食人螃蟹
  CASTLE: 'CASTLE', // 中古城堡
  EMPTY: 'empty'
};

// 棋子規則定義
export const PIECE_RULES = {
  [PIECE_TYPES.S]: {
    name: '士兵',
    moveRange: 1, // 移動範圍：1格
    moveDirections: [DIRECTIONS.UP, DIRECTIONS.DOWN, DIRECTIONS.LEFT, DIRECTIONS.RIGHT], // 只能上下左右移動
    attackRange: 1, // 攻擊範圍：1格
    attackDistance: 1, // 攻擊距離：1格
    attackDirections: [DIRECTIONS.UP, DIRECTIONS.DOWN, DIRECTIONS.LEFT, DIRECTIONS.RIGHT], // 只能攻擊相鄰格子
    attackPower: 50, // 攻擊力：50
    maxHealth: 200, // 最大血量：200（近戰）
    health: 200, // 當前血量：200
    attackType: 'melee', // 攻擊類型：近戰
    category: 'basic', // 分類：基礎型
    specialRules: {
      // 士兵沒有特殊規則
    }
  },
  
  
  [PIECE_TYPES.A]: {
    name: '弓箭手',
    moveRange: 2, // 移動範圍：2格
    moveDirections: [DIRECTIONS.UP, DIRECTIONS.DOWN, DIRECTIONS.LEFT, DIRECTIONS.RIGHT],
    attackRange: 3, // 攻擊範圍：3格
    attackDistance: 3, // 攻擊距離：3格
    attackDirections: [DIRECTIONS.UP, DIRECTIONS.DOWN, DIRECTIONS.LEFT, DIRECTIONS.RIGHT],
    attackPower: 50, // 攻擊力：50
    maxHealth: 100, // 最大血量：100（遠程）
    health: 100, // 當前血量：100
    attackType: 'ranged', // 攻擊類型：遠程
    category: 'special', // 分類：特殊型
    specialRules: {
      requiresAllyInFront: true, // 攻擊時前方需要有己方棋子
      canAttackOverPieces: true, // 可以越過棋子攻擊
      cannotAttackAdjacent: true, // 不能攻擊相鄰的敵人
      canMoveThroughAllies: true // 可以穿過己方棋子
    }
  },
  
  [PIECE_TYPES.M]: {
    name: '法師',
    moveRange: 1,
    moveDirections: [DIRECTIONS.UP, DIRECTIONS.DOWN, DIRECTIONS.LEFT, DIRECTIONS.RIGHT],
    attackRange: 2, // 攻擊範圍：2格
    attackDistance: 2, // 攻擊距離：2格
    attackDirections: [
      DIRECTIONS.UP, DIRECTIONS.DOWN, DIRECTIONS.LEFT, DIRECTIONS.RIGHT,
      DIRECTIONS.UP_LEFT, DIRECTIONS.UP_RIGHT, DIRECTIONS.DOWN_LEFT, DIRECTIONS.DOWN_RIGHT
    ],
    attackPower: 50, // 攻擊力：50
    maxHealth: 100, // 最大血量：100（遠程魔法）
    health: 100, // 當前血量：100
    attackType: 'ranged', // 攻擊類型：遠程魔法
    category: 'special', // 分類：特殊型
    specialRules: {
      areaAttack: true, // 範圍攻擊
      canAttackOverPieces: true, // 可以越過棋子攻擊
      canMoveThroughAllies: true // 可以穿過己方棋子
    }
  },
  
  [PIECE_TYPES.K]: {
    name: '騎士',
    moveRange: 3, // 移動範圍：3格
    moveDirections: [DIRECTIONS.UP, DIRECTIONS.DOWN, DIRECTIONS.LEFT, DIRECTIONS.RIGHT],
    attackRange: 1,
    attackDistance: 1, // 攻擊距離：1格
    attackDirections: [DIRECTIONS.UP, DIRECTIONS.DOWN, DIRECTIONS.LEFT, DIRECTIONS.RIGHT],
    attackPower: 50, // 攻擊力：50
    maxHealth: 100, // 最大血量：100（特殊型）
    health: 100, // 當前血量：100
    attackType: 'melee', // 攻擊類型：近戰
    category: 'special', // 分類：特殊型
    specialRules: {
      highMobility: true, // 高機動性
      canMoveThroughPieces: false, // 不能穿過其他棋子
      canMoveThroughAllies: true // 可以穿過己方小兵
    }
  },

  [PIECE_TYPES.P]: {
    name: '牧師',
    moveRange: 1, // 移動範圍：1格
    moveDirections: [DIRECTIONS.UP, DIRECTIONS.DOWN, DIRECTIONS.LEFT, DIRECTIONS.RIGHT],
    attackRange: 1, // 攻擊範圍：1格
    attackDistance: 1, // 攻擊距離：1格
    attackDirections: [DIRECTIONS.UP, DIRECTIONS.DOWN, DIRECTIONS.LEFT, DIRECTIONS.RIGHT],
    attackPower: 50, // 攻擊力：50
    maxHealth: 100, // 最大血量：100（遠程）
    health: 100, // 當前血量：100
    attackType: 'ranged', // 攻擊類型：遠程
    category: 'special', // 分類：特殊型
    specialRules: {
      healing: true, // 可以治療己方棋子
      canHealAdjacent: true, // 可以治療相鄰的己方棋子
      canMoveThroughAllies: true // 可以穿過己方棋子
    }
  },

  [PIECE_TYPES.AS]: {
    name: '刺客',
    moveRange: 2, // 移動範圍：2格
    moveDirections: [DIRECTIONS.UP, DIRECTIONS.DOWN, DIRECTIONS.LEFT, DIRECTIONS.RIGHT],
    attackRange: 1, // 攻擊範圍：1格
    attackDistance: 1, // 攻擊距離：1格
    attackDirections: [DIRECTIONS.UP, DIRECTIONS.DOWN, DIRECTIONS.LEFT, DIRECTIONS.RIGHT],
    attackPower: 50, // 攻擊力：50
    maxHealth: 100, // 最大血量：100（遠程）
    health: 100, // 當前血量：100
    attackType: 'ranged', // 攻擊類型：遠程
    category: 'special', // 分類：特殊型
    specialRules: {
      stealth: true, // 隱身能力
      canMoveThroughPieces: true, // 可以穿過棋子移動
      highDamage: true, // 高攻擊力
      canMoveThroughAllies: true // 可以穿過己方棋子
    }
  },

  [PIECE_TYPES.MT]: {
    name: '心智扭曲者',
    moveRange: 1, // 移動範圍：1格
    moveDirections: [DIRECTIONS.UP, DIRECTIONS.DOWN, DIRECTIONS.LEFT, DIRECTIONS.RIGHT],
    attackRange: 2, // 攻擊範圍：2格
    attackDistance: 2, // 攻擊距離：2格
    attackDirections: [DIRECTIONS.UP, DIRECTIONS.DOWN, DIRECTIONS.LEFT, DIRECTIONS.RIGHT],
    attackPower: 50, // 攻擊力：50
    maxHealth: 300, // 最大血量：300（英雄）
    health: 300, // 當前血量：300
    attackType: 'ranged', // 攻擊類型：遠程
    category: 'hero', // 分類：英雄型
    specialRules: {
      mindControl: true, // 精神控制
      canControlEnemy: true, // 可以控制敵方棋子
      areaEffect: true // 範圍效果
    }
  },

  [PIECE_TYPES.CB]: {
    name: '弩手',
    moveRange: 1, // 移動範圍：1格
    moveDirections: [DIRECTIONS.UP, DIRECTIONS.DOWN, DIRECTIONS.LEFT, DIRECTIONS.RIGHT],
    attackRange: 3, // 攻擊範圍：3格
    attackDistance: 3, // 攻擊距離：3格
    attackDirections: [DIRECTIONS.UP, DIRECTIONS.DOWN, DIRECTIONS.LEFT, DIRECTIONS.RIGHT],
    attackPower: 50, // 攻擊力：50
    maxHealth: 100, // 最大血量：100（遠程）
    health: 100, // 當前血量：100
    attackType: 'ranged', // 攻擊類型：遠程
    category: 'special', // 分類：特殊型
    specialRules: {
      cannotAttackAdjacent: true, // 不能攻擊相鄰的敵人
      canAttackOverPieces: true, // 可以越過棋子攻擊
      longRange: true, // 遠程攻擊
      canMoveThroughAllies: true // 可以穿過己方棋子
    }
  },

  [PIECE_TYPES.SM]: {
    name: '太刀武士',
    moveRange: 2, // 移動範圍：2格
    moveDirections: [DIRECTIONS.UP, DIRECTIONS.DOWN, DIRECTIONS.LEFT, DIRECTIONS.RIGHT],
    attackRange: 2, // 攻擊範圍：2格
    attackDistance: 2, // 攻擊距離：2格
    attackDirections: [DIRECTIONS.UP, DIRECTIONS.DOWN, DIRECTIONS.LEFT, DIRECTIONS.RIGHT],
    attackPower: 50, // 攻擊力：50
    maxHealth: 200, // 最大血量：200（近戰）
    health: 200, // 當前血量：200
    attackType: 'melee', // 攻擊類型：近戰
    category: 'basic', // 分類：基礎型
    specialRules: {
      highAttack: true, // 高攻擊力
      canAttackOverPieces: false, // 不能越過棋子攻擊
      skilledWarrior: true // 熟練戰士
    }
  },

  [PIECE_TYPES.WA]: {
    name: '戰爭建築師',
    moveRange: 1, // 移動範圍：1格
    moveDirections: [DIRECTIONS.UP, DIRECTIONS.DOWN, DIRECTIONS.LEFT, DIRECTIONS.RIGHT],
    attackRange: 1, // 攻擊範圍：1格
    attackDistance: 1, // 攻擊距離：1格
    attackDirections: [DIRECTIONS.UP, DIRECTIONS.DOWN, DIRECTIONS.LEFT, DIRECTIONS.RIGHT],
    attackPower: 50, // 攻擊力：50
    maxHealth: 300, // 最大血量：300（英雄）
    health: 300, // 當前血量：300
    attackType: 'ranged', // 攻擊類型：遠程
    category: 'hero', // 分類：英雄型
    specialRules: {
      construction: true, // 建設能力
      canBuildDefenses: true, // 可以建造防禦設施
      supportRole: true // 支援角色
    }
  },

  [PIECE_TYPES.SD]: {
    name: '睏睏狗',
    moveRange: 1, // 移動範圍：1格
    moveDirections: [DIRECTIONS.UP, DIRECTIONS.DOWN, DIRECTIONS.LEFT, DIRECTIONS.RIGHT],
    attackRange: 1, // 攻擊範圍：1格
    attackDistance: 1, // 攻擊距離：1格
    attackDirections: [DIRECTIONS.UP, DIRECTIONS.DOWN, DIRECTIONS.LEFT, DIRECTIONS.RIGHT],
    attackPower: 50, // 攻擊力：50
    maxHealth: 200, // 最大血量：200（近戰）
    health: 200, // 當前血量：200
    attackType: 'melee', // 攻擊類型：近戰
    category: 'basic', // 分類：基礎型
    specialRules: {
      sleep: true, // 催眠能力
      canSleepEnemy: true, // 可以使敵人睡眠
      areaEffect: true // 範圍效果
    }
  },

  [PIECE_TYPES.CC]: {
    name: '食人螃蟹',
    moveRange: 1, // 移動範圍：1格
    moveDirections: [DIRECTIONS.UP, DIRECTIONS.DOWN, DIRECTIONS.LEFT, DIRECTIONS.RIGHT],
    attackRange: 1, // 攻擊範圍：1格
    attackDistance: 1, // 攻擊距離：1格
    attackDirections: [DIRECTIONS.UP, DIRECTIONS.DOWN, DIRECTIONS.LEFT, DIRECTIONS.RIGHT],
    attackPower: 50, // 攻擊力：50
    maxHealth: 200, // 最大血量：200（近戰）
    health: 200, // 當前血量：200
    attackType: 'melee', // 攻擊類型：近戰
    category: 'basic', // 分類：基礎型
    specialRules: {
      strongDefense: true, // 強防禦
      highHealth: true, // 高血量
      canDefend: true // 可以防禦
    }
  },

  [PIECE_TYPES.CASTLE]: {
    name: '中古城堡',
    moveRange: 0, // 城堡不能移動
    moveDirections: [], // 無移動方向
    attackRange: 0, // 攻擊範圍：0格（不能攻擊）
    attackDistance: 0, // 攻擊距離：0格
    attackDirections: [], // 無攻擊方向
    attackPower: 0, // 攻擊力：0（不能攻擊）
    maxHealth: 50, // 最大血量：50（城堡）
    health: 50, // 當前血量：50
    attackType: 'ranged', // 攻擊類型：遠程
    category: 'structure', // 分類：建築物
    specialRules: {
      immobile: true, // 不能移動
      highHealth: true, // 高血量
      strongDefense: true, // 強防禦
      canAttackOverPieces: true, // 可以越過棋子攻擊
      multiCell: true, // 佔據多個格子
      occupiesTwoCells: true // 佔據兩個格子
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

// 獲取棋子的最大血量
export const getPieceMaxHealth = (pieceType) => {
  return PIECE_RULES[pieceType]?.maxHealth || 100;
};

// 獲取棋子的當前血量
export const getPieceHealth = (pieceType) => {
  return PIECE_RULES[pieceType]?.health || 100;
};

// 獲取棋子的攻擊類型
export const getPieceAttackType = (pieceType) => {
  return PIECE_RULES[pieceType]?.attackType || 'melee';
};

// 獲取棋子的分類
export const getPieceCategory = (pieceType) => {
  return PIECE_RULES[pieceType]?.category || 'special';
};

// 獲取棋子的攻擊距離
export const getPieceAttackDistance = (pieceType) => {
  return PIECE_RULES[pieceType]?.attackDistance || 1;
};

// 獲取棋子的攻擊力
export const getPieceAttackPower = (pieceType) => {
  return PIECE_RULES[pieceType]?.attackPower || 50;
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
  const specialRules = getPieceSpecialRules(pieceType);
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
        // 遇到棋子，檢查是否可以穿過
        const pieceKey = `${newRow}-${newCol}`;
        const pieceOwner = pieceOwners[pieceKey];
        
        if (specialRules.canMoveThroughAllies && pieceOwner === currentPlayer) {
          // 可以穿過己方棋子，但不添加到移動列表中（因為不能移動到友方棋子位置）
          // 繼續檢查更遠的位置
        } else {
          // 不能穿過，停止這個方向
          break;
        }
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
        
        // 只對敵方棋子顯示攻擊提示
        if (targetOwner && targetOwner !== currentPlayer) {
          console.log(`攻擊目標: [${newRow},${newCol}] 敵方棋子 ${targetPiece}`);
          // 檢查特殊規則
          if (specialRules.requiresAllyInFront) {
            // 弓箭手需要前方有己方棋子
            if (hasAllyInFront(fromRow, fromCol, newRow, newCol, board, pieceOwners, currentPlayer)) {
              attacks.push({ row: newRow, col: newCol, type: 'attack' });
            }
          } else if (specialRules.cannotAttackAdjacent && distance === 1) {
            // 弩手不能攻擊相鄰敵人
            continue;
          } else {
            // 普通攻擊
            attacks.push({ row: newRow, col: newCol, type: 'attack' });
          }
        } else if (targetOwner === currentPlayer) {
          console.log(`跳過友方棋子: [${newRow},${newCol}] 友方棋子 ${targetPiece}`);
        }
        // 如果是友方棋子，不顯示攻擊提示（不添加攻擊位置）
        
        // 如果不能越過棋子攻擊，就停止這個方向
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
  const isValid = possibleMoves.some(move => move.row === toRow && move.col === toCol);
  console.log(`isValidMove: [${fromRow},${fromCol}] -> [${toRow},${toCol}] = ${isValid}, possibleMoves count: ${possibleMoves.length}`);
  return isValid;
};

// 檢查攻擊是否合法
export const isValidAttack = (pieceType, fromRow, fromCol, toRow, toCol, board, pieceOwners, currentPlayer) => {
  const possibleAttacks = getPossibleAttacks(pieceType, fromRow, fromCol, board, pieceOwners, currentPlayer);
  const isValid = possibleAttacks.some(attack => attack.row === toRow && attack.col === toCol);
  console.log(`isValidAttack: [${fromRow},${fromCol}] -> [${toRow},${toCol}] = ${isValid}, possibleAttacks count: ${possibleAttacks.length}`);
  return isValid;
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
