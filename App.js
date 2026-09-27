import { View, ActivityIndicator } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AuthProvider, useAuth } from './context/AuthContext';

import Login from './screens/Login';
import Register from './screens/Register';
import MainMenu from './screens/MainMenu';
import UdharHome from './screens/HomeScreen';
import AddCustomer from './screens/AddCustomer';
import CustomerDetail from './screens/CustomerDetail';
import ManageTrip from './screens/ManageTrip';
import SplitDashboard from './screens/SplitDashboard';
import CreateGroup from './screens/CreateGroup';
import GroupDetail from './screens/GroupDetail';
import AddGroupMember from './screens/AddGroupMember';
import SelectGroupForExpense from './screens/SelectGroupForExpense';
import AddExpense from './screens/AddExpense';
import ExpenseList from './screens/ExpenseList';
import ExpenseDetail from './screens/ExpenseDetail';
import SettlePayment from './screens/SettlePayment';
import SettlementHistory from './screens/SettlementHistory';

const Stack = createNativeStackNavigator();

function RootNavigator() {
  const { isLoggedIn } = useAuth();

  if (isLoggedIn === null) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <Stack.Navigator>
      {isLoggedIn ? (
        <>
          <Stack.Screen name="MainMenu" component={MainMenu} options={{ title: 'My Apps' }} />
          <Stack.Screen name="UdharHome" component={UdharHome} options={{ title: 'Udhar Book' }} />
          <Stack.Screen name="AddCustomer" component={AddCustomer} options={{ title: 'New Customer' }} />
          <Stack.Screen name="CustomerDetail" component={CustomerDetail} />
          <Stack.Screen name="ManageTrip" component={ManageTrip} options={{ title: 'Manage Trip' }} />
          <Stack.Screen name="SplitDashboard" component={SplitDashboard} options={{ title: 'Split Expense' }} />
          <Stack.Screen name="CreateGroup" component={CreateGroup} options={{ title: 'Create Group' }} />
          <Stack.Screen name="GroupDetail" component={GroupDetail} options={({ route }) => ({ title: route.params?.name || 'Group' })} />
          <Stack.Screen name="AddGroupMember" component={AddGroupMember} options={{ title: 'Add Member' }} />
          <Stack.Screen name="SelectGroupForExpense" component={SelectGroupForExpense} options={{ title: 'Select Group' }} />
          <Stack.Screen name="AddExpense" component={AddExpense} options={{ title: 'Add Expense' }} />
          <Stack.Screen name="ExpenseList" component={ExpenseList} options={{ title: 'All Expenses' }} />
          <Stack.Screen name="ExpenseDetail" component={ExpenseDetail} options={{ title: 'Expense Detail' }} />
          <Stack.Screen name="SettlePayment" component={SettlePayment} options={{ title: 'Settle Payment' }} />
          <Stack.Screen name="SettlementHistory" component={SettlementHistory} options={{ title: 'Settlement History' }} />
        </>
      ) : (
        <>
          <Stack.Screen name="Login" component={Login} options={{ headerShown: false }} />
          <Stack.Screen name="Register" component={Register} options={{ headerShown: false }} />
        </>
      )}
    </Stack.Navigator>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <NavigationContainer>
        <RootNavigator />
      </NavigationContainer>
    </AuthProvider>
  );
}