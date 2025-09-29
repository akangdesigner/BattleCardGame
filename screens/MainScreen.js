import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

const MainScreen = ({ onStartGame, onPieceIntro }) => {
  return (
    <LinearGradient
      colors={['#1a1a1a', '#2d2d2d', '#1a1a1a']}
      style={styles.container}
    >
      <View style={styles.content}>
        {/* 應用名稱 */}
        <View style={styles.titleContainer}>
          <Text style={styles.appTitle}>戰棋大師</Text>
          <Text style={styles.appSubtitle}>Chess Master</Text>
          <View style={styles.titleUnderline} />
        </View>

        {/* 按鈕區域 */}
        <View style={styles.buttonContainer}>
          {/* 開始對戰按鈕 */}
          <TouchableOpacity
            style={styles.mainButton}
            onPress={onStartGame}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={['#FFD700', '#FFA500', '#FF8C00']}
              style={styles.buttonGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Text style={styles.buttonText}>開始對戰</Text>
              <Text style={styles.buttonSubText}>Start Battle</Text>
            </LinearGradient>
          </TouchableOpacity>

          {/* 棋子介紹按鈕 */}
          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={onPieceIntro}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={['#4169E1', '#1E90FF', '#00BFFF']}
              style={styles.buttonGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Text style={styles.buttonText}>棋子介紹</Text>
              <Text style={styles.buttonSubText}>Piece Guide</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* 底部裝飾 */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>策略與智慧的對決</Text>
        </View>
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  titleContainer: {
    alignItems: 'center',
    marginBottom: 80,
  },
  appTitle: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#FFD700',
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 4,
    marginBottom: 8,
  },
  appSubtitle: {
    fontSize: 18,
    color: '#C0C0C0',
    textAlign: 'center',
    marginBottom: 16,
    letterSpacing: 2,
  },
  titleUnderline: {
    width: 120,
    height: 3,
    backgroundColor: '#FFD700',
    borderRadius: 2,
  },
  buttonContainer: {
    width: '100%',
    alignItems: 'center',
    gap: 24,
  },
  mainButton: {
    width: '80%',
    height: 80,
    borderRadius: 20,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  secondaryButton: {
    width: '80%',
    height: 70,
    borderRadius: 18,
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
  },
  buttonGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 18,
  },
  buttonText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  buttonSubText: {
    fontSize: 14,
    color: '#F0F0F0',
    textAlign: 'center',
    marginTop: 4,
    letterSpacing: 1,
  },
  footer: {
    position: 'absolute',
    bottom: 50,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 16,
    color: '#888',
    fontStyle: 'italic',
  },
});

export default MainScreen;
