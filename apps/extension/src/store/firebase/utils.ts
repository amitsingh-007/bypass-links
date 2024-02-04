export const getExpiresAtMs = (expiresIn: number) => {
  return Date.now() + Number(expiresIn) * 1000;
};
