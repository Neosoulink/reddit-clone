import { type Viewport, type Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";

// HELPER
import { TRPCReactProvider } from "~/trpc/react";

// COMPONENTS
import MainLayout from "~/components/layout/Main";

// STYLES
import "~/styles/globals.css";

const metaTitle = "Reddit Clone";
const metaDescription = "A simple reddit clone";
const metaScreenshot =
  "https://private-user-images.githubusercontent.com/44310540/308630560-3f6f7ce6-411e-41ad-b20b-e224f1c4577b.png?jwt=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJnaXRodWIuY29tIiwiYXVkIjoicmF3LmdpdGh1YnVzZXJjb250ZW50LmNvbSIsImtleSI6ImtleTUiLCJleHAiOjE3MDkzMjAzNDAsIm5iZiI6MTcwOTMyMDA0MCwicGF0aCI6Ii80NDMxMDU0MC8zMDg2MzA1NjAtM2Y2ZjdjZTYtNDExZS00MWFkLWIyMGItZTIyNGYxYzQ1NzdiLnBuZz9YLUFtei1BbGdvcml0aG09QVdTNC1ITUFDLVNIQTI1NiZYLUFtei1DcmVkZW50aWFsPUFLSUFWQ09EWUxTQTUzUFFLNFpBJTJGMjAyNDAzMDElMkZ1cy1lYXN0LTElMkZzMyUyRmF3czRfcmVxdWVzdCZYLUFtei1EYXRlPTIwMjQwMzAxVDE5MDcyMFomWC1BbXotRXhwaXJlcz0zMDAmWC1BbXotU2lnbmF0dXJlPWFhYjMyMGU1Njk0MDRkZTIxOGI3NjRkMTdjOTBhOTljMDNiZDA3NDI3Mjk4ZTYzOTg0NjVmZjdiMWI2OWYzM2ImWC1BbXotU2lnbmVkSGVhZGVycz1ob3N0JmFjdG9yX2lkPTAma2V5X2lkPTAmcmVwb19pZD0wIn0.n0z6I0irL7u1mJbcRny_yH5NVBk1JFT3xxfU0ZuVswg";

export const metadata: Metadata = {
  metadataBase: new URL("https://reddit-clone-nine-xi.vercel.app"),
  title: metaTitle,
  description: metaDescription,
  icons: [{ rel: "icon", url: "/favicon.ico" }],
  formatDetection: { telephone: true, email: false },
  openGraph: {
    title: metaTitle,
    siteName: metaTitle,
    type: "website",
    description: metaDescription,
    locale: "en_US",
    images: {
      url: metaScreenshot,
      alt: metaTitle,
    },
  },
  twitter: {
    creator: "https://twitter.com/nsl_nathan",
    title: metaTitle,
    card: "summary_large_image",
    description: metaDescription,
    images: {
      url: metaScreenshot,
      username: "nsl_nathan",
      alt: metaTitle,
    },
  },
  applicationName: metaTitle,
  other: {
    charset: "utf-8",
    xUaCompatible: "IE=edge",
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "white" },
    { media: "(prefers-color-scheme: dark)", color: "black" },
  ],
  colorScheme: "only light",
  initialScale: 1,
  width: "device-width",
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider>
      <html lang="en">
        <TRPCReactProvider>
          <MainLayout>{children}</MainLayout>
        </TRPCReactProvider>
      </html>
    </ClerkProvider>
  );
}
