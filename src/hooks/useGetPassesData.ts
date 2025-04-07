import { useProductsData } from "@/providers/productsProvider"

const useGetPassesData = () => {
  const { products, loading, refreshProductsData } = useProductsData()

  return { products, loading, refreshProductsData }
}

export default useGetPassesData