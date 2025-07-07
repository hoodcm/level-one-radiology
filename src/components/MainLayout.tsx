import { Outlet } from 'react-router-dom';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { BottomNav } from './BottomNav';
import { useKeyboardAware } from '@/hooks/useKeyboardAware';
import { useState } from 'react';

export function MainLayout() {
  const { isKeyboardVisible } = useKeyboardAware();
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  return (
    <div className="min-h-screen min-h-dvh flex flex-col bg-surface-bg safe-area-inset-left safe-area-inset-right safe-area-bg-seamless">
      <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:top-0 focus:left-0 bg-surface-bg text-text-primary p-4 rounded-br-lg">
        Skip to main content
      </a>
      <Header />
      <main id="main-content" className="flex-grow">
        <Outlet context={{ isPreviewOpen, setIsPreviewOpen }} />
      </main>
      <Footer />
      <BottomNav isPreviewOpen={isPreviewOpen} />
    </div>
  );
}
