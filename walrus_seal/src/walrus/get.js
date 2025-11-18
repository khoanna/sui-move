export default async function fetchBlob(blobId) {
  const url = `${process.env.AGGREGATOR}/v1/blobs/${blobId}`;

  const response = await fetch(url);
  console.log("Fetch Blob Response:", response);
  if (!response.ok) {
    throw new Error(`Failed to fetch blob.`);
  }

  return await response.arrayBuffer();
}
