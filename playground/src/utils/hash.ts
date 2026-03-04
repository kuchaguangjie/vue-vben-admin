export async function generateSHA256(message: string) {
  // Convert the message string to a Uint8Array
  const encoder = new TextEncoder();
  const data = encoder.encode(message);

  // Generate the hash
  const hashBuffer = await window.crypto.subtle.digest('SHA-256', data);

  // Convert the ArrayBuffer to a hexadecimal string
  const hashArray = [...new Uint8Array(hashBuffer)];
  const hash = hashArray
    .map((item) => item.toString(16).padStart(2, '0'))
    .join('');

  return hash;
}
