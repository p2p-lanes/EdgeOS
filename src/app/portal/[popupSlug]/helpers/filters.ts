import { ApplicationProps } from "@/types/Application"
import { PopupsProps } from "@/types/Popup"

export const filterApplicationDraft = (applications: ApplicationProps[], city: PopupsProps) => {
  return applications?.find((app: ApplicationProps) => app.popup_city_id === city?.id && app.status === 'draft')
}

export const filterAcceptedApplication = (applications: ApplicationProps[], city: PopupsProps, popups: PopupsProps[]) => {
  // Encontrar la popup más reciente excluyendo la ciudad actual
  const mostRecentPopup = popups
    .filter(popup => popup.id !== city.id)
    .sort((a, b) => new Date(b.end_date).getTime() - new Date(a.end_date).getTime())[0];

  // Si encontramos una popup, buscar una aplicación aceptada para ella
  if (mostRecentPopup) {
    return applications?.find(
      (app: ApplicationProps) => 
        app.status === 'accepted' && 
        app.popup_city_id === mostRecentPopup.id
    );
  }

  return undefined;
}