export function SimpleImageTest() {
  return (
    <div className="p-4 border-2 border-dashed border-red-300 mb-4 bg-red-50">
      <h3 className="text-lg font-bold mb-2 text-red-800">이미지 연결 문제 해결 중</h3>
      
      <div className="mb-4">
        <p className="text-sm text-gray-600 mb-2">✅ 서버 이미지 제공 기능: 정상</p>
        <img 
          src="/api/test-image" 
          alt="Test" 
          className="border border-gray-300 w-4 h-4"
          onLoad={() => console.log('Test image loaded')}
          onError={() => console.log('Test image failed')}
        />
      </div>
      
      <div className="mb-4">
        <p className="text-sm text-red-600 mb-2">❌ PBLGIC02 저장소 접근: 인증 필요</p>
        <p className="text-xs text-gray-500 mb-2">Google Cloud Storage에서 로그인 페이지로 리다이렉트됨</p>
        <img 
          src="/api/images/PBLGIC02/functional%20test%20menu.png" 
          alt="Storage Test" 
          className="border border-gray-300 max-w-xs"
          onLoad={() => console.log('Storage image loaded')}
          onError={() => console.log('Storage image failed')}
        />
      </div>
      
      <div className="text-sm text-gray-600">
        <p>해결 방법:</p>
        <ul className="list-disc list-inside text-xs mt-1">
          <li>PBLGIC02 버킷의 공개 액세스 권한 설정</li>
          <li>또는 올바른 이미지 저장소 URL 제공</li>
          <li>또는 인증키 설정 필요</li>
        </ul>
      </div>
    </div>
  );
}