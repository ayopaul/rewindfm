import PlayerDock from "@/components/PlayerDock";
import { AudioProvider } from "@/components/AudioProvider";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <AudioProvider>
          {children}
          <PlayerDock />
        </AudioProvider>
      </body>
    </html>
  );
}