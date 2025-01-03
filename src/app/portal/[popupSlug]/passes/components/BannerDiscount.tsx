const BannerDiscount = ({discount, label}: {discount: number, label: string}) => {
  return (
    <div className="w-full bg-gradient-to-r from-[#FF7B7B] to-[#E040FB] py-1 relative top-0 left-0">
      <div className="w-full mx-auto flex justify-center items-center">
        <h2 className="text-white text-center">
          <span className="text-sm font-bold mr-2">{discount}% discount applied</span>
          <span className="text-xs">{label}</span>
        </h2>
      </div>
    </div>
  )
}
export default BannerDiscount