"use client";

import { usePathname } from 'next/navigation';
import Footer from './Footer';

export default function ConditionalFooter() {
  const pathname = usePathname();
  
  // Hide footer on watch-party routes to maximize screen space
  if (pathname?.startsWith('/watch-party')) {
    return null;
  }
  
  return <Footer />;
}
