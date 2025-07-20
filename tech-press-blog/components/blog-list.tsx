"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Calendar, Clock, Eye } from "lucide-react"

interface Blog {
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
  views?: number
}

interface User {
  id: string
  name: string
  profilePicture?: string
}

export default function BlogList() {
  const [blogs, setBlogs] = useState<Blog[]>([])
  const [loading, setLoading] = useState(true)
  const [userCache, setUserCache] = useState<{ [id: string]: User }>({})

  useEffect(() => {
    fetchBlogs()
  }, [])

  const fetchUser = async (userId: string) => {
    if (userCache[userId]) return userCache[userId]
    try {
      const res = await fetch(`http://localhost:5001/api/v1/user1/${userId}`)
      if (res.ok) {
        const data = await res.json()
        const user = {
          id: data._id || data.id || userId,
          name: data.name || data.username || "Unknown",
          profilePicture: data.image || data.profilePicture || data.avatar || "/placeholder.svg",
        }
        setUserCache((prev) => ({ ...prev, [userId]: user }))
        return user
      }
    } catch {}
    return { id: userId, name: "Unknown", profilePicture: "/placeholder.svg" }
  }

  const fetchBlogs = async () => {
    try {
      const response = await fetch("http://localhost:5002/api/v1/blog/all")
      if (response.ok) {
        const data = await response.json()
        // Map backend blogs to expected frontend structure, fetch author info
        const mappedBlogs = await Promise.all(
          data.map(async (b: any) => {
            const authorId = b.author || b.userid || ""
            let author: User = { id: authorId, name: "Unknown", profilePicture: "/placeholder.svg" }
            if (authorId) {
              author = await fetchUser(authorId)
            }
            return {
              id: b.id,
              title: b.title,
              content: b.blogcontent || b.content || "",
              createdAt: b.create_at || b.createdAt || "",
              tags: b.tags || [],
              readTime: b.readTime,
              views: b.views,
              author,
            }
          })
        )
        setBlogs(mappedBlogs)
      }
    } catch (error) {
      console.error("Failed to fetch blogs:", error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <BlogListSkeleton />
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {blogs.map((blog) => (
        <Link key={blog.id} href={`/blog/${blog.id}`}>
          <Card className="h-full hover:shadow-lg transition-all duration-300 hover:-translate-y-1 cursor-pointer group flex flex-col justify-between">
            <CardHeader className="pb-3">
              <div className="flex items-center space-x-2 mb-3">
                <Avatar className="w-8 h-8">
                  <AvatarImage src={blog.author.profilePicture || "/placeholder.svg"} alt={blog.author.name} />
                  <AvatarFallback>{(blog.author?.name?.charAt(0) || "?").toUpperCase()}</AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{blog.author.name}</p>
                  <div className="flex items-center text-xs text-gray-500 space-x-2">
                    <Calendar className="w-3 h-3" />
                    <span>{blog.createdAt ? new Date(blog.createdAt).toLocaleDateString() : "Unknown date"}</span>
                  </div>
                </div>
              </div>

              <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-2">
                {blog.title}
              </h3>
            </CardHeader>

            <CardContent className="pt-0 flex flex-col flex-1 justify-between">
              <p className="text-gray-600 text-sm line-clamp-3 mb-4">
                {(blog.content || "").replace(/<[^>]*>/g, "").substring(0, 150)}...
              </p>

              <div className="flex items-center justify-between mt-auto">
                <div className="flex items-center space-x-4 text-xs text-gray-500">
                  {blog.readTime && (
                    <div className="flex items-center space-x-1">
                      <Clock className="w-3 h-3" />
                      <span>{blog.readTime} min read</span>
                    </div>
                  )}
                  {blog.views && (
                    <div className="flex items-center space-x-1">
                      <Eye className="w-3 h-3" />
                      <span>{blog.views}</span>
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
        </Link>
      ))}
    </div>
  )
}

function BlogListSkeleton() {
  return (
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
            <div className="flex justify-between">
              <div className="h-3 bg-gray-200 rounded w-20"></div>
              <div className="h-5 bg-gray-200 rounded w-12"></div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
