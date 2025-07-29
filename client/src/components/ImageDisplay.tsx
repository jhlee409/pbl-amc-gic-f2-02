import { useSupabaseImage } from "@/hooks/useSupabaseImage";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle } from "lucide-react";

interface ImageDisplayProps {
  bucket: string;
  filename: string;
  title: string;
  className?: string;
}

export function ImageDisplay({ bucket, filename, title, className = "" }: ImageDisplayProps) {
  const { data: imageBlob, isLoading, error } = useSupabaseImage(bucket, filename);
  
  const imageUrl = imageBlob ? URL.createObjectURL(imageBlob) : null;

  if (isLoading) {
    return (
      <Card className={`mb-4 ${className}`}>
        <CardContent className="p-4">
          <h3 className="text-lg font-medium text-gray-800 mb-3">{title}</h3>
          <Skeleton className="w-full h-64 rounded-lg" />
        </CardContent>
      </Card>
    );
  }

  if (error || !imageUrl) {
    return (
      <Card className={`mb-4 ${className}`}>
        <CardContent className="p-4">
          <h3 className="text-lg font-medium text-gray-800 mb-3">{title}</h3>
          <div className="bg-gray-100 rounded-lg p-8 text-center text-gray-500">
            <AlertCircle className="mx-auto text-4xl mb-2" />
            <p>이미지를 불러올 수 없습니다</p>
            <p className="text-sm mt-1">{bucket}/{filename}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={`mb-4 ${className}`}>
      <CardContent className="p-4">
        <h3 className="text-lg font-medium text-gray-800 mb-3">{title}</h3>
        <div className="rounded-lg overflow-hidden">
          <img 
            src={imageUrl} 
            alt={title}
            className="w-full h-auto object-contain max-h-96"
            onLoad={() => {
              // Clean up blob URL after image loads
              if (imageUrl && imageUrl.startsWith('blob:')) {
                setTimeout(() => URL.revokeObjectURL(imageUrl), 1000);
              }
            }}
          />
        </div>
      </CardContent>
    </Card>
  );
}
