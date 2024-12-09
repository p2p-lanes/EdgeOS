import { ApplicationProps } from "@/types/Application"
import { PopupsProps } from "@/types/Popup"

export const filterApplicationDraft = (applications: ApplicationProps[], city: PopupsProps) => {
  return applications?.filter((app: ApplicationProps) => app.popup_city_id === city?.id)?.slice(-1)[0]
}

export const filterAcceptedApplication = (applications: ApplicationProps[], city: PopupsProps, popups: PopupsProps[]) => {
  // Primero filtramos todas las aplicaciones aceptadas
  const acceptedApplications = applications?.filter(
    (app: ApplicationProps) => app.status === 'accepted'
  );

  if (!acceptedApplications?.length) return null;

  // Ordenamos las popups por end_date de más reciente a más antiguo
  const sortedPopups = [...popups].sort((a, b) => 
    new Date(b.end_date).getTime() - new Date(a.end_date).getTime()
  );

  // Buscamos la aplicación aceptada que corresponda a la popup más reciente
  for (const popup of sortedPopups) {
    const matchingApplication = acceptedApplications.find(
      app => app.popup_city_id === popup.id
    );
    if (matchingApplication) return matchingApplication;
  }

  return null;
}