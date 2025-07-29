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
            onError={(e) => {
              console.error('Image failed to load:', imageUrl);
              const target = e.currentTarget;
              target.style.display = 'none';
              const errorDiv = document.createElement('div');
              errorDiv.className = 'bg-gray-100 rounded-lg p-8 text-center text-gray-500';
              errorDiv.innerHTML = `
                <div class="text-red-500 text-4xl mb-2">⚠️</div>
                <p>이미지를 불러올 수 없습니다</p>
                <p class="text-sm mt-1">${bucket}/${filename}</p>
              `;
              target.parentNode?.appendChild(errorDiv);
            }}
          />
        </div>
      </CardContent>
    </Card>
  );
}