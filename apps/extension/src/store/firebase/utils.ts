export const getExpiresAtMs = (expiresIn: number) => {
  return Date.now() + expiresIn * 1000;
};
