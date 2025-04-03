// Componente para mostrar un detalle del miembro
const DetailItem = ({ label, value }: { label: string, value: string }) => (
  <div>
    <p className="text-xs text-gray-500 uppercase font-medium">{label}</p>
    <p className="text-sm font-medium mt-1">{value}</p>
  </div>
)

export default DetailItem 