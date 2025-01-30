const validateVideoUrl = (videoUrl: string | boolean | string[] | string[][] | null, fields?: Set<string> | null) => {
  return String(videoUrl)?.length > 0 && (fields ? fields?.has("video_url") : true);
}

export { validateVideoUrl }