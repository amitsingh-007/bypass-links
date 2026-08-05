export const getExpiresAtMs = (expiresIn: string | number) => {
  return Date.now() + Number(expiresIn) * 1000;
};
