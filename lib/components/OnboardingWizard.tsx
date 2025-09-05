"use client";
import { useState } from "react";

export default function OnboardingWizard() {
  const [step, setStep] = useState(1);

  return (
    <div className="max-w-lg mx-auto p-6 bg-white rounded-2xl shadow">
      <h1 className="text-xl font-bold mb-4">Onboarding Wizard</h1>
      <p>Step {step} of 3</p>
      <button
        onClick={() => setStep(step + 1)}
        className="mt-4 px-4 py-2 bg-blue-600 text-white rounded"
      >
        Next
      </button>
    </div>
  );
}
