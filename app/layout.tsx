import type { Metadata, Viewport } from "next";
import {
  ClerkProvider,
  Show,
  SignInButton,
  SignUpButton,
  UserButton,
} from "@clerk/nextjs";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import Link from "next/link";

const inter = Inter({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Conneco Right - Secure Your Creative Legacy",
  description:
    "The premium creative asset management platform for independent artists and art institutions. Protect, organize, and showcase your work.",
};

export const viewport: Viewport = {
  themeColor: "#09090b",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body
          className={`${inter.variable} ${jetbrainsMono.variable} font-sans antialiased`}
        >
          <header className="flex justify-end items-center p-4 gap-4 h-16">
            <Show when="signed-out">
              <SignInButton>
                <button className="cursor-pointer">
                  Sign Up
                </button>
              </SignInButton>
              <SignUpButton>
                <button className="bg-[#6c47ff] text-white rounded-full font-medium text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5 cursor-pointer">
                  Sign Up
                </button>
              </SignUpButton>
            </Show>
            <Show when="signed-in">
              <UserButton />
            </Show>
          </header>
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}
