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
  const [playerDeck, setPlayerDeck] = useState(['S', 'A', 'M', 'K', 'P', 'AS', 'MT']); // 默認棋組

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

  const handleSelectGameMode = (mode) => {
    setGameMode(mode);
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
