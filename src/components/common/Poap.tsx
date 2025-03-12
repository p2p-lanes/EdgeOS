"use client"

import { cn } from "@/lib/utils"
import { PoapProps } from "@/types/Poaps"
import Lottie from "lottie-react";
import poapAnimation from "../../assets/lotties/poap_lottie.json"
import { Button } from "../ui/button";
import { Check } from "lucide-react";

const Poap = ({ poap }: {poap: PoapProps}) => {

  const variants = {
    mint: {
      label: "Mint POAP",
      container: "bg-white border border-[#FF8181]",
      image: "",
      containerImage: "bg-gradient-to-r from-[#FF8181] to-[#DE00F1] shadow-[0_54px_55px_rgba(255,129,129,0.25),0_-12px_30px_rgba(222,0,241,0.12),0_4px_6px_rgba(222,0,241,0.12),0_12px_13px_rgba(255,129,129,0.17),0_-3px_5px_rgba(222,0,241,0.09)]",
      button: "",
    },
    minted: {
      label: "Collected",
      container: "bg-transparent",
      image: "",
      containerImage: "bg-gradient-to-r from-[#00FF00] to-[#00FF00] shadow-[0_54px_55px_rgba(0,255,0,0.25),0_-12px_30px_rgba(0,255,0,0.12),0_4px_6px_rgba(0,255,0,0.12),0_12px_13px_rgba(0,255,0,0.17),0_-3px_5px_rgba(0,255,0,0.09)]",
      button: "bg-green-200/90 text-green-600",
    },
    disabled: {
      label: "Not available",
      container: "bg-transparent opacity-50",
      image: "",
      containerImage: "",
      button: "bg-gray-200/90 text-gray-600",
    }
  }

  const handleMint = () => {
    if(poap.link) {
      window.open(poap.link, "_blank")
    }
  }

  return (
    <div className={cn("p-6 rounded-2xl flex flex-col gap-4 relative", variants[poap.status].container)}>
      <div className={cn("rounded-full w-fit p-[2px]", variants[poap.status].containerImage)} style={{zIndex: 2, position: "relative"}} >
        {
          poap.status === "mint" && (
            <div className="absolute top-[-66px] left-[-60px]">
              <Lottie animationData={poapAnimation} className="w-[330px] h-[330px] object-cover rounded-full" style={{zIndex: 1}} />
            </div>
          )
        }
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img 
          src={poap.image} 
          alt={poap.title} 
          className={cn("w-[210px] h-[210px] object-cover rounded-full relative", variants[poap.status].image)} 
          style={{zIndex: 2, position: "relative"}} 
        />
      </div>

      <div className="flex flex-col gap-2 items-center justify-center mt-6">
        <p className="text-xl font-bold">{poap.title}</p>
        <p className="text-sm text-gray-500">{poap.location}</p>
        <Button onClick={handleMint} className={variants[poap.status].button} disabled={poap.status === 'disabled' || poap.status === 'minted'}>
          {poap.status === 'minted' && <Check className="w-4 h-4"/>}
          {variants[poap.status].label}
        </Button>
      </div>
    </div>
  )
}


export default Poap