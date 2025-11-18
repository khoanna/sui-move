export default async function encrypt(input, sealClient, dataId) {
  const {encryptedObject: encryptedBytes, key: backupKey} =
    await sealClient.encrypt({
      threshold: 2,
      packageId: process.env.PACKAGE,
      id: dataId,
      data: input,
    });

  return {
    encryptedBytes,
    backupKey,
  };
}
