import PassesProvider from "@/providers/passesProvider"
import TotalProvider from "@/providers/totalProvider"

const layout = ({children}: {children: React.ReactNode}) => {

  return (
    <div>
      {children}
    </div>
    // <PassesProvider>
    //   <TotalProvider>
    //     {children}
    //   </TotalProvider>
    // </PassesProvider>
  )
}

export default layout