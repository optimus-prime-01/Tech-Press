"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import Navbar from "@/components/navbar"
import { useAuth } from "@/components/auth-provider"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { Edit, Calendar, Clock, Mail, UserIcon, Camera } from "lucide-react"

interface UserProfile {
  id: string
  name: string
  email: string
  profilePicture?: string
  bio?: string
  joinedAt: string
}

interface UserBlog {
  id: string
  title: string
  content: string
  createdAt: string
  readTime?: number
  tags?: string[]
}

export default function ProfilePage() {
  const params = useParams()
  const { user } = useAuth()
  const { toast } = useToast()
  const [mounted, setMounted] = useState(false);
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [blogs, setBlogs] = useState<UserBlog[]>([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [editName, setEditName] = useState("")
  const [editBio, setEditBio] = useState("")

  useEffect(() => setMounted(true), []);

  const isOwnProfile = user?.id === params.id

  useEffect(() => {
    if (!params.id || params.id === "undefined") {
      setLoading(false)
      setProfile(null)
      return
    }
    fetchProfile()
    fetchUserBlogs()
  }, [params.id])

  const fetchProfile = async () => {
    try {
      const response = await fetch(`http://localhost:3000/api/v1/user/${params.id}`)
      if (response.ok) {
        const data = await response.json()
        const mappedProfile = {
          id: data._id,
          name: data.name,
          email: data.email,
          profilePicture: data.image && data.image.trim() !== "" ? data.image : "/placeholder.svg",
          bio: data.bio || "",
          joinedAt: data.createdAt || "",
        }
        setProfile(mappedProfile)
        setEditName(mappedProfile.name)
        setEditBio(mappedProfile.bio)
      }
    } catch (error) {
      console.error("Failed to fetch profile:", error)
    } finally {
      setLoading(false)
    }
  }

  const fetchUserBlogs = async () => {
    try {
      const response = await fetch("http://localhost:5002/api/v1/blog/all")
      if (response.ok) {
        const data = await response.json()
        const userBlogs = data.filter((blog: any) => blog.author.id === params.id)
        setBlogs(userBlogs)
      }
    } catch (error) {
      console.error("Failed to fetch user blogs:", error)
    }
  }

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!isOwnProfile) return

    try {
      const token = localStorage.getItem("token")
      const response = await fetch("http://localhost:3000/api/v1/user/update", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: editName,
          bio: editBio,
        }),
      })

      if (response.ok) {
        const data = await response.json()
        const mappedProfile = {
          id: data.user._id,
          name: data.user.name,
          email: data.user.email,
          profilePicture: data.user.image && data.user.image.trim() !== "" ? data.user.image : "/placeholder.svg",
          bio: data.user.bio || "",
          joinedAt: data.user.createdAt || "",
        }
        setProfile(mappedProfile)
        setEditing(false)
        toast({
          title: "Profile updated",
          description: "Your profile has been updated successfully.",
        })
      }
    } catch (error) {
      console.error("Failed to update profile:", error)
      toast({
        title: "Error",
        description: "Failed to update profile. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleProfilePictureUpdate = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !isOwnProfile) return

    const formData = new FormData()
    formData.append("file", file)

    try {
      const token = localStorage.getItem("token")
      const response = await fetch("http://localhost:3000/api/v1/user/update/pic", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      })

      if (response.ok) {
        const data = await response.json()
        const mappedProfile = {
          id: data.user._id,
          name: data.user.name,
          email: data.user.email,
          profilePicture: data.user.image && data.user.image.trim() !== "" ? data.user.image : "/placeholder.svg",
          bio: data.user.bio || "",
          joinedAt: data.user.createdAt || "",
        }
        setProfile(mappedProfile)
        toast({
          title: "Profile picture updated",
          description: "Your profile picture has been updated successfully.",
        })
      }
    } catch (error) {
      console.error("Failed to update profile picture:", error)
      toast({
        title: "Error",
        description: "Failed to update profile picture. Please try again.",
        variant: "destructive",
      })
    }
  }

  if (!mounted) return null;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto animate-pulse">
            <div className="bg-white rounded-lg shadow-sm border p-8 mb-8">
              <div className="flex items-center space-x-6">
                <div className="w-24 h-24 bg-gray-200 rounded-full"></div>
                <div className="flex-1">
                  <div className="h-6 bg-gray-200 rounded mb-2 w-1/3"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Profile not found</h1>
            <Link href="/">
              <Button>Back to home</Button>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Profile Header */}
          <Card className="mb-8">
            <CardContent className="p-8">
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-center space-x-6">
                  <div className="relative">
                    <Avatar className="w-24 h-24">
                      <AvatarImage src={profile.profilePicture || "/placeholder.svg"} alt={profile.name} />
                      <AvatarFallback className="text-2xl">{(profile.name?.charAt(0) || "?").toUpperCase()}</AvatarFallback>
                    </Avatar>
                    {isOwnProfile && (
                      <label className="absolute bottom-0 right-0 bg-blue-600 text-white p-2 rounded-full cursor-pointer hover:bg-blue-700 transition-colors">
                        <Camera className="w-4 h-4" />
                        <input type="file" accept="image/*" onChange={handleProfilePictureUpdate} className="hidden" />
                      </label>
                    )}
                  </div>

                  <div className="flex-1">
                    {editing ? (
                      <form onSubmit={handleUpdateProfile} className="space-y-4">
                        <div>
                          <Label htmlFor="name">Name</Label>
                          <Input
                            id="name"
                            value={editName}
                            onChange={(e) => setEditName(e.target.value)}
                            className="mt-1"
                          />
                        </div>
                        <div>
                          <Label htmlFor="bio">Bio</Label>
                          <Input
                            id="bio"
                            value={editBio}
                            onChange={(e) => setEditBio(e.target.value)}
                            placeholder="Tell us about yourself..."
                            className="mt-1"
                          />
                        </div>
                        <div className="flex space-x-2">
                          <Button type="submit" size="sm">
                            Save
                          </Button>
                          <Button type="button" variant="outline" size="sm" onClick={() => setEditing(false)}>
                            Cancel
                          </Button>
                        </div>
                      </form>
                    ) : (
                      <>
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">{profile.name}</h1>
                        {profile.bio && <p className="text-gray-600 mb-4">{profile.bio}</p>}
                        <div className="flex items-center space-x-4 text-sm text-gray-500">
                          <div className="flex items-center space-x-1">
                            <Mail className="w-4 h-4" />
                            <span>{profile.email}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Calendar className="w-4 h-4" />
                            <span>Joined {new Date(profile.joinedAt).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </div>

                {isOwnProfile && !editing && (
                  <Button variant="outline" onClick={() => setEditing(true)}>
                    <Edit className="w-4 h-4 mr-2" />
                    Edit Profile
                  </Button>
                )}
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-4 pt-6 border-t">
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">{blogs.length}</div>
                  <div className="text-sm text-gray-500">Articles</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">
                    {blogs.reduce((total, blog) => total + (blog.readTime || 5), 0)}
                  </div>
                  <div className="text-sm text-gray-500">Total Read Time</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">
                    {new Set(blogs.flatMap((blog) => blog.tags || [])).size}
                  </div>
                  <div className="text-sm text-gray-500">Topics</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* User's Blogs */}
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              {isOwnProfile ? "Your Articles" : `${profile.name}'s Articles`}
            </h2>
          </div>

          {blogs.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <UserIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {isOwnProfile ? "No articles yet" : "No articles published"}
                </h3>
                <p className="text-gray-600 mb-4">
                  {isOwnProfile ? "Start writing your first blog post" : "This user hasn't published any articles yet"}
                </p>
                {isOwnProfile && (
                  <Link href="/dashboard/new">
                    <Button>Write your first article</Button>
                  </Link>
                )}
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {blogs.map((blog) => (
                <Link key={blog.id} href={`/blog/${blog.id}`}>
                  <Card className="h-full hover:shadow-lg transition-all duration-300 hover:-translate-y-1 cursor-pointer group">
                    <CardHeader className="pb-3">
                      <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-2">
                        {blog.title}
                      </h3>
                      <div className="flex items-center text-sm text-gray-500 space-x-4">
                        <div className="flex items-center space-x-1">
                          <Calendar className="w-4 h-4" />
                          <span>{new Date(blog.createdAt).toLocaleDateString()}</span>
                        </div>
                        {blog.readTime && (
                          <div className="flex items-center space-x-1">
                            <Clock className="w-4 h-4" />
                            <span>{blog.readTime} min read</span>
                          </div>
                        )}
                      </div>
                    </CardHeader>

                    <CardContent className="pt-0">
                      <p className="text-gray-600 text-sm line-clamp-3 mb-4">
                        {blog.content.replace(/<[^>]*>/g, "").substring(0, 150)}...
                      </p>

                      {blog.tags && blog.tags.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {blog.tags.slice(0, 3).map((tag, index) => (
                            <Badge key={index} variant="secondary" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                          {blog.tags.length > 3 && (
                            <Badge variant="outline" className="text-xs">
                              +{blog.tags.length - 3} more
                            </Badge>
                          )}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
