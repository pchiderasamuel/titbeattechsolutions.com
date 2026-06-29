'use client';

import { useState, useEffect } from 'react';

export default function ClientHtmlRenderer({ html }: { html: string }) {
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return <div dangerouslySetInnerHTML={{ __html: html }} />;
}
