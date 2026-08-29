import TestForm from "@/components/TestForm/TestForm";
import Image from "next/image";

export default function Home() {
  return (
    <main className="flex flex-col p-4 items-center justify-center">
      <div className="border-2 rounded-xl p-2 bg-teal-100 border-teal-700">
        <h1 className="w-full text-center">Generic test form</h1>
        <TestForm />
      </div>
    </main>
  );
}
