"use client"

import {
  CircleCheckIcon,
  InfoIcon,
  Loader2Icon,
  OctagonXIcon,
  TriangleAlertIcon,
} from "lucide-react"
import { Toaster as Sonner, type ToasterProps } from "sonner"

const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      theme="dark"
      className="toaster group"
      position="bottom-right"
      icons={{
        success: <CircleCheckIcon className="size-5 text-[#D4AF37]" />,
        info: <InfoIcon className="size-5 text-blue-400" />,
        warning: <TriangleAlertIcon className="size-5 text-amber-400" />,
        error: <OctagonXIcon className="size-5 text-red-400" />,
        loading: <Loader2Icon className="size-5 animate-spin text-[#D4AF37]" />,
      }}
      toastOptions={{
        classNames: {
          toast: "group toast group-[.toaster]:bg-[#1a1a1a] group-[.toaster]:text-white group-[.toaster]:border-[#2a2a2a] group-[.toaster]:shadow-xl group-[.toaster]:rounded-lg",
          description: "group-[.toast]:text-white/60 group-[.toast]:text-sm",
          actionButton: "group-[.toast]:bg-[#D4AF37] group-[.toast]:text-black group-[.toast]:hover:bg-[#c9a227]",
          cancelButton: "group-[.toast]:bg-[#2a2a2a] group-[.toast]:text-white group-[.toaster]:hover:bg-[#3a3a3a]",
          success: "group-[.toaster]:border-l-4 group-[.toaster]:border-l-[#D4AF37]",
          error: "group-[.toaster]:border-l-4 group-[.toaster]:border-l-red-500",
          warning: "group-[.toaster]:border-l-4 group-[.toaster]:border-l-amber-500",
          info: "group-[.toaster]:border-l-4 group-[.toaster]:border-l-blue-500",
        },
      }}
      {...props}
    />
  )
}

export { Toaster }
