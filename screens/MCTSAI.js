// MCTS AI for React Native

// MCTS節點類
class MCTSNode {
  constructor(state, parent = null, action = null) {
    this.state = state;
    this.parent = parent;
    this.action = action;
    this.children = [];
    this.visits = 0;
    this.wins = 0;
    this.untriedActions = state.getLegalActions();
  }

  // 計算UCB1值
  getUCB1(c = 1.414) {
    if (this.visits === 0) return Infinity;
    return (this.wins / this.visits) + c * Math.sqrt(Math.log(this.parent.visits) / this.visits);
  }

  // 選擇最佳子節點
  selectChild() {
    return this.children.reduce((best, child) => {
      return child.getUCB1() > best.getUCB1() ? child : best;
    });
  }

  // 擴展節點
  expand() {
    if (this.untriedActions.length === 0) return null;
    
    const action = this.untriedActions.pop();
    const newState = this.state.copy();
    newState.makeMove(action);
    
    const child = new MCTSNode(newState, this, action);
    this.children.push(child);
    return child;
  }

  // 反向傳播結果
  backpropagate(result) {
    this.visits++;
    this.wins += result;
    if (this.parent) {
      this.parent.backpropagate(result);
    }
  }

  // 檢查是否完全展開
  isFullyExpanded() {
    return this.untriedActions.length === 0;
  }

  // 檢查是否為葉節點
  isLeaf() {
    return this.children.length === 0;
  }
}

// 遊戲狀態類
class GameState {
  constructor(board, pieceStates, currentPlayer) {
    this.board = board.map(row => [...row]);
    this.pieceStates = { ...pieceStates };
    this.currentPlayer = currentPlayer;
    this.BOARD_SIZE = 10;
  }

  // 複製遊戲狀態
  copy() {
    return new GameState(this.board, this.pieceStates, this.currentPlayer);
  }

  // 獲取合法動作
  getLegalActions() {
    const actions = [];
    const isAITurn = this.currentPlayer === 'ai';
    
    for (let row = 0; row < this.BOARD_SIZE; row++) {
      for (let col = 0; col < this.BOARD_SIZE; col++) {
        const piece = this.board[row][col];
        if (piece !== 'empty' && this.getPiecePlayer(row, col) === this.currentPlayer) {
          // 獲取該棋子的所有可能移動
          const moves = this.getPossibleMoves(row, col);
          moves.forEach(move => {
            actions.push({
              from: { row, col, piece },
              to: move
            });
          });
        }
      }
    }
    
    return actions;
  }

  // 判斷棋子屬於哪個玩家
  getPiecePlayer(row, col) {
    return row < 5 ? 'human' : 'ai';
  }

  // 獲取可能的移動
  getPossibleMoves(row, col) {
    const moves = [];
    const directions = [[-1, 0], [1, 0], [0, -1], [0, 1]]; // 上下左右
    
    directions.forEach(([dRow, dCol]) => {
      const newRow = row + dRow;
      const newCol = col + dCol;
      
      if (this.isValidPosition(newRow, newCol)) {
        const targetPiece = this.board[newRow][newCol];
        if (targetPiece === 'empty' || this.isEnemyPiece(newRow, newCol)) {
          moves.push({ row: newRow, col: newCol, piece: targetPiece });
        }
      }
    });
    
    return moves;
  }

  // 檢查位置是否有效
  isValidPosition(row, col) {
    return row >= 0 && row < this.BOARD_SIZE && col >= 0 && col < this.BOARD_SIZE;
  }

  // 檢查是否為敵方棋子
  isEnemyPiece(row, col) {
    const piecePlayer = this.getPiecePlayer(row, col);
    return piecePlayer !== this.currentPlayer;
  }

  // 執行移動
  makeMove(action) {
    const { from, to } = action;
    const piece = this.board[from.row][from.col];
    const targetPiece = this.board[to.row][to.col];
    
    // 更新棋盤
    this.board[to.row][to.col] = piece;
    this.board[from.row][from.col] = 'empty';
    
    // 更新棋子狀態追蹤
    const newKey = `${to.row}-${to.col}`;
    const oldKey = `${from.row}-${from.col}`;
    if (this.pieceStates[oldKey]) {
      this.pieceStates[newKey] = { ...this.pieceStates[oldKey] };
      delete this.pieceStates[oldKey];
    }
    
    // 處理戰鬥
    if (targetPiece !== 'empty' && this.isEnemyPiece(to.row, to.col)) {
      this.handleCombat(from.row, from.col, to.row, to.col);
    }
    
    // 切換玩家
    this.currentPlayer = this.currentPlayer === 'human' ? 'ai' : 'human';
  }

