"use client";

import { useEffect, useRef } from "react";

interface CalBookingProps {
  username: string;
  eventSlug?: string;
  className?: string;
}

/**
 * Cal.com inline embed component.
 * Requires NEXT_PUBLIC_CAL_COM_USERNAME in env.
 * Event type defaults to "30min" if not specified.
 */
export default function CalBooking({
  username,
  eventSlug = "30min",
  className = "",
}: CalBookingProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const existing = containerRef.current.querySelector("iframe");
    if (existing) return; // Already loaded

    const iframe = document.createElement("iframe");
    iframe.src = `https://cal.com/${username}/${eventSlug}?embed=true&layout=month_view`;
    iframe.style.width = "100%";
    iframe.style.height = "800px";
    iframe.style.border = "none";
    iframe.style.borderRadius = "12px";
    iframe.allow = "camera; microphone; payment";
    iframe.title = "Schedule a class";

    containerRef.current.appendChild(iframe);

    // Load Cal.com embed script
    const script = document.createElement("script");
    script.src = "https://cal.com/embed.js";
    script.async = true;
    document.body.appendChild(script);

    return () => {
      // Cleanup on unmount
      if (iframe.parentNode) {
        iframe.parentNode.removeChild(iframe);
      }
    };
  }, [username, eventSlug]);

  return (
    <div
      ref={containerRef}
      className={className}
    />
  );
}
