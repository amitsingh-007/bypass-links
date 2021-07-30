import supabase from "@helpers/supabase";

export const getImageUrl = async (
  userId: string,
  imagePath: string
): Promise<string | null> => {
  const { publicURL, error } = supabase.storage
    .from("persons")
    .getPublicUrl(imagePath);
  if (!publicURL || error) {
    console.error(error);
    return null;
  }
  return publicURL;
};

export const uploadImage = async (
  uid: string,
  file: Express.Multer.File
): Promise<boolean> => {
  const { data, error } = await supabase.storage
    .from("persons")
    .upload(
      `${uid}/${__PROD__ ? "prod" : "dev"}/${file.originalname}`,
      file.buffer,
      {
        cacheControl: "604800", // 7 days
        upsert: true,
        contentType: "image/jpeg",
      }
    );
  if (!data || error) {
    console.error(error);
    return false;
  }
  return true;
};

export const removeImage = async (
  uid: string,
  imagePath: string
): Promise<boolean> => {
  const { data, error } = await supabase.storage
    .from("persons")
    .remove([imagePath]);
  if (!data || error) {
    console.error(error);
    return false;
  }
  return true;
};
