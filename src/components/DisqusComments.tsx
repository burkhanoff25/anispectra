"use client";

import { useEffect } from "react";

interface DisqusCommentsProps {
  url: string;
  identifier: string;
  title: string;
}

export default function DisqusComments({ url, identifier, title }: DisqusCommentsProps) {
  useEffect(() => {
    // Check if Disqus script is already loaded
    if (window.DISQUS) {
      window.DISQUS.reset({
        reload: true,
        config: function () {
          this.page.url = url;
          this.page.identifier = identifier;
          this.page.title = title;
        },
      });
      return;
    }

    // Set configuration
    (window as any).disqus_config = function () {
      this.page.url = url;
      this.page.identifier = identifier;
      this.page.title = title;
    };

    // Replace 'anispectra' with the user's actual disqus shortname later
    const shortname = process.env.NEXT_PUBLIC_DISQUS_SHORTNAME || "anispectra-uz";
    const script = document.createElement("script");
    script.src = `https://${shortname}.disqus.com/embed.js`;
    script.setAttribute("data-timestamp", new Date().getTime().toString());
    script.async = true;

    (document.head || document.body).appendChild(script);
  }, [url, identifier, title]);

  return <div id="disqus_thread" className="mt-10 rounded-2xl border border-line bg-panel p-4 md:p-6 shadow-glow" />;
}

// Add DISQUS to the global window object type
declare global {
  interface Window {
    DISQUS: any;
  }
}
