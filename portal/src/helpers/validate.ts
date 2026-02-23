const validateVideoUrl = (
  videoUrl: string | boolean | string[] | string[][] | null,
  fields?: Set<string> | null,
) => {
  // Si videoUrl tiene un valor, considerarlo válido
  // Si fields existe, verificar también que video_url esté en los campos
  const hasValue = String(videoUrl)?.length > 0
  const fieldExists = fields ? fields?.has("video_url") : true

  return hasValue || !fieldExists // Devuelve true si tiene valor o si el campo no existe
}

export { validateVideoUrl }
