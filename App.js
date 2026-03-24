// ═══════════════════════════════════════════════════════════════════════════════
// 🎮 IT MANAGER: STARTUP TYCOON — Phase 3: Multi-Screen Navigation + Settings
// ═══════════════════════════════════════════════════════════════════════════════

import React, { useEffect, useState, useRef, Component } from 'react';
import {
  SafeAreaView,
  StatusBar,
  Text,
  View,
  StyleSheet,
  ActivityIndicator,
  Platform,
  ScrollView,
  TouchableOpacity,
} from 'react-native';

import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';

import { TEMA } from './src/constants';
import { GameProvider, useGame } from './src/context/GameContext';
import { oyunYukle } from './src/hooks/useAutoSave';

// Ekranlar
import HomeScreen from './src/screens/HomeScreen';
import AchievementsScreen from './src/screens/AchievementsScreen';
import BudgetScreen from './src/screens/BudgetScreen';
import UpgradesScreen from './src/screens/UpgradesScreen';
import SettingsScreen from './src/screens/SettingsScreen';

// ═══════════════════════════════════════════════════════════════════════════════
// 🛡️ GLOBAL ERROR BOUNDARY
// ═══════════════════════════════════════════════════════════════════════════════

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('🔴 UI Render Error:', error, errorInfo);
  }

  resetError = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <SafeAreaView style={errorStyles.container}>
          <Text style={errorStyles.emoji}>💥</Text>
          <Text style={errorStyles.title}>UI Render Error</Text>
          <ScrollView style={errorStyles.scrollArea}>
            <Text style={errorStyles.message}>
              {this.state.error?.toString() || 'Bilinmeyen hata'}
            </Text>
          </ScrollView>
          <Text style={errorStyles.hint}>
            Uygulamayı yeniden başlatmayı deneyin.
          </Text>
          <View style={errorStyles.buttonContainer}>
            <Text
              style={errorStyles.buttonText}
              onPress={this.resetError}
            >
              🔄 Yeniden Dene
            </Text>
          </View>
        </SafeAreaView>
      );
    }
    return this.props.children;
  }
}

const errorStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0B0F1A',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  emoji: { fontSize: 64, marginBottom: 16 },
  title: { fontSize: 24, fontWeight: '900', color: '#EF4444', marginBottom: 12 },
  scrollArea: { maxHeight: 200, width: '100%', marginBottom: 16 },
  message: { fontSize: 13, color: '#F87171', fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace', lineHeight: 20 },
  hint: { fontSize: 14, color: '#94A3B8', marginTop: 8 },
  buttonContainer: {
    marginTop: 24,
    backgroundColor: '#3B82F6',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  buttonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

// ═══════════════════════════════════════════════════════════════════════════════
// 🏗️ TAB NAVIGATOR
// ═══════════════════════════════════════════════════════════════════════════════

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

function GameTabs() {
  const insets = useSafeAreaInsets();

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          ...styles.tabBar,
          paddingBottom: Math.max(insets.bottom, 10),
          height: 60 + Math.max(insets.bottom, 10),
        },
        tabBarActiveTintColor: TEMA.renkler.altin,
        tabBarInactiveTintColor: TEMA.renkler.ortaGri,
        tabBarLabelStyle: styles.tabLabel,
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarLabel: 'Ana Sayfa',
          tabBarIcon: ({ focused }) => (
            <Text style={styles.tabIcon}>🏠</Text>
          ),
        }}
      />
      <Tab.Screen
        name="Achievements"
        component={AchievementsScreen}
        options={{
          tabBarLabel: 'Başarımlar',
          tabBarIcon: ({ focused }) => (
            <Text style={styles.tabIcon}>🏆</Text>
          ),
        }}
      />
      <Tab.Screen
        name="Upgrades"
        component={UpgradesScreen}
        options={{
          tabBarLabel: 'Gelişim',
          tabBarIcon: ({ focused }) => (
            <Text style={styles.tabIcon}>🚀</Text>
          ),
        }}
      />
      <Tab.Screen
        name="Budget"
        component={BudgetScreen}
        options={{
          tabBarLabel: 'Bütçe',
          tabBarIcon: ({ focused }) => (
            <Text style={styles.tabIcon}>📊</Text>
          ),
        }}
      />
    </Tab.Navigator>
  );
}

// ── Ana Sekme Ekranı + Floating Ayarlar Butonu ──
function MainWithSettingsButton({ navigation }) {
  return (
    <View style={{ flex: 1 }}>
      <GameTabs />
      {/* Floating Ayarlar Butonu — Her zaman ekranda */}
      <TouchableOpacity
        style={styles.ayarlarButon}
        onPress={() => navigation.navigate('Settings')}
        activeOpacity={0.75}
      >
        <Text style={styles.ayarlarEmoji}>⚙️</Text>
      </TouchableOpacity>
    </View>
  );
}

function GameNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Main" component={MainWithSettingsButton} />
      <Stack.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          animation: 'slide_from_right',
        }}
      />
    </Stack.Navigator>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// 🎨 NAVIGATION THEME (React Navigation v7 requires fonts)
// ═══════════════════════════════════════════════════════════════════════════════

const GameTheme = {
  ...DefaultTheme,
  dark: true,
  colors: {
    ...DefaultTheme.colors,
    primary: TEMA.renkler.altin,
    background: TEMA.renkler.arkaPlan,
    card: TEMA.renkler.kartArkaPlan,
    text: TEMA.renkler.beyaz,
    border: 'rgba(255,255,255,0.06)',
    notification: TEMA.renkler.kirmizi,
  },
};

// ═══════════════════════════════════════════════════════════════════════════════
// 📱 APP — Loading → GameProvider → SafeAreaProvider → NavigationContainer
// ═══════════════════════════════════════════════════════════════════════════════

export default function App() {
  const [yukleniyor, setYukleniyor] = useState(true);
  const [kaydedilmisState, setKaydedilmisState] = useState(null);

  useEffect(() => {
    async function init() {
      try {
        const kayitli = await oyunYukle();
        if (kayitli) {
          setKaydedilmisState(kayitli);
        }
      } catch (e) {
        console.warn('Yükleme hatası:', e);
      } finally {
        setYukleniyor(false);
      }
    }
    init();
  }, []);

  if (yukleniyor) {
    return (
      <SafeAreaProvider>
        <SafeAreaView style={styles.yuklemeEkrani}>
          <StatusBar barStyle="light-content" backgroundColor={TEMA.renkler.arkaPlan} />
          <Text style={styles.yuklemeEmoji}>🏢</Text>
          <Text style={styles.yuklemeBaslik}>IT Manager</Text>
          <Text style={styles.yuklemeAltBaslik}>Startup Tycoon</Text>
          <ActivityIndicator size="large" color={TEMA.renkler.altin} style={{ marginTop: 20 }} />
          <Text style={styles.yuklemeMetin}>Oyun yükleniyor...</Text>
        </SafeAreaView>
      </SafeAreaProvider>
    );
  }

  return (
    <ErrorBoundary>
      <SafeAreaProvider>
        <GameProvider>
          <GameScreenWithLoad kaydedilmisState={kaydedilmisState} />
        </GameProvider>
      </SafeAreaProvider>
    </ErrorBoundary>
  );
}

/**
 * Kayıtlı state'i yükledikten sonra Navigator'ı render eder.
 */
function GameScreenWithLoad({ kaydedilmisState }) {
  const { dispatch } = useGame();
  const yuklendi = useRef(false);

  useEffect(() => {
    if (kaydedilmisState && !yuklendi.current) {
      yuklendi.current = true;
      dispatch({ type: 'LOAD_SAVED_STATE', payload: { savedState: kaydedilmisState } });
    }
  }, [kaydedilmisState, dispatch]);

  return (
    <NavigationContainer theme={GameTheme}>
      <StatusBar barStyle="light-content" backgroundColor={TEMA.renkler.arkaPlan} />
      <GameNavigator />
    </NavigationContainer>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// 🎨 STİLLER
// ═══════════════════════════════════════════════════════════════════════════════

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: TEMA.renkler.kartArkaPlan,
    borderTopColor: 'rgba(255,255,255,0.06)',
    borderTopWidth: 1,
    paddingTop: 8,
    // paddingBottom and height are now set dynamically via useSafeAreaInsets
  },
  tabLabel: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.2,
    marginTop: 2,
  },
  tabIcon: {
    fontSize: 20,
    textAlign: 'center',
  },

  // Floating Ayarlar Butonu
  ayarlarButon: {
    position: 'absolute',
    top: Platform.OS === 'android' ? 48 : 20,
    right: 16,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(30, 41, 59, 0.92)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    zIndex: 999,
    elevation: 20,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
      default: {},
    }),
  },
  ayarlarEmoji: {
    fontSize: 22,
  },

  // Loading screen
  yuklemeEkrani: {
    flex: 1,
    backgroundColor: TEMA.renkler.arkaPlan,
    justifyContent: 'center',
    alignItems: 'center',
  },
  yuklemeEmoji: { fontSize: 64, marginBottom: 12 },
  yuklemeBaslik: {
    fontSize: 32,
    fontWeight: '900',
    color: TEMA.renkler.beyaz,
    letterSpacing: -0.5,
  },
  yuklemeAltBaslik: {
    fontSize: 16,
    fontWeight: '600',
    color: TEMA.renkler.altin,
    marginTop: 4,
  },
  yuklemeMetin: {
    fontSize: 14,
    color: TEMA.renkler.acikGri,
    marginTop: 12,
  },
});