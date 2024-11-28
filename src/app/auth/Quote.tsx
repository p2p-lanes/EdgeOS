import Image from 'next/image'

export default function Quote() {
  return (
    <div className="hidden md:flex md:w-1/2 bg-black relative p-8">
      <div className="absolute top-8 left-8">
        <Image
          src="https://cdn.prod.website-files.com/65b2cb5abdecf7cd7747e170/66b1dc2e893d609f5e3d5efa_ec_lockup_wht.svg"
          alt="EdgeCity Logo"
          width={100}
          height={40}
          priority
        />
      </div>
      <div className="absolute bottom-8 left-8 text-left pr-8">
        <blockquote className="text-white text-lg font-light italic mb-2">
          "The Network State: Where digital communities transcend borders and redefine governance."
        </blockquote>
        <p className="text-white text-sm">- Balaji Srinivasan</p>
      </div>
    </div>
  )
}

