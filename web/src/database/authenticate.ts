import supabase from "@helpers/supabase";
import { User2FAInfo } from "src/interfaces/twoFactorAuth";
import { definitions } from "../@types/supabase";

export const fetchUser2FA = async (
  userId: string
): Promise<User2FAInfo | null> => {
  const { data, error } = await supabase
    .from<definitions["auth"]>("auth")
    .select("is_2fa_enabled, totp_secret_key, totp_auth_url")
    .match({ user_id: userId })
    .single();
  if (!data || error) {
    console.error(error);
    return null;
  }
  return {
    secretKey: data.totp_secret_key,
    otpAuthUrl: data.totp_auth_url,
    is2FAEnabled: data.is_2fa_enabled,
  };
};

export const createUser2FA = async (
  userId: string,
  user2FAInfo: User2FAInfo
): Promise<boolean> => {
  const { data, error } = await supabase
    .from<definitions["auth"]>("auth")
    .insert([
      {
        user_id: userId,
        is_2fa_enabled: user2FAInfo.is2FAEnabled,
        totp_auth_url: user2FAInfo.otpAuthUrl,
        totp_secret_key: user2FAInfo.secretKey,
      },
    ]);
  if (!data || error) {
    console.error(error);
    return false;
  }
  return true;
};

export const saveVerifiedUser = async (userId: string): Promise<boolean> => {
  const { data, error } = await supabase
    .from<definitions["auth"]>("auth")
    .update({ is_2fa_enabled: true })
    .match({ user_id: userId });
  if (!data || error) {
    console.error(error);
    return false;
  }
  return true;
};

export const disableUser2FA = async (userId: string): Promise<boolean> => {
  const { data, error } = await supabase
    .from<definitions["auth"]>("auth")
    .update({ is_2fa_enabled: false })
    .match({ user_id: userId });
  if (!data || error) {
    console.error(error);
    return false;
  }
  return true;
};
