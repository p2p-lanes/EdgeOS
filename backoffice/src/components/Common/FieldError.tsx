export function FieldError({ errors }: { errors: (string | undefined)[] }) {
  const messages = errors.filter(Boolean)
  if (messages.length === 0) return null
  return <p className="text-destructive text-xs">{messages.join(", ")}</p>
}
