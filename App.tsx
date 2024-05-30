import React, { useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import {
  View,
  Text,
  TextInput,
  Button,
  FlatList,
  StyleSheet
} from 'react-native';
import { Connection, PublicKey } from '@solana/web3.js';
import axios from 'axios';
import 'react-native-get-random-values';

import { Buffer } from 'buffer';
global.Buffer = Buffer;

export default function App() {
  const [address, setAddress] = useState('');
  const [balance, setBalance] = useState<number | null>(null);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  const getWalletData = async () => {
    try {
      setError(null);
      const connection = new Connection('https://api.mainnet-beta.solana.com');
      const publicKey = new PublicKey(address);
      const balance = await connection.getBalance(publicKey);
      setBalance(balance / 1e9); // Convert lamports to SOL

      const response = await axios.get(
        `https://api.solscan.io/account/transactions?address=${address}&limit=10`
      );
      setTransactions(response.data);
    } catch (e) {
      if (axios.isAxiosError(e)) {
        if (e.response) {
          // Server responded with a status other than 200 range
          setError(`Server Error: ${e.response.status}`);
        } else if (e.request) {
          // Request was made but no response was received
          setError('Network Error: No response received');
        } else {
          // Something else happened while setting up the request
          setError(`Error: ${e.message}`);
        }
      } else if (e instanceof TypeError) {
        // Handle other types of errors (e.g., invalid address format)
        setError('Invalid address format or network error');
      } else {
        setError('An unknown error occurred');
      }
    }
  };

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
      {error && <Text style={styles.error}>{error}</Text>}
      {balance !== null && <Text>Balance: {balance} SOL</Text>}

      <FlatList
        data={transactions}
        keyExtractor={(item) => item.signature}
        renderItem={({ item }) => (
          <View style={styles.transaction}>
            <Text>Signature: {item.signature}</Text>
            <Text>Slot: {item.slot}</Text>
          </View>
        )}
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
  transaction: {
    marginVertical: 10
  }
});
