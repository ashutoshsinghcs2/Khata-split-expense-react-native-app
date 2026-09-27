import { View, Text, FlatList, TouchableOpacity, Button } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useState, useCallback } from 'react';
import { getCustomers, getBalance } from '../db/database';

export default function HomeScreen({ navigation }) {
  const [customers, setCustomers] = useState([]);

  useFocusEffect(useCallback(() => {
    const list = getCustomers().map(c => ({ ...c, balance: getBalance(c.id) }));
    setCustomers(list);
  }, []));

  return (
    <View style={{ flex: 1, padding: 16 }}>
      <Button title="+ Add Customer" onPress={() => navigation.navigate('AddCustomer')} />
      <FlatList
        data={customers}
        keyExtractor={item => item.id.toString()}
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() => navigation.navigate('CustomerDetail', { customerId: item.id, name: item.name })}
            style={{ padding: 14, borderBottomWidth: 1, borderColor: '#eee', flexDirection: 'row', justifyContent: 'space-between' }}
          >
            <Text style={{ fontSize: 16 }}>{item.name}</Text>
            <Text style={{ color: item.balance >= 0 ? 'green' : 'red', fontWeight: 'bold' }}>
              ₹{Math.abs(item.balance)} {item.balance >= 0 ? '(will get)' : '(will give)'}
            </Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}