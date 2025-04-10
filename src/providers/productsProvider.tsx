import { createContext, ReactNode, useContext, useState, useEffect } from 'react';
import { api } from '@/api';
import { useCityProvider } from './cityProvider';
import { ProductsProps } from '@/types/Products';

interface ProductsDataContextProps {
  products: ProductsProps[];
  loading: boolean;
  refreshProductsData: () => Promise<void>;
}

const ProductsDataContext = createContext<ProductsDataContextProps | null>(null);

export const ProductsProvider = ({ children }: { children: ReactNode }) => {
  const [products, setProducts] = useState<ProductsProps[]>([]);
  const [loading, setLoading] = useState(false);
  const { getCity } = useCityProvider();
  const city = getCity();

  const fetchProductsData = async () => {
    if (!city) return;

    setLoading(true);
    
    const endpoint = `products?popup_city_id=${city.id}`;

    try {
      const response = await api.get(endpoint);
      
      if (response.status === 200) {
        setProducts(response.data);
      }
    } catch (error) {
      console.error('Error fetching products data:', error);
    } finally {
      setLoading(false);
    }
  };

  const refreshProductsData = async () => {
    await fetchProductsData();
  };

  useEffect(() => {
    fetchProductsData();
  }, [city?.id]);

  return (
    <ProductsDataContext.Provider value={{ products, loading, refreshProductsData }}>
      {children}
    </ProductsDataContext.Provider>
  );
};

export const useProductsData = (): ProductsDataContextProps => {
  const context = useContext(ProductsDataContext);
  if (context === null) {
    throw new Error('useProductsData must be used within a ProductsDataProvider');
  }
  return context;
};

export default ProductsProvider; 