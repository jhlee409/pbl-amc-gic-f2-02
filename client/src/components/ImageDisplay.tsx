import React, { useState } from 'react';
import { Card, CardContent } from './ui/card';
import { Skeleton } from './ui/skeleton';
import { AlertCircle, RefreshCw } from 'lucide-react';

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
  const [retryCount, setRetryCount] = useState(0);

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

  const handleRetry = () => {
    setImageLoading(true);
    setImageError(false);
    setRetryCount(prev => prev + 1);
    console.log(`Retrying image load (attempt ${retryCount + 2}):`, imageUrl);
  };

  if (imageLoading) {
    return (
      <Card className={`mb-4 ${className}`}>
        <CardContent className="p-4">
          <h3 className="text-lg font-medium text-gray-800 mb-3">{title}</h3>
          <Skeleton className="w-full h-64 rounded-lg" />
          <img 
            src={`${imageUrl}?retry=${retryCount}`}
            alt={title}
            className="hidden"
            onLoad={handleImageLoad}
            onError={handleImageError}
            crossOrigin="anonymous"
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
            <p className="text-sm mt-1 text-gray-400">{bucket}/{filename}</p>
            <button
              onClick={handleRetry}
              className="mt-3 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 flex items-center gap-2 mx-auto"
            >
              <RefreshCw className="w-4 h-4" />
              다시 시도
            </button>
            <p className="text-xs mt-2 text-gray-400">
              시도 횟수: {retryCount + 1}
            </p>
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
            crossOrigin="anonymous"
          />
        </div>
      </CardContent>
    </Card>
  );
}