"use client"

// 添加window.ethereum的类型定义
declare global {
  interface Window {
    ethereum: any
  }
}

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
  const [formData, setFormData] = useState({
    name: "",
    bio: "",
    skills: [] as string[],
  })
  const [skillInput, setSkillInput] = useState("")

  const commonSkills = ["Ceramics", "Woodworking", "Digital Art", "Embroidery", "Pottery", "3D Modeling"]

  const [error, setError] = useState<string | null>(null)

  const handleConnect = async () => {
    setLoading(true)
    setError(null)
    
    try {
      // 检查是否有window.ethereum对象
      if (!window.ethereum) {
        throw new Error("No wallet found. Please install MetaMask or another wallet provider.")
      }
      
      // 创建provider
      const provider = new ethers.BrowserProvider(window.ethereum)
      
      // 请求用户连接钱包
      const accounts = await provider.send("eth_requestAccounts", [])
      
      if (accounts.length === 0) {
        throw new Error("No accounts found in wallet.")
      }
      
      // 获取当前网络
      const network = await provider.getNetwork()
      console.log(`Connected to network: ${network.name} (${network.chainId})`)
      
      // 获取连接的钱包地址
      const signer = await provider.getSigner()
      const address = await signer.getAddress()
      const did = `did:whichwitch:${address}`
      
      // 检查数据库中是否已存在该用户
      const response = await fetch(`/api/users?walletAddress=${address}`)
      
      let userProfile: UserProfile;
      
      if (response.ok) {
        // 用户已存在，从数据库获取
        const userData = await response.json();
        userProfile = {
          did: userData.did,
          name: userData.name || `Artisan ${address.slice(0, 6)}`,
          bio: userData.bio || "Digital Craftsman",
          skills: userData.skills || []
        };
      } else {
        // 用户不存在，创建新用户并保存到数据库
        const newUserData = {
          walletAddress: address,
          did: did,
          name: `Artisan ${address.slice(0, 6)}`,
          bio: "Digital Craftsman",
          skills: []
        };
        
        const createResponse = await fetch('/api/users', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(newUserData)
        });
        
        if (!createResponse.ok) {
          throw new Error('Failed to create user in database');
        }
        
        const savedUser = await createResponse.json();
        userProfile = {
          did: savedUser.did,
          name: savedUser.name,
          bio: savedUser.bio,
          skills: savedUser.skills || []
        };
      }
      
      setLoading(false)
      onLogin(userProfile)
    } catch (err) {
      setLoading(false)
      if (err instanceof Error) {
        setError(err.message)
      } else {
        setError("An error occurred while connecting to wallet.")
      }
    }
  }

  const handleCreateProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    
    try {
      if (!window.ethereum) {
        throw new Error("Wallet connection lost.")
      }
      
      // 获取连接的钱包地址
      const provider = new ethers.BrowserProvider(window.ethereum)
      const signer = await provider.getSigner()
      const address = await signer.getAddress()
      const did = `did:whichwitch:${address}`
      
      // 保存用户资料到数据库
      const userData = {
        walletAddress: address,
        did: did,
        name: formData.name || `Artisan ${address.slice(0, 6)}`,
        bio: formData.bio || "Digital Craftsman",
        skills: formData.skills
      };
      
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(userData)
      });
      
      if (!response.ok) {
        throw new Error('Failed to save user profile to database');
      }
      
      const savedUser = await response.json();
      const userProfile: UserProfile = {
        did: savedUser.did,
        name: savedUser.name,
        bio: savedUser.bio,
        skills: savedUser.skills || []
      };
      
      setLoading(false)
      onLogin(userProfile)
    } catch (err) {
      setLoading(false)
      if (err instanceof Error) {
        setError(err.message)
      } else {
        setError("An error occurred while creating profile.")
      }
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
                <div className="flex items-center gap-2 text-destructive p-3 rounded-md bg-destructive/10">
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
