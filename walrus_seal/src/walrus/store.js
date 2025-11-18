export default async function upload(content, epochs) {
  const url = `${process.env.PUBLISHER}/v1/blobs?epochs=${epochs}`;

  const response = await fetch(url, {
    method: "PUT",
    headers: {
      "Content-Type": "application/octet-stream"
    },
    body: content, 
  });

  if (!response.ok) {
    throw new Error(`Upload failed: ${response.status} ${response.statusText}`);
  }

  const result = await response.json();
  return result; 
}