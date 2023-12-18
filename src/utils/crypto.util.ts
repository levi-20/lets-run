import crypto from 'crypto';

export const generateKeyPair = (): { privateKey: string, publicKey: string } => {
    const { privateKey, publicKey } = crypto.generateKeyPairSync('rsa', {
        modulusLength: 2048,
    });
    return {
        privateKey: privateKey.export({ type: 'pkcs8', format: 'pem' }).toString(),
        publicKey: publicKey.export({ type: 'spki', format: 'pem' }).toString(),
    };
}

export const verifySignature = (data: string, signature: string, publicKey: string): boolean => {
  const verify = crypto.createVerify('RSA-SHA256');
  verify.update(data);

  const signatureBuffer = Buffer.from(signature, 'base64');
  const publicKeyBuffer = Buffer.from(publicKey, 'utf-8');

  return verify.verify(publicKeyBuffer, signatureBuffer);
};