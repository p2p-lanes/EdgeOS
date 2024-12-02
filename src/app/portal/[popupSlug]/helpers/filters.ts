export const filterApplications = (applications: any, city: any) => {
  return applications?.filter((app: any) => app.popup_city_id === city?.id)?.slice(-1)[0]
}

export const filterAcceptedApplications = (applications: any) => {
  return applications?.find((app: any) => app.status === 'accepted')
}