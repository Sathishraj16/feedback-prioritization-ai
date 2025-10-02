"use client"

import { useState } from "react"
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Upload, Send, CheckCircle2, AlertCircle, FileText } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { useToast } from "@/hooks/use-toast"
import { Toaster } from "@/components/ui/sonner"
import { toast } from "sonner"

interface SubmittedFeedback {
  id: number
  title: string
  clusterId: number | null
  clusterName: string | null
}

export default function SubmitPage() {
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [customerName, setCustomerName] = useState("")
  const [customerEmail, setCustomerEmail] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submittedFeedback, setSubmittedFeedback] = useState<SubmittedFeedback | null>(null)
  
  const [csvFile, setCsvFile] = useState<File | null>(null)
  const [isUploadingCsv, setIsUploadingCsv] = useState(false)
  const [uploadResult, setUploadResult] = useState<{ success: number; failed: number } | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setSubmittedFeedback(null)

    try {
      const res = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          description,
          source: 'form',
          customerName: customerName || null,
          customerEmail: customerEmail || null,
        }),
      })

      if (!res.ok) throw new Error('Failed to submit feedback')

      const data = await res.json()
      
      // Simulate clustering assignment (in production, this would be done by AI)
      const clusterId = Math.floor(Math.random() * 18) + 1
      await fetch(`/api/feedback?id=${data.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ clusterId }),
      })

      // Fetch cluster name
      const clusterRes = await fetch(`/api/clusters?id=${clusterId}`)
      const clusterData = await clusterRes.json()

      setSubmittedFeedback({
        id: data.id,
        title: data.title,
        clusterId,
        clusterName: clusterData.name,
      })

      toast.success('Feedback submitted successfully!')
      
      // Reset form
      setTitle("")
      setDescription("")
      setCustomerName("")
      setCustomerEmail("")
    } catch (error) {
      console.error('Error submitting feedback:', error)
      toast.error('Failed to submit feedback')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCsvUpload = async () => {
    if (!csvFile) return

    setIsUploadingCsv(true)
    setUploadResult(null)

    try {
      const text = await csvFile.text()
      const lines = text.split('\n').filter(line => line.trim())
      
      // Skip header row
      const dataLines = lines.slice(1)
      
      let successCount = 0
      let failedCount = 0

      for (const line of dataLines) {
        const [title, description, customerName, customerEmail] = line.split(',').map(s => s.trim())
        
        if (!title || !description) {
          failedCount++
          continue
        }

        try {
          const res = await fetch('/api/feedback', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              title,
              description,
              source: 'csv',
              customerName: customerName || null,
              customerEmail: customerEmail || null,
              clusterId: Math.floor(Math.random() * 18) + 1, // Auto-cluster
            }),
          })

          if (res.ok) {
            successCount++
          } else {
            failedCount++
          }
        } catch {
          failedCount++
        }
      }

      setUploadResult({ success: successCount, failed: failedCount })
      toast.success(`Uploaded ${successCount} feedback items successfully!`)
      setCsvFile(null)
    } catch (error) {
      console.error('Error uploading CSV:', error)
      toast.error('Failed to upload CSV file')
    } finally {
      setIsUploadingCsv(false)
    }
  }

  return (
    <SidebarProvider>
      <AppSidebar />
      <main className="flex-1 overflow-auto">
        <div className="container mx-auto p-6 max-w-4xl space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Submit Feedback</h1>
              <p className="text-muted-foreground mt-1">
                Share your ideas, bugs, or feature requests with our team
              </p>
            </div>
            <SidebarTrigger className="lg:hidden" />
          </div>

          {/* Success Message */}
          <AnimatePresence>
            {submittedFeedback && (
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <Card className="border-green-500 bg-green-50 dark:bg-green-950">
                  <CardContent className="pt-6">
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5" />
                      <div className="flex-1">
                        <p className="font-semibold text-green-900 dark:text-green-100">
                          Feedback Submitted Successfully!
                        </p>
                        <p className="text-sm text-green-700 dark:text-green-300 mt-1">
                          Your feedback "{submittedFeedback.title}" has been automatically categorized into{" "}
                          <Badge variant="outline" className="ml-1">
                            {submittedFeedback.clusterName}
                          </Badge>
                        </p>
                        <p className="text-xs text-green-600 dark:text-green-400 mt-2">
                          ID: {submittedFeedback.id} • Our AI agents will analyze and prioritize your feedback shortly
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Main Form */}
          <Tabs defaultValue="form" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="form">
                <Send className="h-4 w-4 mr-2" />
                Manual Entry
              </TabsTrigger>
              <TabsTrigger value="csv">
                <Upload className="h-4 w-4 mr-2" />
                CSV Upload
              </TabsTrigger>
            </TabsList>

            <TabsContent value="form" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Submit New Feedback</CardTitle>
                  <CardDescription>
                    Fill out the form below to submit your feedback. All fields marked with * are required.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-2">
                      <Label htmlFor="title">Title *</Label>
                      <Input
                        id="title"
                        placeholder="Brief summary of your feedback"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        required
                        maxLength={200}
                      />
                      <p className="text-xs text-muted-foreground">
                        {title.length}/200 characters
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="description">Description *</Label>
                      <Textarea
                        id="description"
                        placeholder="Provide detailed information about your feedback..."
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        required
                        rows={6}
                        maxLength={2000}
                      />
                      <p className="text-xs text-muted-foreground">
                        {description.length}/2000 characters
                      </p>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="customerName">Your Name (Optional)</Label>
                        <Input
                          id="customerName"
                          placeholder="John Doe"
                          value={customerName}
                          onChange={(e) => setCustomerName(e.target.value)}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="customerEmail">Your Email (Optional)</Label>
                        <Input
                          id="customerEmail"
                          type="email"
                          placeholder="john@example.com"
                          value={customerEmail}
                          onChange={(e) => setCustomerEmail(e.target.value)}
                        />
                      </div>
                    </div>

                    <Button 
                      type="submit" 
                      className="w-full" 
                      size="lg"
                      disabled={isSubmitting || !title.trim() || !description.trim()}
                    >
                      {isSubmitting ? (
                        <>
                          <span className="mr-2">Submitting...</span>
                          <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                        </>
                      ) : (
                        <>
                          <Send className="mr-2 h-4 w-4" />
                          Submit Feedback
                        </>
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="csv" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Bulk Upload via CSV</CardTitle>
                  <CardDescription>
                    Upload a CSV file with multiple feedback entries. Each row will be automatically categorized.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="border-2 border-dashed rounded-lg p-8 text-center">
                    <Upload className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                    
                    {csvFile ? (
                      <div className="space-y-4">
                        <div className="flex items-center justify-center gap-2">
                          <FileText className="h-5 w-5 text-primary" />
                          <span className="font-medium">{csvFile.name}</span>
                          <Badge variant="secondary">{(csvFile.size / 1024).toFixed(1)} KB</Badge>
                        </div>
                        <div className="flex gap-2 justify-center">
                          <Button
                            variant="outline"
                            onClick={() => setCsvFile(null)}
                            disabled={isUploadingCsv}
                          >
                            Remove
                          </Button>
                          <Button
                            onClick={handleCsvUpload}
                            disabled={isUploadingCsv}
                          >
                            {isUploadingCsv ? "Uploading..." : "Upload & Process"}
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <p className="text-sm text-muted-foreground mb-4">
                          Drop your CSV file here, or click to browse
                        </p>
                        <Input
                          type="file"
                          accept=".csv"
                          onChange={(e) => {
                            const file = e.target.files?.[0]
                            if (file) setCsvFile(file)
                          }}
                          className="max-w-xs mx-auto"
                        />
                      </>
                    )}
                  </div>

                  {uploadResult && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                    >
                      <Card className="bg-muted">
                        <CardContent className="pt-6">
                          <h3 className="font-semibold mb-3">Upload Results</h3>
                          <div className="space-y-2 text-sm">
                            <div className="flex items-center justify-between">
                              <span className="text-muted-foreground">Successfully uploaded:</span>
                              <Badge variant="default" className="bg-green-600">
                                {uploadResult.success} items
                              </Badge>
                            </div>
                            {uploadResult.failed > 0 && (
                              <div className="flex items-center justify-between">
                                <span className="text-muted-foreground">Failed:</span>
                                <Badge variant="destructive">
                                  {uploadResult.failed} items
                                </Badge>
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  )}

                  <Card className="bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-900">
                    <CardContent className="pt-6">
                      <div className="flex items-start gap-3">
                        <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5 shrink-0" />
                        <div className="text-sm space-y-2">
                          <p className="font-semibold text-blue-900 dark:text-blue-100">
                            CSV Format Requirements:
                          </p>
                          <ul className="list-disc list-inside text-blue-700 dark:text-blue-300 space-y-1">
                            <li>First row should be headers: title,description,customerName,customerEmail</li>
                            <li>Title and description are required for each row</li>
                            <li>Customer name and email are optional</li>
                            <li>All feedback will be automatically categorized by AI</li>
                          </ul>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
      <Toaster />
    </SidebarProvider>
  )
}