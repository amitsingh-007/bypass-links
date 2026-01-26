/**
 * Generates SHA-256 hash of a string using Web Crypto API
 * @param input - String to hash
 * @returns SHA-256 hash as 64-character hex string
 */
export const sha256Hash = async (input: string): Promise<string> => {
  const data = new TextEncoder().encode(input);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  return [...new Uint8Array(hashBuffer)]
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
};
