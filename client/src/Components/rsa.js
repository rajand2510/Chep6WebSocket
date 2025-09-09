import forge from "node-forge";

export function generateRSAKeyPair() {
  return new Promise((resolve) => {
    forge.pki.rsa.generateKeyPair({ bits: 2048, workers: -1 }, (err, keypair) => {
      const publicKey = forge.pki.publicKeyToPem(keypair.publicKey);
      const privateKey = forge.pki.privateKeyToPem(keypair.privateKey);
      resolve({ publicKey, privateKey });
    });
  });
}

export function encryptWithPublicKey(publicKeyPem, message) {
  const publicKey = forge.pki.publicKeyFromPem(publicKeyPem);
  return forge.util.encode64(publicKey.encrypt(forge.util.encodeUtf8(message)));
}

export function decryptWithPrivateKey(privateKeyPem, encryptedMessage) {
  const privateKey = forge.pki.privateKeyFromPem(privateKeyPem);
  try {
    return forge.util.decodeUtf8(
      privateKey.decrypt(forge.util.decode64(encryptedMessage))
    );
  } catch {
    return "[Encrypted]";
  }
}
