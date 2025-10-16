import React, { useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import MainScreen from './screens/MainScreen';
import GameModeSelection from './screens/GameModeSelection';
import PieceIntroduction from './screens/PieceIntroduction';
import ChessBoard3D from './screens/ChessBoard3D';
import DeckBuilderScreen from './screens/DeckBuilderScreen';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState('main');
  const [gameMode, setGameMode] = useState(null);
  const [playerDeck, setPlayerDeck] = useState({ 
    pieces: ['S', 'SM', 'A', 'M', 'CASTLE', 'MT'],
    frontRowPieces: ['S', 'SM'], // 前排2個基礎型
    backRowPieces: ['A', 'M', 'CASTLE', 'MT'], // 中後排2個特殊型1個建築物1個英雄型
    name: '默認棋組' 
  }); // 默認棋組（6個棋子：前排2個基礎型 + 中後排2個特殊型1個建築物1個英雄型）

  const navigateToScreen = (screen) => {
    setCurrentScreen(screen);
  };

  const handleStartGame = () => {
    navigateToScreen('gameMode');
  };

  const handlePieceIntro = () => {
    navigateToScreen('pieceIntro');
  };

  const handleDeckBuilder = () => {
    navigateToScreen('deckBuilder');
  };

  const handleSaveDeck = (newDeck) => {
    setPlayerDeck(newDeck);
    console.log('棋組已保存:', newDeck);
  };

  const handleSelectGameMode = (mode, selectedDeck = null) => {
    console.log('選擇遊戲模式:', mode, '棋組:', selectedDeck);
    setGameMode(mode);
    if (selectedDeck && selectedDeck.pieces) {
      setPlayerDeck(selectedDeck);
      console.log('設置棋組:', selectedDeck);
    } else {
      console.log('沒有選擇棋組，使用默認棋組');
    }
    navigateToScreen('game');
  };

  const handleBackToMain = () => {
    setGameMode(null);
    navigateToScreen('main');
  };

  const handleBackToGameMode = () => {
    navigateToScreen('gameMode');
  };

  const renderCurrentScreen = () => {
    switch (currentScreen) {
      case 'main':
        return (
          <MainScreen
            onStartGame={handleStartGame}
            onPieceIntro={handlePieceIntro}
            onDeckBuilder={handleDeckBuilder}
          />
        );
      case 'gameMode':
        return (
          <GameModeSelection
            onSelectMode={handleSelectGameMode}
            onBack={handleBackToMain}
          />
        );
      case 'pieceIntro':
        return (
          <PieceIntroduction
            onBack={handleBackToMain}
          />
        );
      case 'deckBuilder':
        return (
          <DeckBuilderScreen
            onBack={handleBackToMain}
            onSaveDeck={handleSaveDeck}
          />
        );
      case 'game':
        return (
          <ChessBoard3D
            onBack={handleBackToGameMode}
            gameMode={gameMode}
            playerDeck={playerDeck}
          />
        );
      default:
        return (
          <MainScreen
            onStartGame={handleStartGame}
            onPieceIntro={handlePieceIntro}
            onDeckBuilder={handleDeckBuilder}
          />
        );
    }
  };

  return (
    <LinearGradient
      colors={['#1a1a1a', '#2d2d2d', '#1a1a1a']}
      style={styles.container}
    >
      <StatusBar style="light" />
      {renderCurrentScreen()}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
