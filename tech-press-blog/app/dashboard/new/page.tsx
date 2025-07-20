"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import Navbar from "@/components/navbar"
import { useAuth } from "@/components/auth-provider"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { ArrowLeft, Save, Eye } from "lucide-react"
import { useRef } from "react"

export default function NewBlogPage() {
  const { user } = useAuth()
  const router = useRouter()
  const { toast } = useToast()
  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  const [tags, setTags] = useState("")
  const [loading, setLoading] = useState(false)
  const [preview, setPreview] = useState(false)
  const [image, setImage] = useState<File | null>(null)
  const [description, setDescription] = useState("")
  const [category, setCategory] = useState("")
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    setLoading(true)

    try {
      const token = localStorage.getItem("token")
      const formData = new FormData()
      formData.append("title", title)
      formData.append("description", description)
      formData.append("blogcontent", content)
      formData.append("tags", tags)
      formData.append("category", category)
      if (image) {
        formData.append("file", image)
      }
      const response = await fetch("http://localhost:5001/api/v1/blog/new", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      })

      if (response.ok) {
        toast({
          title: "Blog created",
          description: "Your blog has been created successfully.",
        })
        router.push("/dashboard")
      } else {
        toast({
          title: "Error",
          description: "Failed to create blog. Please try again.",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Failed to create blog:", error)
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  if (!user) {
    router.push("/login")
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center space-x-4">
              <Link href="/dashboard" className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to dashboard
              </Link>
              <h1 className="text-3xl font-bold text-gray-900">Create New Blog</h1>
            </div>

            <div className="flex items-center space-x-2">
              <Button variant="outline" onClick={() => setPreview(!preview)}>
                <Eye className="w-4 h-4 mr-2" />
                {preview ? "Edit" : "Preview"}
              </Button>
            </div>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>{preview ? "Preview" : "Write Your Blog"}</CardTitle>
            </CardHeader>
            <CardContent>
              {preview ? (
                <div className="space-y-6">
                  <div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-4">{title || "Untitled"}</h1>
                    <div className="flex items-center space-x-2 text-sm text-gray-500 mb-6">
                      <span>By {user.name}</span>
                      <span>•</span>
                      <span>{new Date().toLocaleDateString()}</span>
                    </div>
                  </div>
                  <div
                    className="prose prose-lg max-w-none"
                    dangerouslySetInnerHTML={{ __html: content.replace(/\n/g, "<br>") }}
                  />
                  {tags && (
                    <div className="flex flex-wrap gap-2 pt-4 border-t">
                      {tags.split(",").map((tag, index) => (
                        <span key={index} className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                          {tag.trim()}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="title">Title</Label>
                    <Input
                      id="title"
                      placeholder="Enter your blog title..."
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      required
                      className="text-lg"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Input
                      id="description"
                      placeholder="Enter a short description..."
                      value={description}
                      onChange={e => setDescription(e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="content">Content</Label>
                    <Textarea
                      id="content"
                      placeholder="Write your blog content here..."
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
                      required
                      rows={20}
                      className="resize-none"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="tags">Tags (comma-separated)</Label>
                    <Input
                      id="tags"
                      placeholder="e.g., technology, programming, web development"
                      value={tags}
                      onChange={(e) => setTags(e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="category">Category</Label>
                    <select
                      id="category"
                      value={category}
                      onChange={e => setCategory(e.target.value)}
                      required
                      className="w-full border rounded px-3 py-2"
                    >
                      <option value="">Select a category</option>
                      <option value="Technology">Technology</option>
                      <option value="Health">Health</option>
                      <option value="Finance">Finance</option>
                      <option value="Travel">Travel</option>
                      <option value="Education">Education</option>
                      <option value="Entertainment">Entertainment</option>
                      <option value="Study">Study</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="image">Image (optional)</Label>
                    <Input
                      id="image"
                      type="file"
                      accept="image/*"
                      ref={fileInputRef}
                      onChange={e => setImage(e.target.files?.[0] || null)}
                    />
                  </div>

                  <div className="flex justify-end space-x-4">
                    <Link href="/dashboard">
                      <Button variant="outline">Cancel</Button>
                    </Link>
                    <Button type="submit" disabled={loading || !title.trim() || !content.trim()}>
                      <Save className="w-4 h-4 mr-2" />
                      {loading ? "Publishing..." : "Publish Blog"}
                    </Button>
                  </div>
                </form>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
