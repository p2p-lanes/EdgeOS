import { CitizenProfile } from "@/types/Profile"
import { Card } from "../ui/card"
import { Button } from "../ui/button"
import { Edit2, Save, X, User, Mail, MessageSquare, Calendar, Building, Upload, Loader2 } from "lucide-react"
import { Label } from "../ui/label"
import { Input } from "../ui/input"
import { useState, useRef } from "react"
import uploadFileToS3 from "@/helpers/upload"
import { RiTelegram2Line, RiTwitterXFill } from "react-icons/ri";

const HumanForm = ({userData, isEditing, setIsEditing, handleSave, handleCancel, editForm, setEditForm}: {userData: CitizenProfile | null, isEditing: boolean, setIsEditing: (isEditing: boolean) => void, handleSave: () => void, handleCancel: () => void, editForm: any, setEditForm: (editForm: any) => void}) => {
  const [isHovering, setIsHovering] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  const handleAvatarClick = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Validar que sea una imagen
    if (!file.type.startsWith('image/')) {
      alert('Por favor selecciona un archivo de imagen válido')
      return
    }

    // Validar tamaño del archivo (máximo 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('El archivo es demasiado grande. Por favor selecciona una imagen menor a 5MB')
      return
    }

    try {
      setIsUploading(true)
      setIsEditing(true)
      const imageUrl = await uploadFileToS3(file)
      
      // Actualizar el formulario con la nueva imagen
      setEditForm({ ...editForm, picture_url: imageUrl })
      
      console.log('Imagen subida exitosamente:', imageUrl)
    } catch (error) {
      console.error('Error al subir la imagen:', error)
      alert('Error al subir la imagen. Por favor intenta de nuevo.')
    } finally {
      setIsUploading(false)
      // Limpiar el input para permitir subir el mismo archivo nuevamente
      if (event.target) {
        event.target.value = ''
      }
    }
  }

  return (
    <Card className="p-6 bg-white mb-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <div className="relative">
            <div 
              className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center cursor-pointer transition-all duration-200 hover:bg-blue-200 group"
              onMouseEnter={() => setIsHovering(true)}
              onMouseLeave={() => setIsHovering(false)}
              onClick={handleAvatarClick}
            >
              {userData?.picture_url || editForm?.picture_url ? (
                <img
                  src={editForm?.picture_url || userData?.picture_url}
                  alt="Profile"
                  className="w-full h-full rounded-full object-cover"
                />
              ) : (
                <User className="w-8 h-8 text-blue-600" />
              )}
              
              {/* Overlay con icono de upload en hover o loader */}
              {(isHovering || isUploading) && (
                <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center transition-all duration-200">
                  {isUploading ? (
                    <Loader2 className="w-6 h-6 text-white animate-spin" />
                  ) : (
                    <Upload className="w-6 h-6 text-white" />
                  )}
                </div>
              )}
            </div>
            
            {/* Input de archivo oculto */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              {userData?.first_name} {userData?.last_name}
            </h2>
            <p className="text-gray-600">{userData?.role}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {!isEditing ? (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsEditing(true)}
              className="text-gray-700 border-gray-300 hover:bg-gray-50"
            >
              <Edit2 className="w-4 h-4 mr-2" />
              Edit Profile
            </Button>
          ) : (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={handleCancel}
                className="text-gray-700 border-gray-300 hover:bg-gray-50 bg-transparent"
              >
                <X className="w-4 h-4 mr-2" />
                Cancel
              </Button>
              <Button size="sm" onClick={handleSave} className="bg-blue-600 hover:bg-blue-700 text-white">
                <Save className="w-4 h-4 mr-2" />
                Save
              </Button>
            </>
          )}
        </div>
      </div>

      {!isEditing ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {userData?.primary_email && (
            <div className="flex items-center gap-3">
              <Mail className="w-5 h-5 text-gray-400" />
              <div>
                <p className="text-sm text-gray-600">Email</p>
                <p className="text-gray-900">{userData?.primary_email}</p>
              </div>
            </div>
          )}
           {userData?.gender && (
            <div className="flex items-center gap-3">
              <User className="w-5 h-5 text-gray-400" />
              <div>
                <p className="text-sm text-gray-600">Gender</p>
                <p className="text-gray-900">{userData?.gender}</p>
              </div>
            </div>
          )}
          {userData?.organization && (
            <div className="flex items-center gap-3">
              <Building className="w-5 h-5 text-gray-400" />
              <div>
                <p className="text-sm text-gray-600">Organization</p>
                <p className="text-gray-900">{userData?.organization}</p>
              </div>
            </div>
          )}
          {userData?.x_user && (
            <div className="flex items-center gap-3">
              <RiTwitterXFill className="w-5 h-5 text-gray-400" />
              <div>
                <p className="text-sm text-gray-600">X (Twitter)</p>
                <p className="text-gray-900">{userData?.x_user}</p>
              </div>
            </div>
          )}
          {userData?.telegram && (
            <div className="flex items-center gap-3">
              <RiTelegram2Line className="w-5 h-5 text-gray-400" />
              <div>
                <p className="text-sm text-gray-600">Telegram</p>
                <p className="text-gray-900">{userData?.telegram}</p>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <Label htmlFor="first_name" className="text-sm font-medium text-gray-700">
                First Name
              </Label>
              <Input
                id="first_name"
                value={editForm.first_name ?? ""}
                onChange={(e) => setEditForm({ ...editForm, first_name: e.target.value })}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="last_name" className="text-sm font-medium text-gray-700">
                Last Name
              </Label>
              <Input
                id="last_name"
                value={editForm.last_name ?? ""}
                onChange={(e) => setEditForm({ ...editForm, last_name: e.target.value })}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="secondary_email" className="text-sm font-medium text-gray-700">
                Organization
              </Label>
              <Input
                id="organization"
                type="email"
                value={editForm.organization ?? ""}
                onChange={(e) => setEditForm({ ...editForm, organization: e.target.value })}
                className="mt-1"
              />
            </div>
          </div>
          <div className="space-y-4">
            <div>
              <Label htmlFor="x_user" className="text-sm font-medium text-gray-700">
                X (Twitter)
              </Label>
              <Input
                id="x_user"
                value={editForm.x_user ?? ""}
                onChange={(e) => setEditForm({ ...editForm, x_user: e.target.value })}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="telegram" className="text-sm font-medium text-gray-700">
                Telegram
              </Label>
              <Input
                id="telegram"
                value={editForm.telegram ?? ""}
                onChange={(e) => setEditForm({ ...editForm, telegram: e.target.value })}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="role" className="text-sm font-medium text-gray-700">
                Role
              </Label>
              <Input
                id="role"
                value={editForm.role ?? ""}
                onChange={(e) => setEditForm({ ...editForm, role: e.target.value })}
                className="mt-1"
              />
            </div>
          </div>
        </div>
      )}
    </Card>
  )
}
export default HumanForm