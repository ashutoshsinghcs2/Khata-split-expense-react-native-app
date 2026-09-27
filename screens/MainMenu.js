
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useAuth } from '../context/AuthContext';
import Screen from '../components/Screen';

const menuItems = [
  { key: 'Udhar', label: 'Udhar Book', subtitle: 'Track money given & received', color: '#2c3e50', screen: 'UdharHome' },
  { key: 'Split', label: 'Split Expense', subtitle: 'Split bills with friends', color: '#8e44ad', screen: 'SplitDashboard' },
  { key: 'Trip', label: 'Manage Trip', subtitle: 'Coming soon', color: '#16a085', screen: 'ManageTrip' },
];


export default function MainMenu({ navigation }) {
  const { logout } = useAuth();
  return (
    <Screen style={styles.container}>
      <Text style={styles.title}>What do you want to manage?</Text>
      {menuItems.map(item => (
        <TouchableOpacity
          key={item.key}
          style={[styles.card, { backgroundColor: item.color }]}
          onPress={() => navigation.navigate(item.screen)}
        >
          <Text style={styles.cardTitle}>{item.label}</Text>
          <Text style={styles.cardSubtitle}>{item.subtitle}</Text>
        </TouchableOpacity>
      ))}
      <TouchableOpacity style={styles.logoutBtn} onPress={logout}>
        <Text style={{ color: '#e74c3c', textAlign: 'center', fontWeight: '600' }}>Logout</Text>
      </TouchableOpacity>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, justifyContent: 'center' },
  title: { fontSize: 20, fontWeight: 'bold', marginBottom: 24, textAlign: 'center' },
  card: { padding: 24, borderRadius: 14, marginBottom: 16 },
  cardTitle: { color: '#fff', fontSize: 20, fontWeight: 'bold' },
  cardSubtitle: { color: '#eee', fontSize: 13, marginTop: 4 },
  logoutBtn: { marginTop: 30, padding: 12 },
});