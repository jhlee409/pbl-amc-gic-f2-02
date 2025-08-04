import React from "react";
import { useState } from "react";
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
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);

  // Use Supabase storage via API proxy
  const imageUrl = `/api/images/${bucket}/${encodeURIComponent(filename)}`;

  const handleImageLoad = () => {
    setImageLoaded(true);
    setImageLoading(false);
    setImageError(false);
    console.log('Image loaded successfully from Supabase:', imageUrl);
  };

  const handleImageError = () => {
    console.error('Image failed to load from Supabase:', imageUrl);
    setImageError(true);
    setImageLoading(false);
    setImageLoaded(false);
  };

  if (imageLoading) {
    return (
      <Card className={`mb-4 ${className}`}>
        <CardContent className="p-4">
          <h3 className="text-lg font-medium text-gray-800 mb-3">{title}</h3>
          <Skeleton className="w-full h-64 rounded-lg" />
          <img 
            src={imageUrl} 
            alt={title}
            className="hidden"
            onLoad={handleImageLoad}
            onError={handleImageError}
          />
        </CardContent>
      </Card>
    );
  }

  if (imageError) {
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
            onLoad={handleImageLoad}
            onError={handleImageError}
          />
        </div>
      </CardContent>
    </Card>
  );
}