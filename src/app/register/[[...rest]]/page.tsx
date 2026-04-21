import { SignUp } from "@clerk/nextjs";
import Image from "next/image";

export default function RegisterPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 p-4">
      {/* LOGO */}
      <div className="mb-8 flex flex-col items-center gap-2">
        <Image
          src="/logo.png"
          alt="MEC Donalds"
          width={150}
          height={150}
          className="rounded-full shadow-lg"
        />
        <h1 className="text-xl font-bold tracking-tight text-[#00437A]">Univali Services</h1>
      </div>

      <SignUp 
        appearance={{
          elements: {
            formButtonPrimary: "bg-[#00437A] hover:bg-[#005DA4] text-sm normal-case",
            card: "shadow-xl border-none",
            headerTitle: "text-2xl font-bold text-gray-900",
            headerSubtitle: "text-gray-600",
            footerActionLink: "text-[#00437A] hover:text-[#005DA4] font-bold"
          }
        }}
      />
    </div>
  );
}
