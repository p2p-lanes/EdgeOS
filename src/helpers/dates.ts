export const toDate = (date: string) => {
  return new Date(date).toLocaleDateString('en-US', { month: 'long', day: 'numeric' })
}

export const toDateRange = (startDate: string, endDate: string) => {
  return `${toDate(startDate)} - ${toDate(endDate)}`
}