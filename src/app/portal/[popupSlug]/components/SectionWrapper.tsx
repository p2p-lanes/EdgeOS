const SectionWrapper = ({children}: {children: React.ReactNode}) => {
  return (
    <div className="grid gap-10 lg:grid-cols-[260px,1fr]">
      {children}
    </div>

  )
}
export default SectionWrapper