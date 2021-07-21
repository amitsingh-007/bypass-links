import supabase from "@helpers/supabase";
import { User2FAInfo } from "src/interfaces/twoFactorAuth";

export const fetchUser2FAInfo = async (userId: string) => {
  const selectQuery = `
    is2FAEnabled: is_2fa_enabled,
    secretKey: totp_secret_key,
    otpAuthUrl: totp_auth_url
  `;
  const { data, error } = await supabase
    .from<User2FAInfo>("auth")
    .select(selectQuery)
    .match({ user_id: userId })
    .single();
  if (error) {
    console.error(error);
  }
  return data;
};
