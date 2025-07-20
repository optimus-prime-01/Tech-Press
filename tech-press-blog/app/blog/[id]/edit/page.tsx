"use client"

import { useEffect, useState, useRef } from "react"
import { useParams, useRouter } from "next/navigation"
import Navbar from "@/components/navbar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"

export default function EditBlogPage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [content, setContent] = useState("")
  const [category, setCategory] = useState("")
  const [tags, setTags] = useState("")
  const [image, setImage] = useState<File | null>(null)
  const [existingImage, setExistingImage] = useState("")
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (params.id) {
      fetchBlog()
    }
  }, [params.id])

  const fetchBlog = async () => {
    setLoading(true)
    try {
      const response = await fetch(`http://localhost:5002/api/v1/blog/${params.id}`)
      if (response.ok) {
        const data = await response.json()
        setTitle(data.title)
        setDescription(data.description || "")
        setContent(data.blogcontent || data.content || "")
        setCategory(data.category || "")
        setTags((data.tags || []).join(", "))
        setExistingImage(data.image || "")
      }
    } catch (error) {
      toast({ title: "Error", description: "Failed to fetch blog.", variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      const token = localStorage.getItem("token")
      const formData = new FormData()
      formData.append("title", title)
      formData.append("description", description)
      formData.append("blogcontent", content)
      formData.append("category", category)
      formData.append("tags", tags)
      if (image) {
        formData.append("file", image)
      }
      const response = await fetch(`http://localhost:5001/api/v1/blog/${params.id}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      })
      if (response.ok) {
        toast({ title: "Blog updated", description: "Your blog has been updated successfully." })
        router.push(`/blog/${params.id}`)
      } else {
        toast({ title: "Error", description: "Failed to update blog.", variant: "destructive" })
      }
    } catch (error) {
      toast({ title: "Error", description: "An unexpected error occurred.", variant: "destructive" })
    } finally {
      setSubmitting(false)
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

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle>Edit Blog</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    placeholder="Enter your blog title..."
                    value={title}
                    onChange={e => setTitle(e.target.value)}
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
                    onChange={e => setContent(e.target.value)}
                    required
                    rows={20}
                    className="resize-none"
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
                  <Label htmlFor="tags">Tags (comma-separated)</Label>
                  <Input
                    id="tags"
                    placeholder="e.g., technology, programming, web development"
                    value={tags}
                    onChange={e => setTags(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="image">Image (optional)</Label>
                  {existingImage && !image && (
                    <img src={existingImage} alt="Current" className="w-40 h-40 object-cover rounded mb-2" />
                  )}
                  <Input
                    id="image"
                    type="file"
                    accept="image/*"
                    ref={fileInputRef}
                    onChange={e => setImage(e.target.files?.[0] || null)}
                  />
                </div>
                <div className="flex justify-end space-x-4">
                  <Button type="button" variant="outline" onClick={() => router.back()}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={submitting || !title.trim() || !content.trim()}>
                    {submitting ? "Updating..." : "Update Blog"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
} 