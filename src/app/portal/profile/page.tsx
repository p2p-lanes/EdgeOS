"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { MapPin, Calendar, Clock, Edit2, Save, X, User, Mail, MessageSquare, Medal } from "lucide-react"
import useGetProfile from "@/hooks/useGetProfile"
import Image from "next/image"
import { useRouter } from "next/navigation"

export default function ProfileContent() {
  const { profile, isLoading, error, updateProfile, isUpdating, updateError } = useGetProfile()
  const [userData, setUserData] = useState(profile)
  const router = useRouter()

  const [isEditing, setIsEditing] = useState(false)
  const [editForm, setEditForm] = useState({
    first_name: userData?.first_name,
    last_name: userData?.last_name,
    primary_email: userData?.primary_email,
    secondary_email: userData?.secondary_email,
    x_user: userData?.x_user,
    telegram: userData?.telegram,
    gender: userData?.gender,
    role: userData?.role,
  })
  
  const totalDays = userData?.total_days ?? 0

  useEffect(() => {
    if (!profile) return
    setUserData(profile)
    setEditForm({
      first_name: profile.first_name,
      last_name: profile.last_name,
      primary_email: profile.primary_email,
      secondary_email: profile.secondary_email,
      x_user: profile.x_user,
      telegram: profile.telegram,
      gender: profile.gender,
      role: profile.role,
    })
  }, [profile])

  const handleSave = async () => {
    const updated = await updateProfile({
      first_name: editForm.first_name,
      last_name: editForm.last_name,
      primary_email: editForm.primary_email,
      secondary_email: editForm.secondary_email,
      x_user: editForm.x_user,
      telegram: editForm.telegram,
      gender: editForm.gender,
      role: editForm.role,
    })
    if (updated) {
      setUserData(updated)
      setIsEditing(false)
    }
  }

  const handleCancel = () => {
    if (!userData) return
    setEditForm({
      first_name: userData.first_name,
      last_name: userData.last_name,
      primary_email: userData.primary_email,
      secondary_email: userData.secondary_email,
      x_user: userData.x_user,
      telegram: userData.telegram,
      gender: userData.gender,
      role: userData.role,
    })
    setIsEditing(false)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  const getPopupStatus = (startDate: string, endDate: string) => {
    const now = new Date()
    const start = new Date(startDate)
    const end = new Date(endDate)

    if (now > end) {
      return { label: "Completed", className: "bg-green-100 text-green-800" }
    }
    if (now >= start && now <= end) {
      return { label: "In progress", className: "bg-blue-100 text-blue-800" }
    }
    return { label: "Incoming", className: "bg-gray-100 text-gray-800" }
  }

  const uniqueCountries = new Set((userData?.popups ?? []).map((popup) => (popup.location ?? "").split(", ").pop())).size

  return (
    <div className="flex-1 flex flex-col">
      {/* Header with CTAs */}
      <div className="p-6 border-b border-gray-200 bg-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">My Profile</h1>
            <p className="text-gray-600">Manage your Edge experience and history</p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" className="text-gray-700 border-gray-300 bg-transparent" onClick={ () => router.push('/portal/poaps')}>
              <Medal className="mr-2 size-4" />
              My Collectibles
            </Button>
            {/* <Button variant="outline" className="text-gray-700 border-gray-300 hover:bg-gray-50 bg-transparent">
              My Referrals
            </Button>
            <Button variant="outline" className="text-gray-700 border-gray-300 hover:bg-gray-50 bg-transparent">
              Invoices
            </Button> */}
          </div>
        </div>
      </div>

      {/* Profile Content */}
      <div className="flex-1 p-6 bg-gray-50">
        <div className="max-w-5xl mx-auto">
          {isLoading && (
            <div className="text-gray-600">Loading profile...</div>
          )}
          {error && !isLoading && (
            <div className="text-red-600">{error}</div>
          )}
          {updateError && (
            <div className="text-red-600 mb-4">{updateError}</div>
          )}
          {!isLoading && !profile ? (
            <Card className="p-6 bg-white">No profile data available.</Card>
          ) : null}
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  {userData?.primary_email && (
                    <div className="flex items-center gap-3">
                      <Mail className="w-5 h-5 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-600">Email</p>
                        <p className="text-gray-900">{userData?.primary_email}</p>
                        </div>
                    </div>
                  )}
                  {userData?.secondary_email && (
                    <div className="flex items-center gap-3">
                      <Mail className="w-5 h-5 text-gray-400" />
                        <div>
                        <p className="text-sm text-gray-600">Secondary Email</p>
                        <p className="text-gray-900">{userData?.secondary_email}</p>
                        </div>
                    </div>
                  )}
                  {userData?.x_user && (
                    <div className="flex items-center gap-3">
                      <MessageSquare className="w-5 h-5 text-gray-400" />
                        <div>
                        <p className="text-sm text-gray-600">X (Twitter)</p>
                        <p className="text-gray-900">{userData?.x_user}</p>
                        </div>
                    </div>
                  )}
                </div>
                <div className="space-y-4">
                  {userData?.telegram && (
                    <div className="flex items-center gap-3">
                      <MessageSquare className="w-5 h-5 text-gray-400" />
                        <div>
                        <p className="text-sm text-gray-600">Telegram</p>
                        <p className="text-gray-900">{userData?.telegram}</p>
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
                  {userData?.created_at && (
                    <div className="flex items-center gap-3">
                      <Calendar className="w-5 h-5 text-gray-400" />
                        <div>
                        <p className="text-sm text-gray-600">Member Since</p>
                        <p className="text-gray-900">{userData?.created_at ? formatDate(userData.created_at) : ""}</p>
                        </div>
                    </div>
                  )}
                </div>
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
                    <Label htmlFor="primary_email" className="text-sm font-medium text-gray-700">
                      Primary Email
                    </Label>
                    <Input
                      id="primary_email"
                      type="email"
                      value={editForm.primary_email ?? ""}
                      onChange={(e) => setEditForm({ ...editForm, primary_email: e.target.value })}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="secondary_email" className="text-sm font-medium text-gray-700">
                      Secondary Email
                    </Label>
                    <Input
                      id="secondary_email"
                      type="email"
                      value={editForm.secondary_email ?? ""}
                      onChange={(e) => setEditForm({ ...editForm, secondary_email: e.target.value })}
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

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card className="p-6 bg-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Pop-ups attended</p>
                  <p className="text-3xl font-bold text-gray-900">{userData?.popups?.length ?? 0}</p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Calendar className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </Card>

            <Card className="p-6 bg-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Days at Edge</p>
                  <p className="text-3xl font-bold text-gray-900">{userData?.total_days ?? 0}</p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <Clock className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </Card>

            <Card className="p-6 bg-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Countries Visited</p>
                  <p className="text-3xl font-bold text-gray-900">{uniqueCountries}</p>
                </div>
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <MapPin className="w-6 h-6 text-purple-600" />
                </div>
              </div>
            </Card>
          </div>

          {/* Events History */}
          <div className="bg-white rounded-lg border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">Events History</h2>
              <p className="text-gray-600">Your participation in Edge events</p>
            </div>

            <div className="p-6">
              <div className="space-y-6">
                {(userData?.popups ?? []).map((popup, index) => (
                  <div
                    key={index}
                    className="flex items-start gap-4 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <Image
                      src={popup.image_url || "/placeholder.svg"}
                      alt={popup.popup_name}
                      width={160}
                      height={120}
                      className="w-40 h-30 object-cover rounded-lg"
                    />

                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">{popup.popup_name}</h3>
                        {(() => {
                          const status = getPopupStatus(popup.start_date, popup.end_date)
                          return (
                            <span className={`px-3 py-1 ${status.className} text-sm font-medium rounded-full`}>
                              {status.label}
                            </span>
                          )
                        })()}
                      </div>

                      <div className="space-y-2 mb-4">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <MapPin className="w-4 h-4" />
                          <span>{popup.location}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Calendar className="w-4 h-4" />
                          <span>
                            {formatDate(popup.start_date)} - {formatDate(popup.end_date)}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Clock className="w-4 h-4" />
                          <span>{popup.total_days} days attended</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
