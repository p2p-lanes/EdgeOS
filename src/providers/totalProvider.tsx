import { createContext, ReactNode, useContext, useMemo, useState, useEffect } from 'react';
import { useApplication } from './applicationProvider';
import { usePassesProvider } from './passesProvider';
import { TotalCalculator } from '@/strategies/TotalStrategy';
import useDiscountCode from '@/app/portal/[popupSlug]/passes/hooks/useDiscountCode';

interface TotalContext_interface {
  total: number;
  originalTotal: number;
  discountAmount: number;
  balance: number;
}

const TotalContext = createContext<TotalContext_interface | null>(null);

const TotalProvider = ({ children }: { children: ReactNode }) => {
  const { getRelevantApplication } = useApplication()
  const application = getRelevantApplication()
  const { attendeePasses } = usePassesProvider()
  const { discountApplied } = useDiscountCode()
  const [total, setTotalState] = useState<number>(0)
  const [originalTotal, setOriginalTotalState] = useState<number>(0)
  const [discountAmount, setDiscountAmountState] = useState<number>(0)
  const [balance, setBalanceState] = useState<number>(0)

  useEffect(() => {
    const calculator = new TotalCalculator();
    const result = calculator.calculate(attendeePasses, discountApplied)
    const balance = result.total - (application?.credit || 0)

    setTotalState(balance)
    setOriginalTotalState(result.originalTotal)
    setDiscountAmountState(result.discountAmount)
    setBalanceState(balance)
  }, [application, attendeePasses, discountApplied])


  return (
    <TotalContext.Provider 
      value={{
        total,
        originalTotal,
        discountAmount,
        balance
      }}
    >
      {children}
    </TotalContext.Provider>
  )
}

export const useTotal = () => {
  const context = useContext(TotalContext);
  if (!context) {
    throw new Error('useTotal must be used within a TotalProvider');
  }
  return context;
}

export default TotalProvider