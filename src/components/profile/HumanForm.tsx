import { CitizenProfile } from "@/types/Profile"
import { Card } from "../ui/card"
import { Button } from "../ui/button"
import { Edit2, Save, X, User, Mail, MessageSquare, Calendar } from "lucide-react"
import { Label } from "../ui/label"
import { Input } from "../ui/input"

const HumanForm = ({userData, isEditing, setIsEditing, handleSave, handleCancel, editForm, setEditForm}: {userData: CitizenProfile | null, isEditing: boolean, setIsEditing: (isEditing: boolean) => void, handleSave: () => void, handleCancel: () => void, editForm: any, setEditForm: (editForm: any) => void}) => {

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  return (
    <Card className="p-6 bg-white mb-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
            <User className="w-8 h-8 text-blue-600" />
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
        <div className="flex flex-wrap gap-6">
          {userData?.primary_email && (
            <div className="flex items-center gap-3 min-w-[300px] flex-1">
              <Mail className="w-5 h-5 text-gray-400" />
              <div>
                <p className="text-sm text-gray-600">Email</p>
                <p className="text-gray-900">{userData?.primary_email}</p>
              </div>
            </div>
          )}
          {userData?.secondary_email && (
            <div className="flex items-center gap-3 min-w-[300px] flex-1">
              <Mail className="w-5 h-5 text-gray-400" />
              <div>
                <p className="text-sm text-gray-600">Secondary Email</p>
                <p className="text-gray-900">{userData?.secondary_email}</p>
              </div>
            </div>
          )}
          {userData?.x_user && (
            <div className="flex items-center gap-3 min-w-[300px] flex-1">
              <MessageSquare className="w-5 h-5 text-gray-400" />
              <div>
                <p className="text-sm text-gray-600">X (Twitter)</p>
                <p className="text-gray-900">{userData?.x_user}</p>
              </div>
            </div>
          )}
          {userData?.telegram && (
            <div className="flex items-center gap-3 min-w-[300px] flex-1">
              <MessageSquare className="w-5 h-5 text-gray-400" />
              <div>
                <p className="text-sm text-gray-600">Telegram</p>
                <p className="text-gray-900">{userData?.telegram}</p>
              </div>
            </div>
          )}
          {userData?.gender && (
            <div className="flex items-center gap-3 min-w-[300px] flex-1">
              <User className="w-5 h-5 text-gray-400" />
              <div>
                <p className="text-sm text-gray-600">Gender</p>
                <p className="text-gray-900">{userData?.gender}</p>
              </div>
            </div>
          )}
          {userData?.created_at && (
            <div className="flex items-center gap-3 min-w-[300px] flex-1">
              <Calendar className="w-5 h-5 text-gray-400" />
              <div>
                <p className="text-sm text-gray-600">Member Since</p>
                <p className="text-gray-900">{userData?.created_at ? formatDate(userData.created_at) : ""}</p>
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