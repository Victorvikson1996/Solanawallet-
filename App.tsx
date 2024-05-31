import React, { useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import {
  View,
  Text,
  TextInput,
  Button,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity
} from 'react-native';
import { Connection, PublicKey } from '@solana/web3.js';
import 'react-native-get-random-values';

import { Buffer } from 'buffer';
global.Buffer = Buffer;

type TransactionProps = {
  signature: string;
  slot: number;
};

export default function App() {
  const [address, setAddress] = useState<string>(
    '9QgXqrgdbVU8KcpfskqJpAXKzbaYQJecgMAruSWoXDkM'
  );
  const [balance, setBalance] = useState<number | null>(null);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const getWalletData = async () => {
    try {
      setError(null);
      setIsLoading(true);
      const connection = new Connection(
        'https://api.mainnet-beta.solana.com',
        'confirmed'
      );

      // Fetch balance
      const publicKey = new PublicKey(address);
      const balance = await connection.getBalance(publicKey);

      setBalance(balance / 1e9); // Convert lamports to SOL

      // Fetch last 10 transactions
      const transactionResponse =
        await connection.getConfirmedSignaturesForAddress2(publicKey, {
          limit: 10
        });
      setTransactions(transactionResponse);
    } catch (e: any) {
      setError('An error occurred while fetching data.');
    } finally {
      setIsLoading(false);
    }
  };

  const renderTransactionItem = ({ item }: { item: TransactionProps }) => (
    <TouchableOpacity style={styles.card}>
      <Text style={styles.signature}>Signature: {item.signature}</Text>
      <Text style={styles.slot}>Slot: {item.slot}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={{ marginTop: 50 }}>
        <TextInput
          style={styles.input}
          placeholder='Enter Solana Address'
          value={address}
          onChangeText={setAddress}
        />
      </View>

      <Button title='View' onPress={getWalletData} />
      {isLoading && <ActivityIndicator size='large' color='#0000ff' />}
      {error && <Text style={styles.error}>{error}</Text>}
      {balance !== null && <Text>Balance: {balance} SOL</Text>}

      <FlatList
        data={transactions}
        keyExtractor={(item) => item.signature}
        renderItem={({ item }) => renderTransactionItem({ item })}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    backgroundColor: '#fff'
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 10,
    paddingHorizontal: 10
  },
  error: {
    color: 'red'
  },
  card: {
    backgroundColor: '#f0f0f0',
    padding: 10,
    borderRadius: 8,
    marginBottom: 10
  },
  signature: {
    fontSize: 16,
    fontWeight: 'bold'
  },
  slot: {
    fontSize: 14
  }
});
