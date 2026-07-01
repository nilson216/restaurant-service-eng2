import { SignIn } from "@clerk/nextjs";
import Image from "next/image";

export default function LoginPage() {
  return (
    <div
      className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-blue-50 to-gray-50 p-4"
      data-cy="login-page"
    >
      {/* LOGO E HEADER */}
      <div
        className="mb-8 flex flex-col items-center gap-4"
        data-cy="login-brand"
      >
        <div className="flex items-center gap-3">
          <Image
            src="/logo.png"
            alt="Gerenciador de Serviços do Restaurante"
            width={60}
            height={60}
            className="rounded-lg shadow-md"
          />
          <div>
            <h1 className="text-3xl font-bold text-[#00437A]">
              Univali Service
            </h1>
            <p className="text-sm text-gray-600">Gerenciador de Serviço</p>
          </div>
        </div>
      </div>

      <SignIn
        appearance={{
          elements: {
            formButtonPrimary:
              "bg-[#00437A] hover:bg-[#005DA4] text-sm normal-case",
            card: "shadow-xl border-none",
            headerTitle: "text-2xl font-bold text-gray-900",
            headerSubtitle: "text-gray-600",
            footerActionLink: "text-[#00437A] hover:text-[#005DA4] font-bold",
          },
        }}
      />
    </div>
  );
}
