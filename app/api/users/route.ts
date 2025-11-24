import { NextRequest, NextResponse } from 'next/server';
import { initDatabase, getUserByWalletAddress, getUserByDid, createUser, updateUser, getUserSkills, addUserSkill } from '@/server/db/database';

export async function POST(request: NextRequest) {
  try {
    // 初始化数据库（在首次请求时创建表）
    initDatabase();
    
    const body = await request.json();
    const { walletAddress, did, name, avatar, skills = [] } = body;
    
    if (!walletAddress || !did) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }
    
    // 检查用户是否已存在
    let user = getUserByWalletAddress(walletAddress);
    
    if (!user) {
      // 创建新用户
      user = createUser({
        walletAddress,
        did,
        name,
        avatar
      });
      
      // 添加技能
      if (skills.length > 0 && user.id) {
        for (const skill of skills) {
          addUserSkill(user.id, skill);
        }
      }
    }
    
    // 获取用户技能
    const userSkills = user.id ? getUserSkills(user.id).map(s => s.skill) : [];
    
    return NextResponse.json({
      ...user,
      skills: userSkills
    });
  } catch (error) {
    console.error('Error handling user request:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    initDatabase();
    
    const { searchParams } = new URL(request.url);
    const walletAddress = searchParams.get('walletAddress');
    const did = searchParams.get('did');
    
    if (!walletAddress && !did) {
      return NextResponse.json({ error: 'Missing query parameter: walletAddress or did' }, { status: 400 });
    }
    
    let user;
    if (walletAddress) {
      user = getUserByWalletAddress(walletAddress);
    } else {
      user = getUserByDid(did!);
    }
    
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    
    // 获取用户技能
    const userSkills = user.id ? getUserSkills(user.id).map(s => s.skill) : [];
    
    return NextResponse.json({
      ...user,
      skills: userSkills
    });
  } catch (error) {
    console.error('Error fetching user:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    initDatabase();
    
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('id');
    
    if (!userId) {
      return NextResponse.json({ error: 'Missing user ID' }, { status: 400 });
    }
    
    const body = await request.json();
    const { name, avatar, skills = [] } = body;
    
    // 更新用户基本信息
    const updatedUser = updateUser(parseInt(userId), { name, avatar });
    
    // 处理技能更新（这里简化处理，实际可能需要更复杂的逻辑）
    if (updatedUser && skills.length > 0) {
      for (const skill of skills) {
        addUserSkill(parseInt(userId), skill);
      }
    }
    
    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error('Error updating user:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}