"use client"

import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import useGetProfile from "@/hooks/useGetProfile"
import Groups from "@/components/profile/Groups"
import PopupsHistory from "@/components/profile/PopupsHistory"
import HumanForm from "@/components/profile/HumanForm"
import HeaderProfile from "@/components/profile/HeaderProfile"
import StatsCards from "@/components/profile/StatsCards"
import MergeEmails from "@/components/profile/MergeEmails"
import ReferralLinks from "@/components/profile/ReferralLinks"
import ProfileStats from "@/components/profile/ProfileStats"
import { Loader } from "@/components/ui/Loader"

export default function ProfileContent() {
  const { profile, isLoading, error, updateProfile, isUpdating, updateError, refresh } = useGetProfile()
  const [userData, setUserData] = useState(profile)
  const [isEditing, setIsEditing] = useState(false)
  const [editForm, setEditForm] = useState({
    first_name: userData?.first_name,
    last_name: userData?.last_name,
    primary_email: userData?.primary_email,
    organization: userData?.organization,
    secondary_email: userData?.secondary_email,
    x_user: userData?.x_user,
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
      primary_email: profile.primary_email,
      organization: profile.organization,
      secondary_email: profile.secondary_email,
      x_user: profile.x_user,
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
      first_name: editForm.first_name,
      last_name: editForm.last_name,
      primary_email: editForm.primary_email,
      organization: editForm.organization,
      secondary_email: editForm.secondary_email,
      x_user: editForm.x_user,
      telegram: editForm.telegram,
      gender: editForm.gender,
      role: editForm.role,
      picture_url: editForm.picture_url,
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
      organization: userData.organization,
      secondary_email: userData.secondary_email,
      x_user: userData.x_user,
      telegram: userData.telegram,
      gender: userData.gender,
      role: userData.role,
      picture_url: userData.picture_url,
    })
    setIsEditing(false)
  }

  if(!isLoading && !profile) {
    return(
      <div className="flex-1 flex flex-col items-center justify-center h-full">
        <Card className="p-6 bg-white gap-2">
          <p className="text-gray-600 text-center">No profile data available.</p>
          <p className="text-gray-600 text-center">Please contact support if you believe this is an error.</p>
          <p className="text-red-600 text-center">{error}</p>
        </Card>
      </div>
    )
  } 

  if(isLoading) {
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
          <HumanForm userData={userData} isEditing={isEditing} setIsEditing={setIsEditing} handleSave={handleSave} handleCancel={handleCancel} editForm={editForm} setEditForm={setEditForm} />

          {/* Stats Cards */}
          <StatsCards userData={userData} />

          <MergeEmails />

          <ReferralLinks referralCount={userData?.referral_count ?? 0} />

          {/* Events History */}
          <PopupsHistory popups={userData?.popups ?? []} />
          
          <ProfileStats userData={userData} />

        </div>
      </div>
    </div>
  )
}
