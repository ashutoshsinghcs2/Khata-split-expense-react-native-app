import { View, Text, StyleSheet } from 'react-native';

const tripMenuItems = ['Add Trip', 'View Trips', 'Trip Expenses', 'Trip Members'];

export default function ManageTrip() {
  return (
    <View style={styles.container}>
      <Text style={styles.note}>Coming soon — this section is under construction.</Text>
      {tripMenuItems.map((item, i) => (
        <View key={i} style={styles.menuRow}>
          <Text style={styles.menuText}>{item}</Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  note: { color: '#999', marginBottom: 20, fontStyle: 'italic' },
  menuRow: { padding: 16, borderBottomWidth: 1, borderColor: '#eee' },
  menuText: { fontSize: 16, color: '#333' },
});