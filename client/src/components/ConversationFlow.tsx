import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ImageDisplay } from "./ImageDisplay";
import { SimpleImageTest } from "./SimpleImageTest";
import { BriefcaseMedical, School } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface ConversationStep {
  id: number;
  type: "message" | "question" | "images" | "completion";
  content: string;
  images?: Array<{ bucket: string; filename: string; title: string }>;
  options?: Array<{ text: string; correct?: boolean; nextStep?: number }>;
  nextStep?: number;
}

const conversationSteps: ConversationStep[] = [
  {
    id: 0,
    type: "message",
    content: "로딩이 완료 되었습니다. 환자에 대해 말씀 드릴까요?",
    nextStep: 1,
  },
  {
    id: 1,
    type: "message",
    content: `환자에 대해 설명드리겠습니다.

1. 환자는 13년전부터 시작된 substernal heartburn으로 내원한 47세의 남성입니다.
2. 5년전부터는 밤에 수면 중에 이 증상이 있었고, 이는 상체를 높게해서 자거나 개비스콘을 먹으면 좀 호전되었다고 합니다.
3. 그러다가 최근 1년 동안에는 증상이 심해졌고, 목쉼 증상도 나타났다고 합니다.
4. 심장내과에서 이상이 없다고 들었습니다.
5. 이 증상으로 6개월 이상 PPI를 처방 받아 복용해 오고 있으나, 증상이 호전되지 않아 고생하던 중이었습니다.
6. 그러다가 지인을 통해 내시경 치료로 이런 역류 증상이 치료 되었다는 얘기를 듣고, 항역류 내시경 치료를 받고 싶어 방문하였습니다. 환자는 수술은 원치 않습니다.

이 증상의 원인과 항역류 내시경치료의 효과를 예측하기 위해 EGD 외에 전문기능검사를 추가로 시행해야 합니다.
우선 AMC AMIS 3.0에 소화기 전문 기능 검사가 있는지 functional test menu image를 통해 보여드리겠습니다. 어떤 검사를 시행해야 할 지 확인해 보세요.`,
    nextStep: 2,
  },
  {
    id: 2,
    type: "message",
    content: `이 환자의 경우는 검사 코드로 GF0008 (Esophageal manometry (비진정, Impedance))와 GF0009 (24hrs esophageal pH monitory (Impedance)) 검사를 시행해야 합니다.

그런데 pH에 관한 검사인데 Esophageal manometry도 시행해야 하는 이유가 궁금하지 않으신가요?

1. 첫째 이유는 24hr pH monitoring tip을 LES upper margin의 5 cm 상방에 위치하도록 해야 하는데, LES의 정확한 위치는 Esophageal manometry를 해야 알 수 있기 때문입니다.
2. 둘째 이유는 heartburn 유사 증상이 식도 운동성 질환에서도 동반될 수 있기 때문에 Esophageal manometry를 반드시 같이 시행해야 합니다.

그럼 검사 결과를 확인해 보겠습니다. EGD image, 24hr pH monitoring image, Esophageal manometry image를 차례로 보여드릴까요?`,
    images: [{ bucket: "PBLGIC02", filename: "functional test menu.png", title: "Functional Test Menu" }],
    nextStep: 3,
  },
  {
    id: 3,
    type: "question",
    content: "검사 결과를 종합하면, 이 환자의 증상은 어떤 범주에 든다고 추정할 수 있나요?",
    images: [
      { bucket: "PBLGIC02", filename: "EGD.png", title: "1. EGD Image" },
      { bucket: "PBLGIC02", filename: "Esophageal manometry.png", title: "2. Esophageal Manometry" },
      { bucket: "PBLGIC02", filename: "24hr pH monitoring result.png", title: "3. 24hr pH Monitoring Result" },
    ],
    options: [
      { text: "1. 병적 위산 역류가 있고, 위산의 역류가 증상의 원인인 경우입니다.", correct: false },
      { text: "2. 병적 위산 역류는 없으나, 위산의 역류가 증상의 원인인 경우(Reflux Hypersensitivity)입니다.", correct: false },
      { text: "3. 병적 위산의 역류는 없으나, 비산성 역류가 증상의 원인인 경우입니다.", correct: true, nextStep: 4 },
      { text: "4. 위 내용물의 역류가 증상의 원인이 아니고, 식도 운동성 질환이 있는 경우입니다.(예; Diffuse Esophageal Spasm)", correct: false },
      { text: "5. 위 내용물의 역류가 증상의 원인이 아니고, 식도 운동성 질환이 없는 경우입니다.(Functional Heartburn)", correct: false },
    ],
  },
  {
    id: 4,
    type: "question",
    content: "예, 맞습니다. 그럼 이 환자에서 검사 결과 만으로 볼 때 stretta의 효과가 있을 것이라고 예측할 수 있을까요?",
    options: [
      { text: "1. 예", correct: true, nextStep: 5 },
      { text: "2. 아니오", correct: false },
    ],
  },
  {
    id: 5,
    type: "message",
    content: `예 맞습니다. 정리하면,

1. 이 증례는 6개월 이상 PPI에 호전이 없는 heartburn으로 최근 증상이 악화되고, 항역류 내시경 치료를 원해서 본원을 방문한 환자로 검사에서 비산역류에 의한 증상으로 판정되어, stretta를 시행하면 효과를 기대할 수 있다고 판단한 증례입니다.

2. 핵심 포인트는 refractory GERD에서 항역류치료를 고려할 때, 효과를 예측하기 위해 시행해야 하는 검사와, 그 검사의 결과, 특히 24hr pH monitoring (impedance)의 결과를 해석하는 능력의 습득입니다.

3. stretta는 한 번 시행 비용이 약 390만원이고, 수술적 치료에 비해 장기적인 성적에 미치지는 못하는 것으로 여겨지나, 통상적인 약물치료에 비해 효과적이기 때문에, 수술적 치료의 대안으로는 적절한 치료법입니다.

마지막으로 숙제 입니다. 이후 제시되는 24hr pH monitoring case 에서, DeMeester score, 24hr pH monitoring의 SAP, SI, Impedance의 SAP, SI의 의미를 해석하고, 최종적으로 어느 범주에 들어가는지 적어 PBS_amc_F2_02_이름.docx 파일로 담당 교수님에게 제출하세요.

그럼, case image를 보여드릴까요?`,
    nextStep: 6,
  },
  {
    id: 6,
    type: "completion",
    content: "수고하셨습니다.",
    images: [{ bucket: "PBLGIC02", filename: "case.png", title: "Case Image" }],
  },
];

