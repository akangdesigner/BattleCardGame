import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Dimensions,
  Modal,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

const { width, height } = Dimensions.get('window');

const BoardPositionCard = ({ 
  visible, 
  position, 
  onClose
}) => {
  const [fadeAnim] = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(height));

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.spring(slideAnim, {
          toValue: 0,
          tension: 100,
          friction: 8,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: height,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);

  if (!position) return null;

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="none"
      onRequestClose={onClose}
    >
      <Animated.View
        style={[
          styles.overlay,
          { opacity: fadeAnim }
        ]}
      >
        <TouchableOpacity
          style={styles.backdrop}
          activeOpacity={1}
          onPress={onClose}
        />
        
        <Animated.View
          style={[
            styles.cardContainer,
            { transform: [{ translateY: slideAnim }] }
          ]}
        >
          <LinearGradient
            colors={data.gradient}
            style={styles.card}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            {/* 背景圖案 */}
            <View style={styles.bgPattern}>
              <Text style={styles.bgPatternText}>{data.bgPattern}</Text>
            </View>
            
            {/* 關閉按鈕 */}
            <TouchableOpacity
              style={styles.closeButton}
              onPress={onClose}
            >
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>
            
            {/* 上半部：大圖展示 */}
            <View style={styles.imageSection}>
              <View style={styles.piece3DContainer}>
                <View style={[styles.piece3D, { backgroundColor: data.gradient[0] }]}>
                  <Text style={styles.piece3DSymbol}>{piece}</Text>
                  <View style={styles.piece3DHighlight} />
                </View>
                <View style={[styles.piece3DShadow, { backgroundColor: data.gradient[1] }]} />
              </View>
            </View>
            
            {/* 中間資訊 */}
            <ScrollView style={styles.infoSection} showsVerticalScrollIndicator={false}>
              <Text style={styles.pieceName}>{data.name}</Text>
              <Text style={styles.pieceCategory}>{data.category}</Text>
              
              {/* 能力值 */}
              <View style={styles.statsContainer}>
                <Text style={styles.statsTitle}>能力值</Text>
                <View style={styles.statsGrid}>
                  <View style={styles.statItem}>
                    <Text style={styles.statLabel}>攻擊</Text>
                    <View style={styles.statBar}>
                      <View style={[styles.statFill, { width: `${data.stats.attack * 10}%` }]} />
                    </View>
                    <Text style={styles.statValue}>{data.stats.attack}</Text>
                  </View>
                  <View style={styles.statItem}>
                    <Text style={styles.statLabel}>防禦</Text>
                    <View style={styles.statBar}>
                      <View style={[styles.statFill, { width: `${data.stats.defense * 10}%` }]} />
                    </View>
                    <Text style={styles.statValue}>{data.stats.defense}</Text>
                  </View>
                  <View style={styles.statItem}>
                    <Text style={styles.statLabel}>速度</Text>
                    <View style={styles.statBar}>
                      <View style={[styles.statFill, { width: `${data.stats.speed * 10}%` }]} />
                    </View>
                    <Text style={styles.statValue}>{data.stats.speed}</Text>
                  </View>
                  <View style={styles.statItem}>
                    <Text style={styles.statLabel}>特殊</Text>
                    <View style={styles.statBar}>
                      <View style={[styles.statFill, { width: `${data.stats.special * 10}%` }]} />
                    </View>
                    <Text style={styles.statValue}>{data.stats.special}</Text>
                  </View>
                </View>
              </View>
              
              {/* 技能描述 */}
              <View style={styles.skillSection}>
                <Text style={styles.skillTitle}>技能</Text>
                <Text style={styles.skillDescription}>{data.skill}</Text>
                <Text style={styles.pieceDescription}>{data.description}</Text>
              </View>
            </ScrollView>
            
            {/* 下半部：互動按鈕 */}
            <View style={styles.buttonSection}>
              <TouchableOpacity
                style={styles.skillButton}
                onPress={() => onViewSkills && onViewSkills()}
              >
                <LinearGradient
                  colors={['#34495E', '#2C3E50']}
                  style={styles.buttonGradient}
                >
                  <Text style={styles.buttonText}>查看技能詳解</Text>
                </LinearGradient>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.backButton}
                onPress={onClose}
              >
                <Text style={styles.backButtonText}>返回棋盤</Text>
              </TouchableOpacity>
            </View>
          </LinearGradient>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'flex-end',
  },
  backdrop: {
    flex: 1,
  },
  cardContainer: {
    height: height * 0.8,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    overflow: 'hidden',
  },
  card: {
    flex: 1,
    padding: 20,
    position: 'relative',
  },
  bgPattern: {
    position: 'absolute',
    top: 20,
    right: 20,
    opacity: 0.1,
  },
  bgPatternText: {
    fontSize: 120,
    color: '#FFFFFF',
  },
  closeButton: {
    position: 'absolute',
    top: 20,
    right: 20,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  closeButtonText: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: 'bold',
  },
  imageSection: {
    height: 120,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  piece3DContainer: {
    position: 'relative',
    width: 100,
    height: 100,
  },
  piece3D: {
    position: 'absolute',
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 10,
  },
  piece3DSymbol: {
    color: '#FFFFFF',
    fontSize: 40,
    fontWeight: 'bold',
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 4,
  },
  piece3DHighlight: {
    position: 'absolute',
    width: 40,
    height: 40,
    borderRadius: 20,
    top: 15,
    left: 15,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  piece3DShadow: {
    position: 'absolute',
    width: 90,
    height: 90,
    borderRadius: 45,
    bottom: -5,
    right: 5,
    opacity: 0.3,
  },
  infoSection: {
    flex: 1,
    marginBottom: 20,
  },
  pieceName: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 8,
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  pieceCategory: {
    fontSize: 18,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    marginBottom: 20,
  },
  statsContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 15,
    padding: 15,
    marginBottom: 20,
  },
  statsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 15,
    textAlign: 'center',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statItem: {
    width: '48%',
    marginBottom: 15,
  },
  statLabel: {
    fontSize: 14,
    color: '#FFFFFF',
    marginBottom: 5,
  },
  statBar: {
    height: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 5,
  },
  statFill: {
    height: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 4,
  },
  statValue: {
    fontSize: 12,
    color: '#FFFFFF',
    textAlign: 'right',
  },
  skillSection: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 15,
    padding: 15,
  },
  skillTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 10,
  },
  skillDescription: {
    fontSize: 16,
    color: '#FFFFFF',
    marginBottom: 10,
    lineHeight: 22,
  },
  pieceDescription: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    lineHeight: 20,
  },
  buttonSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 10,
  },
  skillButton: {
    flex: 1,
    marginRight: 10,
  },
  buttonGradient: {
    paddingVertical: 15,
    borderRadius: 25,
    alignItems: 'center',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  backButton: {
    flex: 1,
    paddingVertical: 15,
    borderRadius: 25,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
  },
  backButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default CharacterCard;
