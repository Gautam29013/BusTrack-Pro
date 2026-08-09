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
              background: 'var(--bg-glass)',
              color: 'var(--text-primary)',
              border: '1px solid rgba(255,255,255,0.1)',
              backdropFilter: 'blur(16px)',
              fontFamily: 'Inter, sans-serif',
              fontSize: '14px',
            },
            success: { iconTheme: { primary: 'var(--accent-emerald)', secondary: 'var(--bg-secondary)' } },
            error: { iconTheme: { primary: 'var(--accent-rose)', secondary: 'var(--bg-secondary)' } },
          }}
        />
      </body>
    </html>
  );
}
