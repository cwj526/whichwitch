"use client"

import type React from "react"
import Image from "next/image"
import { useState } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2, Wallet, Sparkles, X, AlertCircle } from "lucide-react"
import type { UserProfile } from "./app-container"
import { Badge } from "@/components/ui/badge"
import { ethers } from "ethers"

export function AuthView({ onLogin }: { onLogin: (user: UserProfile) => void }) {
  const [step, setStep] = useState<"welcome" | "profile">("welcome")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [walletAddress, setWalletAddress] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    name: "",
    bio: "",
    skills: [] as string[],
  })
  const [skillInput, setSkillInput] = useState("")

  const commonSkills = ["Ceramics", "Woodworking", "Digital Art", "Embroidery", "Pottery", "3D Modeling"]

  const handleConnect = async () => {
    setLoading(true)
    setError(null)
    
    try {
      // 检查浏览器是否安装了MetaMask
      if (typeof window !== 'undefined' && typeof window.ethereum !== 'undefined') {
        // 请求用户连接钱包
        const provider = new ethers.BrowserProvider(window.ethereum)
        const accounts = await provider.send("eth_requestAccounts", [])
        
        if (accounts.length > 0) {
          const address = accounts[0]
          setWalletAddress(address)
          
          // 获取链信息
          const network = await provider.getNetwork()
          console.log("Connected to chain ID:", network.chainId)
          console.log("Wallet address:", address)
          
          // 调用API检查用户是否已存在
          const response = await fetch('/api/wallet-login', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ walletAddress: address }),
          })
          
          const data = await response.json()
          
          if (response.ok) {
            if (data.existingUser) {
              // 老用户，直接登录
              setLoading(false)
              onLogin({
                id: data.user.id,
                name: data.user.name,
                bio: data.user.bio,
                skills: data.user.skills,
                walletAddress: data.user.walletAddress,
              })
            } else {
              // 新用户，进入个人资料设置
              setLoading(false)
              setStep("profile")
            }
          } else {
            throw new Error(data.error || 'Failed to check user status')
          }
        } else {
          throw new Error("No accounts found")
        }
      } else {
        throw new Error("MetaMask is not installed. Please install MetaMask to continue.")
      }
    } catch (err) {
      setLoading(false)
      setError(err instanceof Error ? err.message : "Failed to connect wallet")
      console.error("Wallet connection error:", err)
    }
  }

  const handleCreateProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    
    try {
      if (!walletAddress) {
        throw new Error('Wallet address is required')
      }
      
      // 调用API创建用户记录
      const response = await fetch('/api/wallet-login', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          walletAddress,
          name: formData.name || "Anonymous Artisan",
          bio: formData.bio || "Digital Craftsman",
          skills: formData.skills,
        }),
      })
      
      const data = await response.json()
      
      if (response.ok) {
        setLoading(false)
        onLogin({
          id: data.user.id,
          name: data.user.name,
          bio: data.user.bio,
          skills: data.user.skills,
          walletAddress: data.user.walletAddress,
        })
      } else {
        throw new Error(data.error || 'Failed to create profile')
      }
    } catch (err) {
      setLoading(false)
      setError(err instanceof Error ? err.message : "Failed to create profile")
    }
  }

  const addSkill = (skill: string) => {
    if (skill && !formData.skills.includes(skill)) {
      setFormData({ ...formData, skills: [...formData.skills, skill] })
    }
    setSkillInput("")
  }

  const removeSkill = (skillToRemove: string) => {
    setFormData({
      ...formData,
      skills: formData.skills.filter((skill) => skill !== skillToRemove),
    })
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault()
      addSkill(skillInput.trim())
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-6">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center space-y-4">
          <div className="w-20 h-20 mx-auto relative rounded-2xl overflow-hidden shadow-[0_0_40px_-10px_var(--primary)]">
            <Image src="/logos/whichwitch-logo.jpg" alt="Whichwitch Logo" fill className="object-cover" />
          </div>
          <h1 className="text-4xl font-bold tracking-tighter">Whichwitch</h1>
          <p className="text-muted-foreground">
            Establish on-chain identity for your craft. Trace inspiration, protect rights, and get rewarded.
          </p>
        </div>

        {step === "welcome" ? (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
            <div className="grid gap-4">
              {error && (
                <div className="p-3 bg-destructive/10 text-destructive rounded-lg flex items-center gap-2">
                  <AlertCircle className="h-4 w-4" />
                  <span className="text-sm">{error}</span>
                </div>
              )}
              <Button
                size="lg"
                className="w-full h-14 text-lg font-medium relative overflow-hidden group"
                onClick={handleConnect}
                disabled={loading}
              >
                {loading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Wallet className="mr-2 h-5 w-5" />}
                Connect Wallet
                <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
              </Button>
              <Button variant="outline" size="lg" className="w-full h-14 text-lg bg-transparent">
                Create New Account
              </Button>
            </div>
            {walletAddress && (
              <div className="p-3 bg-primary/10 text-primary rounded-lg text-center text-sm">
                Connected: {walletAddress.substring(0, 6)}...{walletAddress.substring(walletAddress.length - 4)}
              </div>
            )}
            <p className="text-center text-xs text-muted-foreground">
              By connecting, you agree to our Terms of Service and Protocol Rules.
            </p>
          </motion.div>
        ) : (
          <motion.form
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            onSubmit={handleCreateProfile}
            className="space-y-6 bg-card border border-border/50 p-6 rounded-xl"
          >
            <div className="space-y-2">
              <h2 className="text-xl font-semibold">Create Identity</h2>
              <p className="text-sm text-muted-foreground">Set up your artisan profile on the genealogy tree.</p>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Display Name</Label>
                <Input
                  id="name"
                  placeholder="e.g. Studio Ghibli"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="bio">Bio</Label>
                <Input
                  id="bio"
                  placeholder="Tell your story..."
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                />
              </div>
              <div className="space-y-3">
                <Label htmlFor="skills">Skills</Label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {formData.skills.map((skill) => (
                    <Badge key={skill} variant="secondary" className="h-7 pl-2 pr-1 flex items-center gap-1">
                      {skill}
                      <button
                        type="button"
                        onClick={() => removeSkill(skill)}
                        className="hover:bg-background/50 rounded-full p-0.5 transition-colors"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
                <div className="space-y-3">
                  <Input
                    id="skills"
                    placeholder="Type a skill and press Enter..."
                    value={skillInput}
                    onChange={(e) => setSkillInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                  />
                  <div className="flex flex-wrap gap-2">
                    
                    {commonSkills.map((skill) => (
                      <button
                        key={skill}
                        type="button"
                        onClick={() => addSkill(skill)}
                        disabled={formData.skills.includes(skill)}
                        className={`text-xs px-2 py-1 rounded-full border transition-colors ${
                          formData.skills.includes(skill)
                            ? "opacity-50 cursor-not-allowed bg-muted"
                            : "hover:bg-secondary hover:text-secondary-foreground cursor-pointer"
                        }`}
                      >
                        + {skill}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {error && (
              <div className="p-3 bg-destructive/10 text-destructive rounded-lg flex items-center gap-2">
                <AlertCircle className="h-4 w-4" />
                <span className="text-sm">{error}</span>
              </div>
            )}
            <Button type="submit" className="w-full h-12" disabled={loading}>
              {loading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <>
                  Mint DID Identity <Sparkles className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
          </motion.form>
        )}
      </div>
    </div>
  )
}
