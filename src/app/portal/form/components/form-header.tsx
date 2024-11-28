import Image from "next/image"

export function FormHeader() {
  return (
    <div className="space-y-6">
      <div className="flex items-center">
        <Image
          src="/placeholder.svg"
          alt="Edge Esmeralda"
          width={150}
          height={40}
          className="dark:invert"
        />
      </div>
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Edge Esmeralda application</h1>
        <p className="text-sm text-primary">
          OUR APPLICATIONS ARE NOW CLOSED. 2025 APPLICATIONS WILL OPEN SOON.
        </p>
      </div>
    </div>
  )
}

