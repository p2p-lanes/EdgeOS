const TitleTabs = ({title, subtitle}: {title: string, subtitle: string}) => {
  return (
    <div className="flex flex-col gap-2 max-w-3xl">
      <h1 className="text-[34px]/[51px] font-semibold">{title}</h1>
      <p className="text-regular text-muted-foreground/75">{subtitle}</p>
    </div>
  )
}

export default TitleTabs