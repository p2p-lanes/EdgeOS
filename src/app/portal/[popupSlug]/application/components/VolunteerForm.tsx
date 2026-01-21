import Link from "next/link"
import SectionWrapper from "./SectionWrapper"

const VolunteerForm = () => {
  return (
    <SectionWrapper 
        title={'Volunteering Opportunity'} 
        subtitle={''}
      >  
        <div className="flex flex-col gap-2 mt-2">
          <p className="text-sm font-medium leading-none  text-gray-700">We offer volunteering options in exchange for a ticket discount. If you are interested, please 
            <Link href="https://docs.google.com/forms/d/e/1FAIpQLSevuZSnR4j24xgHF6lbq5X2wgpeQqiagzIU29OsBohvgMts7A/viewform" target="_blank" className="underline text-blue-500"> apply here</Link></p>
        </div>
      </SectionWrapper>
  )
}
export default VolunteerForm