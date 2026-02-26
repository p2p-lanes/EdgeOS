"use client"

import Image from "next/image"
import { useTenant } from "@/providers/tenantProvider"

export default function Quote() {
  const { tenant } = useTenant()

  return (
    <div
      className="hidden md:flex md:w-1/2 relative p-8 items-center justify-center bg-gray-200"
      style={
        tenant?.image_url
          ? {
              backgroundImage: `url(${tenant.image_url})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
              backgroundRepeat: "no-repeat",
            }
          : undefined
      }
    >
      <div className="absolute top-8 left-8">
        {tenant?.logo_url ? (
          <Image
            src={tenant.logo_url}
            alt={tenant.name ?? "Logo"}
            width={100}
            height={40}
            priority
          />
        ) : (
          <div className="w-[100px] h-[40px] rounded bg-gray-300/50 flex items-center justify-center">
            <svg
              className="size-6 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0 0 22.5 18.75V5.25A2.25 2.25 0 0 0 20.25 3H3.75A2.25 2.25 0 0 0 1.5 5.25v13.5A2.25 2.25 0 0 0 3.75 21Zm16.5-13.5h.008v.008h-.008V7.5Zm0 0a1.125 1.125 0 1 0-2.25 0 1.125 1.125 0 0 0 2.25 0Z"
              />
            </svg>
          </div>
        )}
      </div>
      {!tenant?.image_url && (
        <svg
          className="size-24 text-gray-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={1}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0 0 22.5 18.75V5.25A2.25 2.25 0 0 0 20.25 3H3.75A2.25 2.25 0 0 0 1.5 5.25v13.5A2.25 2.25 0 0 0 3.75 21Zm16.5-13.5h.008v.008h-.008V7.5Zm0 0a1.125 1.125 0 1 0-2.25 0 1.125 1.125 0 0 0 2.25 0Z"
          />
        </svg>
      )}
    </div>
  )
}
