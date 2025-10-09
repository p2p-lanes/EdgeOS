import { createContext, ReactNode, useContext, useMemo, useState, useEffect } from 'react';
import { useApplication } from './applicationProvider';
import { usePassesProvider } from './passesProvider';
import { TotalCalculator } from '@/strategies/TotalStrategy';
import useDiscountCode from '@/app/portal/[popupSlug]/passes/hooks/useDiscountCode';
import { useGroupsProvider } from './groupsProvider';

interface TotalContext_interface {
  total: number;
  originalTotal: number;
  discountAmount: number;
  balance: number;
  groupDiscountPercentage: number;
  groupName: string | null;
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
  const [groupDiscountPercentage, setGroupDiscountPercentage] = useState<number>(0)
  const [groupName, setGroupName] = useState<string | null>(null)
  const { groups } = useGroupsProvider()

  useEffect(() => {
    const hasPatreon = attendeePasses.some(a => a.products.some(p => (p.category === 'patreon' || p.category === 'supporter') && p.selected))
    const calculator = new TotalCalculator();
    
    // Find group discount if application has group_id
    let groupDiscountValue = 0;
    let groupNameValue = null;
    if (application?.group_id && groups.length > 0) {
      const group = groups.find(g => g.id === application.group_id);
      if (group && group.discount_percentage) {
        groupDiscountValue = group.discount_percentage;
        groupNameValue = group.name;
      }
    }
    
    const result = calculator.calculate(attendeePasses, discountApplied, groupDiscountValue)
    const balance = hasPatreon ? result.total : result.total - (application?.credit || 0)

    setTotalState(balance)
    setOriginalTotalState(result.originalTotal)
    setDiscountAmountState(result.discountAmount)
    setBalanceState(balance)
    setGroupDiscountPercentage(groupDiscountValue)
    setGroupName(groupNameValue)
  }, [application, attendeePasses, discountApplied, groups])


  console.log({total, originalTotal, discountAmount, balance, groupDiscountPercentage, groupName})
  return (
    <TotalContext.Provider 
      value={{
        total,
        originalTotal,
        discountAmount,
        balance,
        groupDiscountPercentage,
        groupName
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