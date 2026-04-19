export const uploadFileToIPFS = async (file) => {
  const pinataApiKey = import.meta.env.VITE_PINATA_API_KEY;
  const pinataSecretApiKey = import.meta.env.VITE_PINATA_SECRET_API_KEY;

  if (!pinataApiKey || !pinataSecretApiKey) {
    throw new Error('Pinata API keys are missing from environment variables (.env.local)');
  }

  const url = `https://api.pinata.cloud/pinning/pinFileToIPFS`;

  let data = new FormData();
  data.append('file', file);

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        pinata_api_key: pinataApiKey,
        pinata_secret_api_key: pinataSecretApiKey,
      },
      body: data,
    });

    const resData = await res.json();
    if (!res.ok) {
      throw new Error(resData.error?.details || 'Failed to pin to IPFS');
    }
    return resData.IpfsHash; // The CID
  } catch (error) {
    console.error('Error uploading to IPFS:', error);
    throw error;
  }
};
