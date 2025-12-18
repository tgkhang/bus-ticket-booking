'use client'

import { useState, useEffect, useRef } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { User, Mail, Phone, MapPin, CreditCard, Lock, Camera, Save, X, Edit2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { updateProfileAPI } from '@/lib/api'
import { toast } from 'sonner'
import Image from 'next/image'

interface ProfileFormData {
  displayName: string
  phoneNumber: string
  address: string
  bankAccount: string
}

interface PasswordFormData {
  currentPassword: string
  newPassword: string
  confirmPassword: string
}

export default function ProfilePage() {
  const { user, refreshUser } = useAuth()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [isChangingPassword, setIsChangingPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)
  const [avatarFile, setAvatarFile] = useState<File | null>(null)

  const [profileData, setProfileData] = useState<ProfileFormData>({
    displayName: '',
    phoneNumber: '',
    address: '',
    bankAccount: '',
  })

  const [passwordData, setPasswordData] = useState<PasswordFormData>({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  })

  useEffect(() => {
    if (user) {
      setProfileData({
        displayName: user.displayName || '',
        phoneNumber: user.phoneNumber || '',
        address: user.address || '',
        bankAccount: user.bankAccount || '',
      })
      if (user.avatar) {
        setAvatarPreview(user.avatar)
      }
    }
  }, [user])

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        toast.error('File size must be less than 10MB')
        return
      }
      if (!['image/jpeg', 'image/png', 'image/jpg'].includes(file.type)) {
        toast.error('Only JPG, JPEG, and PNG files are allowed')
        return
      }
      setAvatarFile(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleUpdateProfile = async () => {
    setLoading(true)
    try {
      const formData = new FormData()

      if (avatarFile) {
        formData.append('avatar', avatarFile)
      } else {
        // Only append text fields if not updating avatar
        formData.append('displayName', profileData.displayName)
        formData.append('phoneNumber', profileData.phoneNumber)
        formData.append('address', profileData.address)
        formData.append('bankAccount', profileData.bankAccount)
      }

      await updateProfileAPI(formData)
      await refreshUser()
      toast.success('Profile updated successfully!')
      setIsEditing(false)
      setAvatarFile(null)
    } catch (error) {
      const err = error as { response?: { data?: { message?: string } } }
      toast.error(err.response?.data?.message || 'Failed to update profile')
    } finally {
      setLoading(false)
    }
  }

  const handleChangePassword = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('New passwords do not match')
      return
    }

    if (passwordData.newPassword.length < 8) {
      toast.error('Password must be at least 8 characters')
      return
    }

    setLoading(true)
    try {
      const formData = new FormData()
      formData.append('currentPassword', passwordData.currentPassword)
      formData.append('newPassword', passwordData.newPassword)

      await updateProfileAPI(formData)
      toast.success('Password changed successfully!')
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      })
      setIsChangingPassword(false)
    } catch (error) {
      const err = error as { response?: { data?: { message?: string } } }
      toast.error(err.response?.data?.message || 'Failed to change password')
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount)
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Profile Settings</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">Manage your account information</p>
        </div>

        {/* Avatar Section */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <Camera className="w-5 h-5" />
            Profile Picture
          </h2>
          <div className="flex items-center gap-6">
            <div className="relative">
              <div className="w-32 h-32 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                {avatarPreview ? (
                  <Image
                    src={avatarPreview}
                    alt="Profile"
                    width={128}
                    height={128}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <User className="w-16 h-16 text-gray-400" />
                )}
              </div>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="absolute bottom-0 right-0 bg-blue-600 hover:bg-blue-700 text-white rounded-full p-2 shadow-lg transition-colors"
              >
                <Camera className="w-4 h-4" />
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/jpg"
                onChange={handleAvatarChange}
                className="hidden"
              />
            </div>
            <div>
              <p className="text-gray-900 dark:text-white font-medium mb-1">Change your profile picture</p>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                JPG, JPEG or PNG. Max size 10MB.
              </p>
              {avatarFile && (
                <div className="flex gap-2">
                  <Button
                    onClick={handleUpdateProfile}
                    disabled={loading}
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    {loading ? 'Uploading...' : 'Upload Avatar'}
                  </Button>
                  <Button
                    onClick={() => {
                      setAvatarFile(null)
                      setAvatarPreview(user.avatar || null)
                    }}
                    variant="outline"
                  >
                    Cancel
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Account Information */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <User className="w-5 h-5" />
              Account Information
            </h2>
            {!isEditing && (
              <Button
                onClick={() => setIsEditing(true)}
                variant="outline"
                className="flex items-center gap-2"
              >
                <Edit2 className="w-4 h-4" />
                Edit Profile
              </Button>
            )}
          </div>

          <div className="space-y-4">
            {/* Email (Read-only) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Email
              </label>
              <div className="flex items-center gap-2 px-4 py-3 bg-gray-100 dark:bg-gray-700 rounded-md">
                <Mail className="w-5 h-5 text-gray-400" />
                <span className="text-gray-900 dark:text-white">{user.email}</span>
              </div>
            </div>

            {/* Username (Read-only) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Username
              </label>
              <div className="flex items-center gap-2 px-4 py-3 bg-gray-100 dark:bg-gray-700 rounded-md">
                <User className="w-5 h-5 text-gray-400" />
                <span className="text-gray-900 dark:text-white">{user.username}</span>
              </div>
            </div>

            {/* Display Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Display Name
              </label>
              <div className="flex items-center gap-2 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800">
                <User className="w-5 h-5 text-gray-400" />
                {isEditing ? (
                  <input
                    type="text"
                    value={profileData.displayName}
                    onChange={(e) =>
                      setProfileData({ ...profileData, displayName: e.target.value })
                    }
                    className="flex-1 bg-transparent outline-none text-gray-900 dark:text-white"
                  />
                ) : (
                  <span className="text-gray-900 dark:text-white">
                    {user.displayName || 'Not set'}
                  </span>
                )}
              </div>
            </div>

            {/* Phone Number */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Phone Number
              </label>
              <div className="flex items-center gap-2 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800">
                <Phone className="w-5 h-5 text-gray-400" />
                {isEditing ? (
                  <input
                    type="tel"
                    value={profileData.phoneNumber}
                    onChange={(e) =>
                      setProfileData({ ...profileData, phoneNumber: e.target.value })
                    }
                    placeholder="+84 123 456 789"
                    className="flex-1 bg-transparent outline-none text-gray-900 dark:text-white"
                  />
                ) : (
                  <span className="text-gray-900 dark:text-white">
                    {user.phoneNumber || 'Not set'}
                  </span>
                )}
              </div>
            </div>

            {/* Address */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Address
              </label>
              <div className="flex items-start gap-2 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800">
                <MapPin className="w-5 h-5 text-gray-400 mt-0.5" />
                {isEditing ? (
                  <textarea
                    value={profileData.address}
                    onChange={(e) =>
                      setProfileData({ ...profileData, address: e.target.value })
                    }
                    placeholder="Enter your address"
                    rows={2}
                    className="flex-1 bg-transparent outline-none text-gray-900 dark:text-white resize-none"
                  />
                ) : (
                  <span className="text-gray-900 dark:text-white">
                    {user.address || 'Not set'}
                  </span>
                )}
              </div>
            </div>

            {/* Bank Account */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Bank Account (for refunds)
              </label>
              <div className="flex items-center gap-2 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800">
                <CreditCard className="w-5 h-5 text-gray-400" />
                {isEditing ? (
                  <input
                    type="text"
                    value={profileData.bankAccount}
                    onChange={(e) =>
                      setProfileData({ ...profileData, bankAccount: e.target.value })
                    }
                    placeholder="Enter bank account number"
                    className="flex-1 bg-transparent outline-none text-gray-900 dark:text-white"
                  />
                ) : (
                  <span className="text-gray-900 dark:text-white">
                    {user.bankAccount || 'Not set'}
                  </span>
                )}
              </div>
            </div>

            {/* Account Balance */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Account Balance
              </label>
              <div className="flex items-center gap-2 px-4 py-3 bg-gray-100 dark:bg-gray-700 rounded-md">
                <CreditCard className="w-5 h-5 text-gray-400" />
                <span className="text-gray-900 dark:text-white font-semibold">
                  {formatCurrency(parseFloat(user.accountBalance || '0'))}
                </span>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Available balance for refunds and future bookings
              </p>
            </div>

            {isEditing && (
              <div className="flex gap-3 pt-4">
                <Button
                  onClick={handleUpdateProfile}
                  disabled={loading}
                  className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  {loading ? 'Saving...' : 'Save Changes'}
                </Button>
                <Button
                  onClick={() => {
                    setIsEditing(false)
                    setProfileData({
                      displayName: user.displayName || '',
                      phoneNumber: user.phoneNumber || '',
                      address: user.address || '',
                      bankAccount: user.bankAccount || '',
                    })
                  }}
                  variant="outline"
                >
                  <X className="w-4 h-4 mr-2" />
                  Cancel
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Password Section */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <Lock className="w-5 h-5" />
              Password & Security
            </h2>
            {!isChangingPassword && (
              <Button
                onClick={() => setIsChangingPassword(true)}
                variant="outline"
                className="flex items-center gap-2"
              >
                <Edit2 className="w-4 h-4" />
                Change Password
              </Button>
            )}
          </div>

          {isChangingPassword ? (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Current Password
                </label>
                <input
                  type="password"
                  value={passwordData.currentPassword}
                  onChange={(e) =>
                    setPasswordData({ ...passwordData, currentPassword: e.target.value })
                  }
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white bg-white dark:bg-gray-700"
                  placeholder="Enter current password"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  New Password
                </label>
                <input
                  type="password"
                  value={passwordData.newPassword}
                  onChange={(e) =>
                    setPasswordData({ ...passwordData, newPassword: e.target.value })
                  }
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white bg-white dark:bg-gray-700"
                  placeholder="Enter new password (min 8 characters)"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  value={passwordData.confirmPassword}
                  onChange={(e) =>
                    setPasswordData({ ...passwordData, confirmPassword: e.target.value })
                  }
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white bg-white dark:bg-gray-700"
                  placeholder="Confirm new password"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  onClick={handleChangePassword}
                  disabled={loading}
                  className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  {loading ? 'Changing...' : 'Change Password'}
                </Button>
                <Button
                  onClick={() => {
                    setIsChangingPassword(false)
                    setPasswordData({
                      currentPassword: '',
                      newPassword: '',
                      confirmPassword: '',
                    })
                  }}
                  variant="outline"
                >
                  <X className="w-4 h-4 mr-2" />
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <p className="text-gray-600 dark:text-gray-400">
              Keep your account secure by using a strong password
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
