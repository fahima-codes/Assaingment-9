const IMGBB_API_KEY = process.env.NEXT_PUBLIC_IMGBB_API_KEY ?? "";

export async function uploadImageToImgBB(file: File): Promise<string> {
  if (!IMGBB_API_KEY) {
    throw new Error("Image upload is not configured.");
  }

  const formData = new FormData();
  formData.append("image", file);

  const uploadUrl = new URL("https://api.imgbb.com/1/upload");
  uploadUrl.searchParams.set("key", IMGBB_API_KEY);
  const response = await fetch(uploadUrl, {
    method: "POST",
    body: formData,
  });

  const data = (await response.json().catch(() => null)) as {
    data?: { url?: string };
    message?: string;
  } | null;

  if (!response.ok || !data?.data?.url) {
    throw new Error(data?.message ?? "ImgBB upload failed");
  }

  return data.data.url;
}
