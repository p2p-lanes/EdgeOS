import { useEffect } from 'react';
import { api } from '@/api';
import { usePoapsProvider } from '@/providers/poapsProvider';
import { PoapProps } from '@/types/Poaps';
import { PoapResponse } from '@/types/Poaps';

export const useGetPoaps = () => {
  const { poaps, setPoaps, loading, setLoading, setPoapsWithPopup } = usePoapsProvider();

  useEffect(() => {
    const checkPoaps = async () => {
      try {
        setLoading(true);
        const response = await api.get('citizens/my-poaps');
        if (response.status === 200 && response.data?.results && response.data.results.length > 0) {
          
          // Unir todos los poaps de todos los popups en un solo array
          const allPoaps = response.data.results.flatMap((result: PoapResponse) => result.poaps || []);

          setPoapsWithPopup(response.data.results);

          if(allPoaps.length > 0) {
              const sortedPoaps = allPoaps.sort((a: PoapProps, b: PoapProps) => {
                if (!a.poap_claimed && b.poap_claimed) {
                  return -1;
                }
                if (a.poap_claimed && !b.poap_claimed) {
                  return 1;
                }
                if (a.poap_is_active && !b.poap_is_active) {
                  return -1;
                }
                if (!a.poap_is_active && b.poap_is_active) {
                  return 1;
                }
                
                return 0;
              });
            
            setPoaps(sortedPoaps);
          } else {
            setPoaps(null);
          }
        } else {
          setPoaps(null);
        }
      } catch (error) {
        console.error('Error checking poaps:', error);
        setPoaps(null);
      } finally {
        setLoading(false);
      }
    };

    checkPoaps();
  }, [setLoading, setPoaps]);

  return { poaps, loading };
};
