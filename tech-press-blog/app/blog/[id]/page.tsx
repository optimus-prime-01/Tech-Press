"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import Navbar from "@/components/navbar"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { useAuth } from "@/components/auth-provider"
import { useToast } from "@/hooks/use-toast"
import { ArrowLeft, Calendar, Clock, Bookmark, MessageCircle, Share2 } from "lucide-react"
import clsx from "clsx"

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
  image?: string
}

interface Comment {
  id: string
  content: string
  author: {
    id: string
    name: string
    profilePicture?: string
  }
  createdAt: string
  parentId?: string | null
}

export default function BlogDetailPage() {
  const params = useParams()
  const { user } = useAuth()
  const { toast } = useToast()
  const [blog, setBlog] = useState<Blog | null>(null)
  const [comments, setComments] = useState<Comment[]>([])
  const [newComment, setNewComment] = useState("")
  const [loading, setLoading] = useState(true)
  const [isSaved, setIsSaved] = useState(false)
  const [isLiked, setIsLiked] = useState(false)
  const [replyingTo, setReplyingTo] = useState<string | null>(null)
  const [replyContent, setReplyContent] = useState("")
  // Share button state
  const [shareCopied, setShareCopied] = useState(false)

  useEffect(() => {
    if (params.id) {
      fetchBlog()
      fetchComments()
    }
  }, [params.id])

  const fetchBlog = async () => {
    try {
      const response = await fetch(`http://localhost:5002/api/v1/blog/${params.id}`)
      if (response.ok) {
        const data = await response.json()
        // Map backend blog response to expected frontend structure
        const mappedBlog = {
          id: data.id,
          title: data.title,
          content: data.blogcontent || data.content || "",
          createdAt: data.create_at || data.createdAt || "",
          tags: data.tags || [],
          readTime: data.readTime,
          image: data.image || "",
          author: {
            id: data.author || data.userid || "",
            name: data.username || data.author_name || "Unknown",
            profilePicture: "/placeholder.svg", // or fetch if available
          }
        }
        setBlog(mappedBlog)
      }
    } catch (error) {
      console.error("Failed to fetch blog:", error)
    } finally {
      setLoading(false)
    }
  }

  const fetchComments = async () => {
    try {
      const response = await fetch(`http://localhost:5002/api/v1/comment/${params.id}`)
      if (response.ok) {
        const data = await response.json()
        const mappedComments = data.map((c: any) => ({
          id: c.id,
          content: c.comment,
          createdAt: c.create_at,
          parentId: c.parentid || null,
          author: {
            id: c.userid,
            name: c.username,
            profilePicture: "/placeholder.svg", // or fetch if available
          }
        }))
        setComments(mappedComments)
      }
    } catch (error) {
      console.error("Failed to fetch comments:", error)
    }
  }

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user || !newComment.trim()) return

    try {
      const token = localStorage.getItem("token")
      const response = await fetch(`http://localhost:5002/api/v1/comment/${params.id}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ comment: newComment }),
      })

      if (response.ok) {
        setNewComment("")
        fetchComments()
        toast({
          title: "Comment added",
          description: "Your comment has been posted successfully.",
        })
      }
    } catch (error) {
      console.error("Failed to add comment:", error)
      toast({
        title: "Error",
        description: "Failed to add comment. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleReply = async (parentId: string) => {
    if (!user || !replyContent.trim()) return
    try {
      const token = localStorage.getItem("token")
      const response = await fetch(`http://localhost:5002/api/v1/comment/${params.id}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ comment: replyContent, parentId }),
      })
      if (response.ok) {
        setReplyContent("")
        setReplyingTo(null)
        fetchComments()
        toast({ title: "Reply added", description: "Your reply has been posted successfully." })
      }
    } catch (error) {
      toast({ title: "Error", description: "Failed to add reply.", variant: "destructive" })
    }
  }

  const handleSaveBlog = async () => {
    if (!user) return

    try {
      const token = localStorage.getItem("token")
      const response = await fetch(`http://localhost:5002/api/v1/save/${params.id}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        setIsSaved(!isSaved)
        toast({
          title: isSaved ? "Blog unsaved" : "Blog saved",
          description: isSaved ? "Blog removed from your saved list." : "Blog added to your saved list.",
        })
      }
    } catch (error) {
      console.error("Failed to save blog:", error)
    }
  }

  // Share handler
  const handleShare = async () => {
    if (typeof window !== 'undefined') {
      try {
        await navigator.clipboard.writeText(window.location.href)
        setShareCopied(true)
        setTimeout(() => setShareCopied(false), 1500)
      } catch {
        // fallback: select and copy
        const textArea = document.createElement('textarea')
        textArea.value = window.location.href
        document.body.appendChild(textArea)
        textArea.select()
        document.execCommand('copy')
        document.body.removeChild(textArea)
        setShareCopied(true)
        setTimeout(() => setShareCopied(false), 1500)
      }
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto animate-pulse">
            <div className="h-8 bg-gray-200 rounded mb-4 w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded mb-8 w-1/2"></div>
            <div className="space-y-4">
              <div className="h-4 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded w-2/3"></div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!blog) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Blog not found</h1>
            <Link href="/">
              <Button>Back to home</Button>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  // Only show all comments as flat list (no replies)
  const topLevelComments = comments.filter((c) => !c.parentId)

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <article className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-6">
            <Link href="/" className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to articles
            </Link>
          </div>

          <header className="mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-4 leading-tight">{blog.title}</h1>

            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-4">
                <Link href={`/profile/${blog.author.id}`}>
                  <Avatar className="w-12 h-12">
                    <AvatarImage src={blog.author.profilePicture || "/placeholder.svg"} alt={blog.author.name} />
                    <AvatarFallback>{(blog.author?.name?.charAt(0) || "?").toUpperCase()}</AvatarFallback>
                  </Avatar>
                </Link>
                <div>
                  <Link href={`/profile/${blog.author.id}`} className="font-medium text-gray-900 hover:text-blue-600">
                    {blog.author.name}
                  </Link>
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
                </div>
              </div>

              {user && (
                <div className="flex items-center space-x-2">
                  <Button variant="outline" size="sm" onClick={handleSaveBlog}>
                    <Bookmark className={`w-4 h-4 mr-2 ${isSaved ? "fill-current" : ""}`} />
                    {isSaved ? "Saved" : "Save"}
                  </Button>
                  <Button variant="outline" size="sm" onClick={handleShare}>
                    <Share2 className="w-4 h-4 mr-2" />
                    Share
                  </Button>
                  {shareCopied && (
                    <span className="text-green-600 text-xs ml-2">Link copied!</span>
                  )}
                </div>
              )}
            </div>
          </header>

          <div className="bg-white rounded-lg shadow-sm border p-8 mb-8">
            {blog.image && (
              <img src={blog.image} alt={blog.title} className="w-full h-64 object-cover rounded mb-6" />
            )}
            <div className="prose prose-lg max-w-none" dangerouslySetInnerHTML={{ __html: blog.content }} />
          </div>

          {/* Comments Section */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h3 className="text-xl font-semibold mb-6 flex items-center">
              <MessageCircle className="w-5 h-5 mr-2" />
              Comments ({comments.length})
            </h3>

            {user && (
              <form onSubmit={handleAddComment} className="mb-6">
                <Textarea
                  placeholder="Share your thoughts..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  className="mb-3"
                  rows={3}
                />
                <Button type="submit" disabled={!newComment.trim()}>
                  Post Comment
                </Button>
              </form>
            )}

            <div className="space-y-4">
              {topLevelComments.map((comment) => (
                <CommentCard
                  key={comment.id}
                  comment={comment}
                  replyingTo={replyingTo}
                  setReplyingTo={setReplyingTo}
                  replyContent={replyContent}
                  setReplyContent={setReplyContent}
                  handleReply={handleReply}
                  user={user}
                />
              ))}
              {comments.length === 0 && (
                <p className="text-center text-gray-500 py-8">No comments yet. Be the first to share your thoughts!</p>
              )}
            </div>
          </div>
        </div>
      </article>
    </div>
  )
}

// CommentCard component for rendering comments and replies
function CommentCard({ comment, replyingTo, setReplyingTo, replyContent, setReplyContent, handleReply, user }: {
  comment: Comment & { replies?: Comment[] }
  replyingTo: string | null
  setReplyingTo: (id: string | null) => void
  replyContent: string
  setReplyContent: (v: string) => void
  handleReply: (parentId: string) => void
  user: any
}) {
  return (
    <Card className="border-l-4 border-l-blue-500">
      <CardHeader className="pb-3">
        <div className="flex items-center space-x-3">
          <Avatar className="w-8 h-8">
            <AvatarImage
              src={comment.author?.profilePicture || "/placeholder.svg"}
              alt={comment.author?.name || ""}
            />
            <AvatarFallback>{(comment.author?.name?.charAt(0) || "?").toUpperCase()}</AvatarFallback>
          </Avatar>
          <div>
            <p className="font-medium text-sm">{comment.author?.name || "Unknown"}</p>
            <p className="text-xs text-gray-500">{new Date(comment.createdAt).toLocaleDateString()}</p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <p className="text-gray-700 mb-2">{comment.content}</p>
        {user && (
          <div className="mt-2">
            <Button
              variant="link"
              size="sm"
              className="px-0 text-blue-600"
              onClick={() => setReplyingTo(replyingTo === comment.id ? null : comment.id)}
            >
              {replyingTo === comment.id ? "Cancel" : "Reply"}
            </Button>
          </div>
        )}
        {replyingTo === comment.id && (
          <div className="flex items-start gap-2 mt-4">
            <Avatar className="w-8 h-8 mt-1">
              <AvatarImage src={user?.profilePicture || "/placeholder.svg"} alt={user?.name || ""} />
              <AvatarFallback>{(user?.name?.charAt(0) || "?").toUpperCase()}</AvatarFallback>
            </Avatar>
            <form
              onSubmit={e => {
                e.preventDefault();
                handleReply(comment.id)
              }}
              className={clsx(
                "flex-1 bg-gray-100 rounded-xl p-3 shadow-sm border border-gray-200",
                "flex flex-col"
              )}
            >
              <Textarea
                placeholder="Write your reply..."
                value={replyContent}
                onChange={e => setReplyContent(e.target.value)}
                rows={2}
                className="mb-2 resize-none bg-white rounded"
              />
              <div className="flex justify-end">
                <Button type="submit" size="sm" disabled={!replyContent.trim()}>
                  Send
                </Button>
              </div>
            </form>
          </div>
        )}
        {comment.replies && comment.replies.length > 0 && (
          <div className="pl-6 mt-4 space-y-2 border-l border-gray-200">
            {comment.replies.map(reply => (
              <CommentCard
                key={reply.id}
                comment={reply}
                replyingTo={replyingTo}
                setReplyingTo={setReplyingTo}
                replyContent={replyContent}
                setReplyContent={setReplyContent}
                handleReply={handleReply}
                user={user}
              />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
