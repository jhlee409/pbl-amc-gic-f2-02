import React from "react";
import { ConversationFlow } from "@/components/ConversationFlow";

export default function PBLPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="material-blue text-white py-6 shadow-md">
        <div className="container mx-auto px-4">
          <h1 className="text-2xl font-bold text-center">AMC GI 상부 F2용 PBL 02</h1>
          <p className="text-center text-blue-100 mt-2">refractory GERD 환자의 검사와 치료</p>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6 max-w-4xl">
        <ConversationFlow />
      </main>
    </div>
  );
}
