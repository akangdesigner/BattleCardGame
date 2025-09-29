import React, { useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import MainScreen from './screens/MainScreen';
import GameModeSelection from './screens/GameModeSelection';
import PieceIntroduction from './screens/PieceIntroduction';
import ChessBoard3D from './screens/ChessBoard3D';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState('main');
  const [gameMode, setGameMode] = useState(null);

  const navigateToScreen = (screen) => {
    setCurrentScreen(screen);
  };

  const handleStartGame = () => {
    navigateToScreen('gameMode');
  };

  const handlePieceIntro = () => {
    navigateToScreen('pieceIntro');
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
