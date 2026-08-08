import './globals.css';
import { Toaster } from 'react-hot-toast';

export const metadata = {
  title: 'BusTrackPro — Real-Time Bus Tracking',
  description: 'Track buses in real-time with live ETA, smooth maps, and instant notifications.',
  keywords: 'bus tracking, real-time, ETA, public transport, live map',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/bus-icon.svg" type="image/svg+xml" />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                const store = localStorage.getItem('bustrakpro-theme');
                if (store) {
                  const state = JSON.parse(store).state;
                  if (state && state.theme) {
                    document.documentElement.setAttribute('data-theme', state.theme);
                  }
                }
              } catch (e) {}
            `,
          }}
        />
      </head>
      <body>
        {children}
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: 'rgba(13, 20, 36, 0.95)',
              color: '#f1f5f9',
              border: '1px solid rgba(255,255,255,0.1)',
              backdropFilter: 'blur(16px)',
              fontFamily: 'Inter, sans-serif',
              fontSize: '14px',
            },
            success: { iconTheme: { primary: '#10b981', secondary: '#0d1424' } },
            error: { iconTheme: { primary: '#f43f5e', secondary: '#0d1424' } },
          }}
        />
      </body>
    </html>
  );
}
