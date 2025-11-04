/* eslint-disable react-refresh/only-export-components */
"use client"

import { Toaster as Sonner, toast as sonnerToast } from "sonner"

export function Toaster() {
  return (
    <Sonner position="top-right" richColors closeButton expand />
  )
}

export const toast = sonnerToast
/* eslint-disable react-refresh/only-export-components */
