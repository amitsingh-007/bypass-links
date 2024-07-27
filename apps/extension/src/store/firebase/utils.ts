export const getExpiresAtMs = (expiresIn: any) => {
  return Date.now() + Number(expiresIn) * 1000;
};
