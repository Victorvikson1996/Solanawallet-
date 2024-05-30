import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import App from '../App';

jest.mock('axios', () => ({
  get: jest.fn(() => Promise.resolve({ data: [] }))
}));

test('renders correctly and fetches data', async () => {
  const { getByPlaceholderText, getByText } = render(<App />);
  const input = getByPlaceholderText('Enter Solana Address');
  const button = getByText('View');

  fireEvent.changeText(input, 'some-address');
  fireEvent.press(button);

  await waitFor(() => {
    expect(getByText('Balance: 0 SOL')).toBeTruthy();
  });
});
