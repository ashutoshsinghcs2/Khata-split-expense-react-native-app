import * as Crypto from 'expo-crypto';

export const hashPassword = async (password) => {
  return await Crypto.digestStringAsync(Crypto.CryptoDigestAlgorithm.SHA256, password);
};