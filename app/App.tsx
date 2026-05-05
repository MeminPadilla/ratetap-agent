import { Ionicons } from '@expo/vector-icons';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { colors } from './src/constants/theme';
import { StoreProvider, useStore } from './src/storage/useStore';
import { DashboardScreen } from './src/screens/DashboardScreen';
import { TransactionsScreen } from './src/screens/TransactionsScreen';
import { AddTransactionScreen } from './src/screens/AddTransactionScreen';
import { LeadsScreen } from './src/screens/LeadsScreen';
import { AddLeadScreen } from './src/screens/AddLeadScreen';
import {
  LeadsStackParamList,
  RootTabParamList,
  TransactionsStackParamList,
} from './src/navigation/types';

const Tab = createBottomTabNavigator<RootTabParamList>();
const TransactionsStack = createNativeStackNavigator<TransactionsStackParamList>();
const LeadsStack = createNativeStackNavigator<LeadsStackParamList>();

const navTheme = {
  ...DefaultTheme,
  dark: true,
  colors: {
    ...DefaultTheme.colors,
    background: colors.bg,
    card: colors.surface,
    text: colors.text,
    border: colors.border,
    primary: colors.primary,
    notification: colors.expense,
  },
};

const stackScreenOpts = {
  headerStyle: { backgroundColor: colors.bg },
  headerTintColor: colors.text,
  headerTitleStyle: { fontWeight: '700' as const },
  contentStyle: { backgroundColor: colors.bg },
  headerShadowVisible: false,
};

const TransactionsStackNavigator = () => (
  <TransactionsStack.Navigator screenOptions={stackScreenOpts}>
    <TransactionsStack.Screen
      name="TransactionsList"
      component={TransactionsScreen}
      options={{ headerShown: false }}
    />
    <TransactionsStack.Screen
      name="AddTransaction"
      component={AddTransactionScreen}
      options={{ title: 'New transaction', presentation: 'modal' }}
    />
  </TransactionsStack.Navigator>
);

const LeadsStackNavigator = () => (
  <LeadsStack.Navigator screenOptions={stackScreenOpts}>
    <LeadsStack.Screen
      name="LeadsList"
      component={LeadsScreen}
      options={{ headerShown: false }}
    />
    <LeadsStack.Screen
      name="AddLead"
      component={AddLeadScreen}
      options={{ title: 'New lead', presentation: 'modal' }}
    />
  </LeadsStack.Navigator>
);

const Tabs = () => (
  <Tab.Navigator
    screenOptions={({ route }) => ({
      headerShown: false,
      tabBarActiveTintColor: colors.primary,
      tabBarInactiveTintColor: colors.textMuted,
      tabBarStyle: {
        backgroundColor: colors.surface,
        borderTopColor: colors.border,
        height: 80,
        paddingTop: 8,
        paddingBottom: 24,
      },
      tabBarLabelStyle: {
        fontSize: 11,
        fontWeight: '600',
      },
      tabBarIcon: ({ color, size }) => {
        const map: Record<keyof RootTabParamList, keyof typeof Ionicons.glyphMap> = {
          Home: 'home-outline',
          Transactions: 'swap-vertical-outline',
          Leads: 'rocket-outline',
        };
        return <Ionicons name={map[route.name]} size={size} color={color} />;
      },
    })}
  >
    <Tab.Screen name="Home" component={DashboardScreen} />
    <Tab.Screen name="Transactions" component={TransactionsStackNavigator} />
    <Tab.Screen name="Leads" component={LeadsStackNavigator} />
  </Tab.Navigator>
);

const Gate = () => {
  const { ready } = useStore();
  if (!ready) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }
  return <Tabs />;
};

export default function App() {
  return (
    <SafeAreaProvider>
      <StoreProvider>
        <StatusBar style="light" />
        <NavigationContainer theme={navTheme}>
          <Gate />
        </NavigationContainer>
      </StoreProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.bg,
  },
});
