"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import Navbar from "@/components/navbar"
import { useAuth } from "@/components/auth-provider"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Calendar, Clock, Bookmark, BookmarkX } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface SavedBlog {
  id: string
  title: string
  content: string
  author: {
    id: string
    name: string
    profilePicture?: string
  }
  createdAt: string
  tags?: string[]
  readTime?: number
}

export default function SavedBlogsPage() {
  const { user } = useAuth()
  const router = useRouter()
  const { toast } = useToast()
  const [savedBlogs, setSavedBlogs] = useState<SavedBlog[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) {
      router.push("/login")
      return
    }
    // Only run on client
    const fetchSavedBlogs = async () => {
      try {
        const token = localStorage.getItem("token")
        const response = await fetch("http://localhost:5002/api/v1/blog/saved/all", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        if (response.ok) {
          const data = await response.json()
          // Map backend blogs to expected frontend structure
          const mappedBlogs = data.map((b: any) => ({
            id: b.id,
            title: b.title,
            content: b.blogcontent || b.content || "",
            createdAt: b.create_at || b.createdAt || "",
            tags: b.tags || [],
            readTime: b.readTime,
            author: {
              id: b.author || b.userid || "",
              name: b.username || b.author_name || "Unknown",
              profilePicture: "/placeholder.svg", // or fetch if available
            }
          }))
          setSavedBlogs(mappedBlogs)
        }
      } catch (error) {
        console.error("Failed to fetch saved blogs:", error)
      } finally {
        setLoading(false)
      }
    }
    fetchSavedBlogs()
  }, [user, router])

  const handleUnsaveBlog = async (blogId: string) => {
    try {
      const token = localStorage.getItem("token")
      const response = await fetch(`http://localhost:5002/api/v1/save/${blogId}`, {
        method: "POST", // Assuming this toggles save/unsave
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        setSavedBlogs(savedBlogs.filter((blog) => blog.id !== blogId))
        toast({
          title: "Blog unsaved",
          description: "Blog removed from your saved list.",
        })
      }
    } catch (error) {
      console.error("Failed to unsave blog:", error)
      toast({
        title: "Error",
        description: "Failed to unsave blog. Please try again.",
        variant: "destructive",
      })
    }
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Saved Blogs</h1>
            <p className="text-gray-600">Your bookmarked articles for later reading</p>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <Card key={i} className="h-full animate-pulse">
                  <CardHeader className="pb-3">
                    <div className="flex items-center space-x-2 mb-3">
                      <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
                      <div className="flex-1">
                        <div className="h-3 bg-gray-200 rounded mb-1"></div>
                        <div className="h-2 bg-gray-200 rounded w-20"></div>
                      </div>
                    </div>
                    <div className="h-5 bg-gray-200 rounded mb-2"></div>
                    <div className="h-5 bg-gray-200 rounded w-3/4"></div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="space-y-2 mb-4">
                      <div className="h-3 bg-gray-200 rounded"></div>
                      <div className="h-3 bg-gray-200 rounded"></div>
                      <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : savedBlogs.length === 0 ? (
            <div className="text-center py-16">
              <Bookmark className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-medium text-gray-900 mb-2">No saved blogs yet</h3>
              <p className="text-gray-600 mb-6">Start saving interesting articles to read them later</p>
              <Link href="/">
                <Button>Explore Blogs</Button>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {savedBlogs.map((blog) => (
                <Card
                  key={blog.id}
                  className="h-full hover:shadow-lg transition-all duration-300 hover:-translate-y-1 group"
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-2">
                        <Avatar className="w-8 h-8">
                          <AvatarImage src={blog.author.profilePicture || "/placeholder.svg"} alt={blog.author.name} />
                          <AvatarFallback>{(blog.author?.name?.charAt(0) || "?").toUpperCase()}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">{blog.author.name}</p>
                          <div className="flex items-center text-xs text-gray-500 space-x-2">
                            <Calendar className="w-3 h-3" />
                            <span>{new Date(blog.createdAt).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.preventDefault()
                          handleUnsaveBlog(blog.id)
                        }}
                        className="opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <BookmarkX className="w-4 h-4 text-red-500" />
                      </Button>
                    </div>

                    <Link href={`/blog/${blog.id}`}>
                      <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-2 cursor-pointer">
                        {blog.title}
                      </h3>
                    </Link>
                  </CardHeader>

                  <CardContent className="pt-0">
                    <Link href={`/blog/${blog.id}`}>
                      <p className="text-gray-600 text-sm line-clamp-3 mb-4 cursor-pointer">
                        {blog.content.replace(/<[^>]*>/g, "").substring(0, 150)}...
                      </p>
                    </Link>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4 text-xs text-gray-500">
                        {blog.readTime && (
                          <div className="flex items-center space-x-1">
                            <Clock className="w-3 h-3" />
                            <span>{blog.readTime} min read</span>
                          </div>
                        )}
                      </div>

                      {blog.tags && blog.tags.length > 0 && (
                        <Badge variant="secondary" className="text-xs">
                          {blog.tags[0]}
                        </Badge>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
