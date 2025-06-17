"use client"

import { cn } from "@/lib/utils"
import { PoapProps } from "@/types/Poaps"
import Lottie from "lottie-react";
import poapAnimation from "../../../../assets/lotties/poap_lottie.json"
import { Button } from "../../../../components/ui/button";
import { Check, ExternalLink } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { TooltipProvider } from "@/components/ui/tooltip";

const Poap = ({ poap }: {poap: PoapProps}) => {
  // Determinar el estado del POAP basado en las propiedades de la API
  const getPoapStatus = () => {
    if (!poap.poap_is_active) return "disabled";
    if (poap.poap_claimed) return "minted";
    return "mint";
  };

  const status = getPoapStatus();

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
      container: "bg-white border border-gray-300",
      image: "",
      containerImage: "bg-gradient-to-r from-[#00FF00] to-[#00FF00] shadow-[0_54px_55px_rgba(0,255,0,0.25),0_-12px_30px_rgba(0,255,0,0.12),0_4px_6px_rgba(0,255,0,0.12),0_12px_13px_rgba(0,255,0,0.17),0_-3px_5px_rgba(0,255,0,0.09)]",
      button: "bg-green-200/90 text-green-600",
    },
    disabled: {
      label: "Not available",
      container: "bg-transparent opacity-50 border border-gray-300",
      image: "",
      containerImage: "",
      button: "bg-gray-200/90 text-gray-600",
    }
  }

  const handleMintPoap = () => {
    const tempLink = document.createElement('a');
    tempLink.href = poap.poap_url;
    tempLink.target = '_blank';
    tempLink.rel = 'noopener noreferrer';
    tempLink.style.display = 'none';
    
    document.body.appendChild(tempLink);
    tempLink.click();
    document.body.removeChild(tempLink);
    
    setTimeout(() => {
      if (document.hidden || !document.hasFocus()) {
        return;
      }
      window.location.href = poap.poap_url;
    }, 100);
   
  }

  return (
    <div className={cn("rounded-2xl flex flex-col gap-4 relative max-w-[272px] py-6 justify-center items-center overflow-hidden", variants[status].container)}>
      <div className="absolute top-0 right-0 overflow-hidden">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger>
              <div onClick={handleMintPoap} className="rounded-full p-2 cursor-pointer">
                <ExternalLink className="w-4 h-4" />
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p>Open POAP</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
      <div className={cn("rounded-full w-fit p-[2px]", variants[status].containerImage)} style={{zIndex: 2, position: "relative"}} >
        {
          status === "mint" && (
            <div className="absolute top-[-66px] left-[-60px]">
              <Lottie animationData={poapAnimation} className="w-[330px] h-[330px] object-cover rounded-full" style={{zIndex: 1}} />
            </div>
          )
        }
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img 
          src={poap.poap_image_url} 
          alt={poap.poap_name} 
          className={cn("w-[210px] h-[210px] object-cover rounded-full relative", variants[status].image)} 
          style={{zIndex: 2, position: "relative"}} 
        />
      </div>

      <div className="flex flex-col gap-2 items-center justify-center mt-6 px-4">
        <p className="text-xl font-bold text-center">{poap.poap_name}</p>
        {/* <p className="text-sm text-gray-500">{poap.poap_description}</p> */}
        <Button 
          className={variants[status].button} 
          disabled={status === 'disabled' || status === 'minted'}
          onClick={handleMintPoap}
        >
          {status === 'minted' && <Check className="w-4 h-4"/>}
          {variants[status].label}
        </Button>
      </div>
    </div>
  )
}

export default Poap