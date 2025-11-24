"use client"

import { useState } from "react"
import { WorkCard } from "./work-card"
import { works } from "@/lib/mock-data"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { GitFork, Wallet, Folder } from "lucide-react"
import { UploadView } from "./upload-view"
import type { UserProfile } from "./app-container"

export function CollectionsView() {
  const [remixModalOpen, setRemixModalOpen] = useState(false)
  const [uploadModalOpen, setUploadModalOpen] = useState(false)
  const [newFolderModalOpen, setNewFolderModalOpen] = useState(false)
  const [selectedWork, setSelectedWork] = useState<any>(null)

  // Mocked collected works with statuses
  const [collectedWorks, setCollectedWorks] = useState(
    works.slice(0, 4).map((w, i) => ({
      ...w,
      collectionStatus: i === 3 ? "pending" : i === 2 ? "approved" : i === 1 ? "rejected" : "none",
      savedAt: w.savedAt || "2024-01-01 12:00",
    })),
  )

  const handleRemixClick = (work: any) => {
    if (work.collectionStatus === "approved") {
      setUploadModalOpen(true)
    } else {
      setSelectedWork(work)
      setRemixModalOpen(true)
    }
  }

  const handleApplySuccess = () => {
    setRemixModalOpen(false)
    setCollectedWorks(collectedWorks.map((w) => (w.id === selectedWork.id ? { ...w, collectionStatus: "pending" } : w)))
  }

  const handleUnsave = (id: number) => {
    setCollectedWorks(collectedWorks.filter((w) => w.id !== id))
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h2 className="text-3xl font-bold tracking-tight">My Collections</h2>
          <p className="text-muted-foreground text-sm">Works you've saved for inspiration or remixing.</p>
        </div>
        <Button variant="outline" className="gap-2 bg-transparent" onClick={() => setNewFolderModalOpen(true)}>
          <Folder className="w-4 h-4" />
          New Folder
        </Button>
      </div>

      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Folder className="w-4 h-4 text-primary" /> Inspiration
          </h3>
          <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {collectedWorks.slice(0, 2).map((work) => (
              <WorkCard
                key={work.id}
                work={work}
                isRemixable={true}
                status={work.collectionStatus as any}
                onRemix={() => handleRemixClick(work)}
                showSavedDate={true}
                onUnsave={() => handleUnsave(work.id)}
              />
            ))}
          </div>
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Folder className="w-4 h-4 text-primary" /> To Remix
          </h3>
          <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {collectedWorks.slice(2, 4).map((work) => (
              <WorkCard
                key={work.id}
                work={work}
                isRemixable={true}
                status={work.collectionStatus as any}
                onRemix={() => handleRemixClick(work)}
                showSavedDate={true}
                onUnsave={() => handleUnsave(work.id)}
              />
            ))}
          </div>
        </div>
      </div>

      <RemixApplicationModal
        open={remixModalOpen}
        onOpenChange={setRemixModalOpen}
        work={selectedWork}
        onSuccess={handleApplySuccess}
      />

      <NewFolderModal open={newFolderModalOpen} onOpenChange={setNewFolderModalOpen} />

      <Dialog open={uploadModalOpen} onOpenChange={setUploadModalOpen}>
        <DialogContent className="max-w-2xl bg-background/95 backdrop-blur-xl border-primary/20 max-h-[90vh] overflow-y-auto">
          <UploadView user={{ did: "mock", name: "User", bio: "", skills: [] } as UserProfile} isRemix={true} />
        </DialogContent>
      </Dialog>
    </div>
  )
}

function NewFolderModal({ open, onOpenChange }: any) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm bg-background/95 backdrop-blur-xl border-primary/20">
        <DialogHeader>
          <DialogTitle>Create New Folder</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Folder Name</Label>
            <Input placeholder="e.g. Project Alpha" />
          </div>
          <div className="space-y-2">
            <Label>Description</Label>
            <Textarea placeholder="What's this collection for?" />
          </div>
        </div>
        <DialogFooter>
          <Button onClick={() => onOpenChange(false)}>Create Folder</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function RemixApplicationModal({ open, onOpenChange, work, onSuccess }: any) {
  const [status, setStatus] = useState<"idle" | "error">("idle")

  if (!work) return null

  const handleApply = () => {
    if (Math.random() > 0.8) {
      setStatus("error")
    } else {
      onSuccess()
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm sm:max-w-md bg-background/95 backdrop-blur-xl border-primary/20">
        <DialogHeader>
          <DialogTitle>Apply for Remix License</DialogTitle>
          <DialogDescription>Create a derivative work based on "{work.title}".</DialogDescription>
        </DialogHeader>

        {work.collectionStatus === "rejected" && (
          <div className="bg-red-500/10 border border-red-500/20 p-3 rounded-md text-sm text-red-500">
            Previous application rejected: Insufficient balance. Please top up and try again.
          </div>
        )}

        <div className="space-y-6 py-4">
          {/* ... existing header ... */}
          <div className="p-3 bg-muted/50 rounded-lg border border-border/50 flex items-center gap-3">
            <div className="w-12 h-12 bg-background rounded-md overflow-hidden border border-border">
              <img src={work.image || "/placeholder.svg"} className="w-full h-full object-cover" />
            </div>
            <div>
              <p className="font-bold text-sm">{work.title}</p>
              <p className="text-xs text-muted-foreground">Original by {work.author}</p>
            </div>
          </div>

          <div className="space-y-3">
            <Label>Remix Type</Label>
            <Select defaultValue="reprocess">
              <SelectTrigger>
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="reprocess">Reprocess (New Material)</SelectItem>
                <SelectItem value="remake">Remake (Visual Interpretation)</SelectItem>
                <SelectItem value="mix">Mix (Combined with other works)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-3">
            <Label>License Fee</Label>
            <div className="flex items-center gap-2 p-3 border border-border rounded-lg bg-muted/20">
              <Wallet className="w-4 h-4 text-primary" />
              <span className="text-sm font-mono">0.05 ETH</span>
            </div>
          </div>

          {status === "error" && (
            <p className="text-sm text-red-500 font-bold">Transaction failed: Insufficient funds.</p>
          )}
        </div>

        <DialogFooter>
          <Button className="w-full bg-primary hover:bg-primary/90" onClick={handleApply}>
            <GitFork className="w-4 h-4 mr-2" /> Pay & Mint License
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
