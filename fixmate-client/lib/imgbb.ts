const IMGBB_API_KEY = process.env.NEXT_PUBLIC_IMGBB_API_KEY ?? "";

export async function uploadImageToImgBB(file: File): Promise<string> {
  const formData = new FormData();
  formData.append("key", IMGBB_API_KEY);
  formData.append("image", file);

  const response = await fetch(
    "https://api.imgbb.com/1/image?expiration=86400&output=json",
    {
      method: "POST",
      body: formData,
    }
  );

  const data = (await response.json().catch(() => null)) as {
    data?: { url?: string };
    message?: string;
  } | null;

  if (!response.ok || !data?.data?.url) {
    throw new Error(data?.message ?? "ImgBB upload failed");
  }

  return data.data.url;
}
