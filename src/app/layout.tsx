import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";
import BackgroundMusic from "@/components/BackgroundMusic";

export const metadata: Metadata = {
  title: "Quiz Digital | Prova Online Interativa: Saúde Digital & Cultura Digital",
  description: "Dispute com seus amigos no estilo Kahoot! 20 questões exclusivas sobre Saúde Digital, Cultura Digital e Inovação Tecnológica em uma plataforma de quiz educacional dinâmica.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="pt-BR" className="h-full scroll-smooth">
      <body className="bg-slate-950 text-slate-100 antialiased min-h-full flex flex-col font-sans selection:bg-purple-600 selection:text-white">
        <BackgroundMusic>
          {children}
        </BackgroundMusic>
      </body>
    </html>
  );
}
