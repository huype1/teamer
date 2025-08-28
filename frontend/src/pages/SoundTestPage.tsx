import React from "react";
import SoundTest from "@/components/ui/sound-test";

const SoundTestPage = () => {
  return (
    <div className="container mx-auto p-6">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Test Âm Thanh Thông Báo</h1>
        <SoundTest />
      </div>
    </div>
  );
};

export default SoundTestPage;
