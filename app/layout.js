import { Inter } from "next/font/google";
import "./globals.css";
import Web3Provider from "./providers/Web3Provider";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata = {
  title: "Veetoo | Uniswap V2 LP Analyzer",
  description: "Track and analyze your Uniswap V2 LP positions. View impermanent loss, fees earned, and position performance.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Web3Provider>
          {children}
        </Web3Provider>
      </body>
    </html>
  );
}
