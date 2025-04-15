import { ArrowRight } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { usePoapsProvider } from '@/providers/poapsProvider';
import { PoapProps } from '@/types/Poaps';

const PoapMint = () => {
  const router = useRouter();
  const { poaps, loading } = usePoapsProvider();

  const handleClick = () => {
    router.push(`/portal/poaps`);
  };

  if (loading || !poaps || !poaps.some((poap: PoapProps) => poap.poap_is_active && !poap.poap_claimed)) return null;

  return (
    <div onClick={handleClick} className='w-full bg-gradient-to-r from-[#FF8181] to-[#DE00F1] p-[2px] hover:shadow-lg hover:shadow-pink-300/30 transition-all duration-300 rounded-lg cursor-pointer flex justify-between items-center'>
      <div className='group-data-[collapsible=icon]:hidden bg-white hover:bg-gradient-to-r hover:from-[#FF8181]/10 hover:to-[#DE00F1]/10 rounded-lg rounded-r-none w-full h-full flex items-center gap-2 justify-center'>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={'https://simplefi.s3.us-east-2.amazonaws.com/logo_base.png'} alt='poap' width={18} height={18} />
        <p className='text-xs font-bold'>You have POAPs to mint!</p>
      </div>
      <div className='bg-gradient-to-r from-[#FF8181] to-[#DE00F1] w-10 h-8 flex items-center justify-center rounded-r-lg'>
        <ArrowRight className='w-4 h-4 text-white' />
      </div>
    </div>
  );
};

export default PoapMint;