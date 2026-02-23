"use client"

import { useEffect, useState } from "react"
import HeaderProfile from "@/components/profile/HeaderProfile"
import HumanForm from "@/components/profile/HumanForm"
import PopupsHistory from "@/components/profile/PopupsHistory"
import ReferralLinks from "@/components/profile/ReferralLinks"
import StatsCards from "@/components/profile/StatsCards"
import { Card } from "@/components/ui/card"
import { Loader } from "@/components/ui/Loader"
import useGetProfile from "@/hooks/useGetProfile"

export default function ProfileContent() {
  const {
    profile,
    isLoading,
    error,
    updateProfile,
    isUpdating,
    updateError,
    refresh,
  } = useGetProfile()
  const [userData, setUserData] = useState(profile)
  const [isEditing, setIsEditing] = useState(false)
  const [editForm, setEditForm] = useState({
    first_name: userData?.first_name,
    last_name: userData?.last_name,
    organization: userData?.organization,
    telegram: userData?.telegram,
    gender: userData?.gender,
    role: userData?.role,
    picture_url: userData?.picture_url,
  })

  useEffect(() => {
    if (!profile) return
    setUserData(profile)
    setEditForm({
      first_name: profile.first_name,
      last_name: profile.last_name,
      organization: profile.organization,
      telegram: profile.telegram,
      gender: profile.gender,
      role: profile.role,
      picture_url: profile.picture_url,
    })
  }, [profile])

  useEffect(() => {
    const handleAccountsLinked = async () => {
      await refresh()
    }

    if (typeof window !== "undefined") {
      window.addEventListener("accounts-linked", handleAccountsLinked)
      return () => {
        window.removeEventListener("accounts-linked", handleAccountsLinked)
      }
    }
  }, [refresh])

  const handleSave = async () => {
    const updated = await updateProfile({
      first_name: editForm.first_name ?? undefined,
      last_name: editForm.last_name ?? undefined,
      organization: editForm.organization ?? undefined,
      telegram: editForm.telegram ?? undefined,
      gender: editForm.gender ?? undefined,
      role: editForm.role ?? undefined,
      picture_url: editForm.picture_url ?? undefined,
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
      organization: userData.organization,
      telegram: userData.telegram,
      gender: userData.gender,
      role: userData.role,
      picture_url: userData.picture_url,
    })
    setIsEditing(false)
  }

  if (!isLoading && !profile) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center h-full">
        <Card className="p-6 bg-white gap-2">
          <p className="text-gray-600 text-center">
            No profile data available.
          </p>
          <p className="text-gray-600 text-center">
            Please contact support if you believe this is an error.
          </p>
          <p className="text-red-600 text-center">{error}</p>
        </Card>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center h-full">
        <Loader />
      </div>
    )
  }

  return (
    <div className="flex-1 flex flex-col">
      {/* Header with CTAs */}
      <HeaderProfile />

      {/* Profile Content */}
      <div className="flex-1 p-6 bg-gray-50">
        <div className="max-w-5xl mx-auto space-y-6">
          <HumanForm
            userData={userData}
            isEditing={isEditing}
            setIsEditing={setIsEditing}
            handleSave={handleSave}
            handleCancel={handleCancel}
            editForm={editForm}
            setEditForm={setEditForm}
          />

          <StatsCards userData={userData} />

          {/* LEGACY: referral_count removed from API – review for deletion */}
          <ReferralLinks referralCount={0} />

          {/* LEGACY: popups history removed from API – review for deletion */}
          <PopupsHistory popups={[]} />
        </div>
      </div>
    </div>
  )
}
