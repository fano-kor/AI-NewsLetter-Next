"use client";

import "@/css/satoshi.css";
import "@/css/style.css";
import "jsvectormap/dist/jsvectormap.css";
import "flatpickr/dist/flatpickr.min.css";

import React from "react";

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useState, useEffect } from 'react'

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [queryClient] = useState(() => new QueryClient())

  // useEffect(() => {
  //   fetch('/api/scheduler')
  //     .then(response => response.json())
  //     .then(data => console.log('스케줄러 초기화:', data))
  //     .catch(error => console.error('스케줄러 초기화 오류:', error));
  // }, []);

  return (
    <html lang="en">
      <body>
        <QueryClientProvider client={queryClient}>
          {children}
        </QueryClientProvider>
      </body>
    </html>
  )
}
