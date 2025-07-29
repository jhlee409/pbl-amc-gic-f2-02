import { useQuery } from "@tanstack/react-query";

export function useObjectStorageImage(bucket: string, filename: string) {
  return useQuery({
    queryKey: ["/api/images", bucket, filename],
    queryFn: async () => {
      const response = await fetch(`/api/images/${bucket}/${filename}`);
      if (!response.ok) {
        throw new Error("Failed to load image");
      }
      return response.blob();
    },
    enabled: !!(bucket && filename),
  });
}

// Keep the old name for backward compatibility
export const useSupabaseImage = useObjectStorageImage;
