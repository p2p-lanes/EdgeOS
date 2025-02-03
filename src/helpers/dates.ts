export const toDate = (date: string) => {
  return new Date(date).toLocaleDateString('en-US', { month: 'long', day: 'numeric' })
}

export const toDateRange = (startDate: string, endDate: string) => {
  return `${toDate(startDate)} - ${toDate(endDate)}`
}

export const formatDate = (date?: string, formatString: Intl.DateTimeFormatOptions = {day: 'numeric', month: 'numeric', year: 'numeric'}) => {
  if (!date) return ''
  return new Date(date).toLocaleDateString('en-EN', formatString)
}
