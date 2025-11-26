import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const { walletAddress } = await request.json()
    
    if (!walletAddress) {
      return NextResponse.json({ error: 'Wallet address is required' }, { status: 400 })
    }
    
    // 检查用户是否已存在
    const existingUser = await prisma.user.findUnique({
      where: { walletAddress },
    })
    
    if (existingUser) {
      // 老用户，直接返回用户信息
      return NextResponse.json({
        existingUser: true,
        user: {
          id: existingUser.id,
          name: existingUser.name || 'Anonymous',
          bio: existingUser.bio || '',
          skills: existingUser.skills,
          walletAddress: existingUser.walletAddress,
        },
      })
    } else {
      // 新用户，只返回不存在的标志
      return NextResponse.json({ existingUser: false })
    }
  } catch (error) {
    console.error('Wallet login error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// 创建或更新用户的API
export async function PUT(request: NextRequest) {
  try {
    const { walletAddress, name, bio, skills } = await request.json()
    
    if (!walletAddress || !name) {
      return NextResponse.json({ error: 'Wallet address and name are required' }, { status: 400 })
    }
    
    // 创建或更新用户
    const user = await prisma.user.upsert({
      where: { walletAddress },
      update: {
        name,
        bio,
        skills,
      },
      create: {
        walletAddress,
        name,
        bio,
        skills,
      },
    })
    
    return NextResponse.json({
      user: {
        id: user.id,
        name: user.name || 'Anonymous',
        bio: user.bio || '',
        skills: user.skills,
        walletAddress: user.walletAddress,
      },
    })
  } catch (error) {
    console.error('Create/update user error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}