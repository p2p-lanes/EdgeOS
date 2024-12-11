const validateVideoUrl = (videoUrl: string | boolean | string[] | string[][] | null) => {
  return String(videoUrl)?.length > 0;
}

export { validateVideoUrl }