  // 處理戰鬥邏輯
  handleCombat(attackerRow, attackerCol, targetRow, targetCol) {
    const targetPiece = this.board[targetRow][targetCol];
    const targetKey = `${targetRow}-${targetCol}`;
    const targetState = this.pieceStates[targetKey];
    
    // 如果是戰士且第一次被攻擊
    if (targetPiece === 'W' && targetState && !targetState.hasBeenAttacked) {
      this.pieceStates[targetKey] = {
        ...this.pieceStates[targetKey],
        hasBeenAttacked: true
      };
      // 戰士存活，攻擊者回到原位置
      this.board[attackerRow][attackerCol] = this.board[targetRow][targetCol];
      this.board[targetRow][targetCol] = targetPiece;
    }
    // 其他情況，敵方棋子被移除（已在makeMove中處理）
  }

  // 檢查遊戲是否結束
  isTerminal() {
    const humanPieces = this.countPieces('human');
    const aiPieces = this.countPieces('ai');
    return humanPieces === 0 || aiPieces === 0;
  }

  // 計算某個玩家的棋子數量
  countPieces(player) {
    let count = 0;
    for (let row = 0; row < this.BOARD_SIZE; row++) {
      for (let col = 0; col < this.BOARD_SIZE; col++) {
        if (this.board[row][col] !== 'empty' && this.getPiecePlayer(row, col) === player) {
          count++;
        }
      }
    }
    return count;
  }

  // 獲取遊戲結果（從AI角度）
  getResult() {
    const humanPieces = this.countPieces('human');
    const aiPieces = this.countPieces('ai');
    
    if (aiPieces === 0) return 0; // AI失敗
    if (humanPieces === 0) return 1; // AI勝利
    return 0.5; // 平局（未結束）
  }
}

// MCTS AI類
class MCTSAI {
  constructor(simulations = 200) {
    this.simulations = simulations;
  }

  // 隨機模擬
  randomSimulation(state) {
    let currentState = state.copy();
    let depth = 0;
    const maxDepth = 50; // 防止無限循環
    
    while (!currentState.isTerminal() && depth < maxDepth) {
      const actions = currentState.getLegalActions();
      if (actions.length === 0) break;
      
      const randomAction = actions[Math.floor(Math.random() * actions.length)];
      currentState.makeMove(randomAction);
      depth++;
    }
    
    return currentState.getResult();
  }

  // 選擇階段
  select(node) {
    while (!node.isLeaf()) {
      if (!node.isFullyExpanded()) {
        return node.expand();
      } else {
        node = node.selectChild();
      }
    }
    return node;
  }

  // 擴展階段
  expand(node) {
    if (node.untriedActions.length > 0) {
      return node.expand();
    }
    return node;
  }

  // 模擬階段
  simulate(node) {
    return this.randomSimulation(node.state);
  }

  // 反向傳播階段
  backpropagate(node, result) {
    node.backpropagate(result);
  }

  // 獲取最佳動作
  getBestAction(root) {
    if (root.children.length === 0) return null;
    
    return root.children.reduce((best, child) => {
      return child.visits > best.visits ? child : best;
    }).action;
  }

  // 主要MCTS算法
  search(initialState) {
    const root = new MCTSNode(initialState);
    
    // 如果沒有合法動作，直接返回
    if (root.untriedActions.length === 0) {
      return null;
    }
    
    for (let i = 0; i < this.simulations; i++) {
      // 1. 選擇
      let node = this.select(root);
      
      // 2. 擴展
      node = this.expand(node);
      
      // 3. 模擬
      const result = this.simulate(node);
      
      // 4. 反向傳播
      this.backpropagate(node, result);
    }
    
    return this.getBestAction(root);
  }
}

// 使用MCTS的AI移動函數
export const makeMCTSMove = (board, pieceStates, currentPlayer) => {
  const gameState = new GameState(board, pieceStates, currentPlayer);
  const mctsAI = new MCTSAI(200); // 200次模擬
  
  const bestAction = mctsAI.search(gameState);
  
  if (!bestAction) {
    return null; // 沒有可用動作
  }
  
  return {
    from: bestAction.from,
    to: bestAction.to,
    action: bestAction
  };
};

export { MCTSAI, GameState, MCTSNode };
