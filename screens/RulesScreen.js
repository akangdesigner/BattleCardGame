import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

// 規則分類資料
const RULE_CATEGORIES = [
  {
    id: 'basic',
    title: '基本規則',
    icon: '⚔️',
    color: '#FFD700',
    rules: [
      '🎯 遊戲目標',
      '在 8x8 棋盤上指揮你的部隊，運用棋子與卡牌策略，擊毀敵方主堡或殲滅所有敵軍以取得勝利。',
      '',
      '🔄 回合流程',
      '• 玩家與對手輪流行動',
      '• 每回合開始時會自動回滿「行動點」',
      '• 玩家可抽取卡牌（若設有卡組機制）',
      '',
      '⚡ 行動階段',
      '在自己的回合內，你可以消耗行動點進行以下操作：',
      '• 移動棋子：依照棋子的移動距離移動',
      '• 攻擊敵人：消耗指定行動點，對目標造成傷害',
      '• 使用卡牌：發動技能、召喚、或特殊效果',
      '• 點擊卡牌可以查看卡牌詳細資訊',
      '• 拖曳卡牌到棋盤上可以打出卡牌',
      '• 卡牌與棋子的移動攻擊共用同一套行動點系統',
      '• 每個動作都會消耗一定行動點',
      '• 當行動點耗盡時，該回合結束',
      '',
      '🏁 結束回合',
      '• 玩家按下「結束回合」後，行動權轉移給敵方',
      '• 所有增益／減益效果依回合進行刷新或結束'
    ]
  },
  {
    id: 'combat',
    title: '戰鬥規則',
    icon: '⚔️',
    color: '#E74C3C',
    rules: [
      '🎯 戰鬥機制',
      '• 棋子無法重疊或穿越其他單位',
      '• 攻擊距離依單位種類決定（近戰需相鄰，遠程可跨格攻擊）',
      '• 當單位生命歸零即從棋盤移除',
      '',
      '🏰 主堡系統',
      '• 主堡是遊戲的核心目標',
      '• 摧毀敵方主堡即可獲勝',
      '• 主堡具有較高的生命值',
      '',
      '💥 攻擊類型',
      '• 近戰攻擊：只能攻擊相鄰的敵人',
      '• 遠程攻擊：可以攻擊距離較遠的敵人',
      '• 魔法攻擊：具有特殊效果的攻擊',
      '• 範圍攻擊：可以同時攻擊多個敵人'
    ]
  },
  {
    id: 'victory',
    title: '勝負判定',
    icon: '🏆',
    color: '#9B59B6',
    rules: [
      '🎯 勝利條件',
      '• 摧毀敵方英雄卡即可獲勝',
      '• 摧毀敵方城堡卡也可獲勝',
      '• 殲滅敵方所有棋子也可獲勝',
      '',
      '💜 血條系統',
      '• 紫色血條：代表300血量（英雄卡、城堡卡）',
      '• 綠色血條：代表200血量（高血量單位）',
      '• 紅色血條：代表100血量（一般單位）'
    ]
  },
  {
    id: 'strategy',
    title: '策略建議',
    icon: '🧠',
    color: '#2ECC71',
    rules: [
      '🎯 基本策略',
      '• 保護重要棋子：優先保護具有特殊能力的棋子',
      '• 合理佈局：將遠程棋子放在後方，近戰棋子放在前方',
      '• 控制節奏：合理使用行動點，不要浪費',
      '',
      '⚔️ 戰鬥策略',
      '• 預測對手：觀察對手行動，預測下一步',
      '• 組合攻擊：多個棋子協同攻擊同一目標',
      '• 防守反擊：先防守再反擊，穩紮穩打',
      '• 快速突擊：利用高機動性棋子快速突擊',
      '',
      '🎲 進階技巧',
      '• 消耗戰：利用高血量棋子進行消耗戰',
      '• 心理戰：利用特殊能力影響對手判斷',
      '• 資源管理：合理分配行動點和卡牌資源',
      '• 時機把握：在最佳時機發動攻擊或使用技能'
    ]
  }
];