export function ConversationFlow() {
  const [currentStep, setCurrentStep] = useState(0);
  const [visibleSteps, setVisibleSteps] = useState([0]);
  const [showError, setShowError] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    setTimeout(() => {
      if (containerRef.current) {
        containerRef.current.scrollIntoView({ behavior: 'smooth', block: 'end' });
      }
    }, 100);
  };

  const handleResponse = (nextStep?: number) => {
    if (nextStep !== undefined) {
      setCurrentStep(nextStep);
      setVisibleSteps(prev => [...prev, nextStep]);
      setShowError(false);
      scrollToBottom();
    }
  };

  const handleMultipleChoice = (option: { correct?: boolean; nextStep?: number }) => {
    if (option.correct) {
      setShowError(false);
      if (option.nextStep !== undefined) {
        setCurrentStep(option.nextStep);
        setVisibleSteps(prev => [...prev, option.nextStep!]);
      }
      scrollToBottom();
    } else {
      setShowError(true);
      scrollToBottom();
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [visibleSteps]);

  return (
    <div ref={containerRef} className="space-y-6">
      <SimpleImageTest />
      {visibleSteps.map((stepIndex) => {
        const step = conversationSteps[stepIndex];
        const isCurrentStep = stepIndex === currentStep;

        return (
          <div key={step.id} className="conversation-item">
            {step.images && (
              <div className="space-y-4 mb-4">
                {step.images.map((image, index) => (
                  <ImageDisplay
                    key={index}
                    bucket={image.bucket}
                    filename={image.filename}
                    title={image.title}
                  />
                ))}
              </div>
            )}

            <Card className="light-blue-bg border-l-4 border-l-blue-600 shadow-sm">
              <CardContent className="p-6">
                <div className="flex items-start space-x-3">
                  <div className="material-blue rounded-full p-2 text-white">
                    <BriefcaseMedical className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <div className="text-gray-800 leading-relaxed whitespace-pre-line">
                      {step.content}
                    </div>
                    {step.type === "message" && step.nextStep !== undefined && isCurrentStep && (
                      <div className="mt-4 flex justify-center">
                        <Button
                          onClick={() => handleResponse(step.nextStep)}
                          className="light-orange-bg hover:bg-orange-200 text-gray-800 font-medium py-3 px-8 rounded-lg shadow-sm border-0"
                        >
                          예
                        </Button>
                      </div>
                    )}
                    {step.type === "question" && step.options && isCurrentStep && (
                      <div className="mt-4 space-y-3">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {step.options.map((option, index) => (
                            <Button
                              key={index}
                              onClick={() => handleMultipleChoice(option)}
                              className="light-orange-bg hover:bg-orange-200 text-gray-800 font-medium py-3 px-4 rounded-lg shadow-sm border-0 text-left justify-start h-auto min-h-[60px] whitespace-normal"
                            >
                              {option.text}
                            </Button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        );
      })}

      {showError && (
        <Alert className="bg-red-50 border-red-200">
          <AlertDescription className="flex items-center space-x-2 text-red-800">
            <span>⚠️</span>
            <span>기대한 대답이 아닙니다. 다시 생각해보고 대답해 주세요.</span>
          </AlertDescription>
        </Alert>
      )}

      {/* Progress Indicator */}
      <div className="fixed bottom-4 right-4 bg-white rounded-full shadow-lg p-3">
        <div className="flex items-center space-x-2">
          <School className="w-5 h-5 text-blue-600" />
          <span className="text-sm font-medium text-gray-700">
            단계 {currentStep + 1}/{conversationSteps.length}
          </span>
        </div>
      </div>
    </div>
  );
}
