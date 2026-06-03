"use client";

import { AlertCircle } from "lucide-react";

interface ErrorStateProps {
  error: string;
}

const ErrorState = ({ error }: ErrorStateProps) => {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4 text-gray-900">
      <div className="max-w-md text-center">
        <AlertCircle size={48} className="mx-auto mb-4 text-red-500" />
        <h1 className="mb-2 text-2xl font-bold text-gray-900">Oops!</h1>
        <p className="mb-6 text-gray-600">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="rounded-lg bg-[#00437A] px-6 py-2 font-semibold text-white transition hover:bg-[#005DA4]"
        >
          Tentar Novamente
        </button>
      </div>
    </div>
  );
};

export default ErrorState;
