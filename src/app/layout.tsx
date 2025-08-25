import type { Metadata } from "next";
import "./globals.css";
import NotificationContainer from "@/components/ui/notifications";
import StoreProvider from "@/components/providers/StoreProvider";
import SessionProvider from "@/components/providers/SessionProvider";
import { Toaster } from "sonner";

export const metadata: Metadata = {
  title: "Inframe Chat - Student-Professor Communication Platform",
  description: "A platform for students to connect with professors and join study groups",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        <SessionProvider>
          <StoreProvider>
            {children}
            <NotificationContainer />
            <Toaster
              position="top-right"
              richColors
              closeButton
              duration={4000}
            />
          </StoreProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
