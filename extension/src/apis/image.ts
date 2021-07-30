import fetchApi from "@common/utils/fetch";
import { getUserId } from "GlobalUtils/common";

export const getImageUrl = async (imagePath: string): Promise<string> => {
  const userId = await getUserId();
  const { imageUrl } = await fetchApi<{ imageUrl: string }>(
    `/api/image/url?uid=${userId}&imagePath=${imagePath}`
  );
  return imageUrl || "";
};

export const uploadImage = async (
  image: File,
  imageName: string
): Promise<string> => {
  const userId = await getUserId();
  const formData = new FormData();
  formData.append("image", image, image.name);
  const { imagePath } = await fetchApi<{ imagePath: string }>(
    `/api/image?uid=${userId}&imageName=${imageName}`,
    {
      method: "POST",
      body: formData,
    }
  );
  return imagePath;
};

export const removeImage = async (imagePath: string): Promise<boolean> => {
  const userId = await getUserId();
  const { isSuccess } = await fetchApi<{ isSuccess: boolean }>(
    `/api/image?uid=${userId}&imagePath=${imagePath}`,
    { method: "DELETE" }
  );
  return isSuccess;
};
