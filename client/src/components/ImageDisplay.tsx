import { Card, CardContent } from "@/components/ui/card";

interface ImageDisplayProps {
  bucket: string;
  filename: string;
  title: string;
  className?: string;
}

export function ImageDisplay({ bucket, filename, title, className = "" }: ImageDisplayProps) {
  // Use direct API URL for better reliability
  const imageUrl = `/api/images/${bucket}/${encodeURIComponent(filename)}`;

  return (
    <Card className={`mb-4 ${className}`}>
      <CardContent className="p-4">
        <h3 className="text-lg font-medium text-gray-800 mb-3">{title}</h3>
        <div className="rounded-lg overflow-hidden">
          <img 
            src={imageUrl} 
            alt={title}
            className="w-full h-auto object-contain max-h-96"
            style={{ border: '1px solid #ccc' }}
            onLoad={() => console.log('Image loaded successfully:', imageUrl)}
            onError={(e) => {
              console.error('Image failed to load:', imageUrl);
              console.error('Error event:', e);
            }}
          />
        </div>
        <div className="text-xs text-gray-400 mt-2">
          Debug URL: <a href={imageUrl} target="_blank" rel="noopener noreferrer" className="text-blue-500 underline">{imageUrl}</a>
        </div>
      </CardContent>
    </Card>
  );
}