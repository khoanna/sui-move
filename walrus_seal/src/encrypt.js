export default async function encrypt(message, sealClient, dataId) {
  const {encryptedObject: encryptedBytes, key: backupKey} =
    await sealClient.encrypt({
      threshold: 2,
      packageId: process.env.PACKAGE,
      id: dataId,
      data: new TextEncoder().encode(message),
    });

  return {
    encryptedBytes,
    backupKey,
  };
}
