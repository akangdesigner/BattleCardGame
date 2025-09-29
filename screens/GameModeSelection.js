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

const GameModeSelection = ({ onSelectMode, onBack }) => {
  return (
    <LinearGradient
      colors={['#1a1a1a', '#2d2d2d', '#1a1a1a']}
      style={styles.container}
    >
      {/* 返回按鈕 */}
      <TouchableOpacity style={styles.backButton} onPress={onBack}>
        <View style={styles.backIcon}>
          <Text style={styles.backIconText}>←</Text>
        </View>
        <Text style={styles.backText}>返回</Text>
      </TouchableOpacity>

      <View style={styles.content}>
        {/* 標題 */}
        <View style={styles.titleContainer}>
          <Text style={styles.title}>選擇對戰模式</Text>
          <Text style={styles.subtitle}>Select Game Mode</Text>
          <View style={styles.titleUnderline} />
        </View>

        {/* 模式選擇按鈕 */}
        <View style={styles.modeContainer}>
          {/* AI對戰 */}
          <TouchableOpacity
            style={styles.modeButton}
            onPress={() => onSelectMode('ai')}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={['#FF6B6B', '#FF8E53', '#FF6B35']}
              style={styles.buttonGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Text style={styles.modeIcon}>🤖</Text>
              <Text style={styles.modeTitle}>AI 對戰</Text>
              <Text style={styles.modeSubtitle}>挑戰人工智慧</Text>
              <Text style={styles.modeDescription}>
                與聰明的AI對手進行策略對決
              </Text>
            </LinearGradient>
          </TouchableOpacity>

          {/* 雙人對戰 */}
          <TouchableOpacity
            style={styles.modeButton}
            onPress={() => onSelectMode('multiplayer')}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={['#4ECDC4', '#44A08D', '#2E8B57']}
              style={styles.buttonGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Text style={styles.modeIcon}>👥</Text>
              <Text style={styles.modeTitle}>雙人對戰</Text>
              <Text style={styles.modeSubtitle}>與朋友對戰</Text>
              <Text style={styles.modeDescription}>
                在同一設備上輪流操作進行對戰
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 30,
    paddingTop: 100,
  },
  titleContainer: {
    alignItems: 'center',
    marginBottom: 60,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFD700',
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 4,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#C0C0C0',
    textAlign: 'center',
    marginBottom: 16,
    letterSpacing: 1,
  },
  titleUnderline: {
    width: 100,
    height: 3,
    backgroundColor: '#FFD700',
    borderRadius: 2,
  },
  modeContainer: {
    width: '100%',
    gap: 30,
  },
  modeButton: {
    width: '100%',
    height: 140,
    borderRadius: 20,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  buttonGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
    paddingVertical: 20,
  },
  modeIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  modeTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
    marginBottom: 4,
  },
  modeSubtitle: {
    fontSize: 16,
    color: '#F0F0F0',
    textAlign: 'center',
    marginBottom: 8,
  },
  modeDescription: {
    fontSize: 14,
    color: '#E0E0E0',
    textAlign: 'center',
    paddingHorizontal: 20,
    lineHeight: 20,
  },
});

export default GameModeSelection;