const RulesScreen = ({ onBack }) => {
  const [selectedCategory, setSelectedCategory] = useState(RULE_CATEGORIES[0]);

  const renderCategoryButton = (category) => (
    <TouchableOpacity
      key={category.id}
      style={[
        styles.categoryButton,
        selectedCategory.id === category.id && styles.selectedCategoryButton,
      ]}
      onPress={() => setSelectedCategory(category)}
      activeOpacity={0.8}
    >
      <LinearGradient
        colors={
          selectedCategory.id === category.id
            ? [category.color, category.color + 'AA', category.color + '66']
            : ['rgba(255,255,255,0.1)', 'rgba(255,255,255,0.05)']
        }
        style={styles.categoryButtonGradient}
      >
        <Text style={styles.categoryIcon}>{category.icon}</Text>
        <Text style={styles.categoryTitle}>{category.title}</Text>
      </LinearGradient>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
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
          <Text style={styles.title}>規則說明</Text>
          <Text style={styles.subtitle}>Game Rules</Text>
          <View style={styles.titleUnderline} />
        </View>

        {/* 分類選擇區域 */}
        <View style={styles.categoriesContainer}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoriesList}
          >
            {RULE_CATEGORIES.map(renderCategoryButton)}
          </ScrollView>
        </View>

        {/* 規則內容區域 */}
        <ScrollView style={styles.rulesContainer} showsVerticalScrollIndicator={false}>
          <View style={styles.rulesCard}>
            <LinearGradient
              colors={[selectedCategory.color + 'AA', selectedCategory.color + '66']}
              style={styles.rulesCardGradient}
            >
              <View style={styles.rulesHeader}>
                <Text style={styles.rulesIcon}>{selectedCategory.icon}</Text>
                <Text style={styles.rulesTitle}>{selectedCategory.title}</Text>
              </View>
              
              <View style={styles.rulesList}>
                {selectedCategory.rules.map((rule, index) => {
                  if (rule === '') {
                    return <View key={index} style={styles.ruleSpacer} />;
                  }
                  
                  const isTitle = rule.startsWith('🎯') || rule.startsWith('🔄') || rule.startsWith('⚡') || 
                                rule.startsWith('🏁') || rule.startsWith('🏰') || rule.startsWith('💥') || 
                                rule.startsWith('⏰') || rule.startsWith('📊') || rule.startsWith('🏹') || 
                                rule.startsWith('👑') || rule.startsWith('⚔️') || rule.startsWith('🎲');
                  
                  return (
                    <View key={index} style={styles.ruleItem}>
                      <Text style={[
                        styles.ruleText,
                        isTitle ? styles.ruleTitle : styles.ruleContent
                      ]}>
                        {rule}
                      </Text>
                    </View>
                  );
                })}
              </View>
            </LinearGradient>
          </View>
        </ScrollView>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a1a',
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
    paddingTop: 100,
    paddingHorizontal: 20,
  },
  titleContainer: {
    alignItems: 'center',
    marginBottom: 30,
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
  categoriesContainer: {
    height: 120,
    marginBottom: 20,
  },
  categoriesList: {
    paddingHorizontal: 10,
  },
  categoryButton: {
    width: 100,
    height: 100,
    marginHorizontal: 8,
    borderRadius: 15,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  selectedCategoryButton: {
    elevation: 8,
    shadowOpacity: 0.4,
    shadowRadius: 8,
  },
  categoryButtonGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 15,
    padding: 10,
  },
  categoryIcon: {
    fontSize: 24,
    marginBottom: 4,
  },
  categoryTitle: {
    fontSize: 12,
    color: '#FFFFFF',
    fontWeight: '600',
    textAlign: 'center',
  },
  rulesContainer: {
    flex: 1,
  },
  rulesCard: {
    borderRadius: 20,
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
  },
  rulesCardGradient: {
    padding: 20,
    borderRadius: 20,
  },
  rulesHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  rulesIcon: {
    fontSize: 32,
    marginRight: 15,
  },
  rulesTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  rulesList: {
    flex: 1,
  },
  ruleItem: {
    marginBottom: 8,
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  ruleSpacer: {
    height: 12,
  },
  ruleText: {
    fontSize: 14,
    color: '#F0F0F0',
    lineHeight: 22,
  },
  ruleTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFD700',
    marginBottom: 4,
    marginTop: 8,
  },
  ruleContent: {
    fontSize: 14,
    color: '#E0E0E0',
    lineHeight: 20,
    marginLeft: 8,
  },
});

export default RulesScreen;
