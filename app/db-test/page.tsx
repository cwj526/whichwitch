import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';

export default function DatabaseTestPage() {
  const [walletAddress, setWalletAddress] = useState('');
  const [searchResult, setSearchResult] = useState<any>(null);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [recentUsers, setRecentUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // 模拟获取最近用户（在真实环境中，这会是一个API调用）
  useEffect(() => {
    // 这里只是为了演示，实际上应该通过API获取用户列表
    setRecentUsers([
      {
        walletAddress: '0x1234567890123456789012345678901234567890',
        name: '测试用户1',
        bio: '这是一个测试用户',
        skills: ['绘画', '设计']
      },
      {
        walletAddress: '0x0987654321098765432109876543210987654321',
        name: '测试用户2',
        bio: '另一个测试用户',
        skills: ['编程', '音乐']
      }
    ]);
  }, []);

  const handleSearch = async () => {
    if (!walletAddress) {
      setSearchError('请输入钱包地址');
      return;
    }

    setLoading(true);
    setSearchError(null);

    try {
      const response = await fetch(`/api/users?walletAddress=${walletAddress}`);
      
      if (response.ok) {
        const data = await response.json();
        setSearchResult(data);
      } else {
        setSearchError('未找到该用户');
        setSearchResult(null);
      }
    } catch (error) {
      console.error('搜索用户错误:', error);
      setSearchError('搜索失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-center">数据库测试页面</h1>
        
        <Tabs defaultValue="search" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-8">
            <TabsTrigger value="search">搜索用户</TabsTrigger>
            <TabsTrigger value="info">数据库信息</TabsTrigger>
          </TabsList>
          
          <TabsContent value="search" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>通过钱包地址搜索用户</CardTitle>
                <CardDescription>
                  输入钱包地址查找已存储在数据库中的用户信息
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="walletAddress">钱包地址</Label>
                  <Input
                    id="walletAddress"
                    placeholder="0x..."
                    value={walletAddress}
                    onChange={(e) => setWalletAddress(e.target.value)}
                  />
                </div>
                
                <Button onClick={handleSearch} disabled={loading}>
                  {loading ? '搜索中...' : '搜索'}
                </Button>
                
                {searchError && (
                  <div className="p-3 bg-red-50 text-red-500 rounded-md">
                    {searchError}
                  </div>
                )}
                
                {searchResult && (
                  <div className="p-4 bg-green-50 rounded-md space-y-2">
                    <h3 className="font-semibold">找到用户:</h3>
                    <p><strong>钱包地址:</strong> {searchResult.wallet_address}</p>
                    <p><strong>名称:</strong> {searchResult.name}</p>
                    <p><strong>简介:</strong> {searchResult.bio || '无'}</p>
                    <p><strong>技能:</strong> {searchResult.skills?.join(', ') || '无'}</p>
                    <p><strong>创建时间:</strong> {searchResult.created_at}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="info" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>SQLite数据库集成信息</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 bg-blue-50 rounded-md">
                  <h3 className="font-semibold mb-2">数据库集成状态</h3>
                  <ul className="space-y-1 text-sm">
                    <li>✓ SQLite3 依赖已安装</li>
                    <li>✓ Better-SQLite3 已配置</li>
                    <li>✓ 数据库表结构已创建</li>
                    <li>✓ API路由已实现</li>
                    <li>✓ 用户认证流程已集成</li>
                  </ul>
                </div>
                
                <div className="space-y-2">
                  <h3 className="font-semibold">数据库位置</h3>
                  <p className="text-sm text-gray-600">
                    数据库文件存储在: <code className="bg-gray-100 px-2 py-1 rounded">data/whichwitch.db</code>
                  </p>
                </div>
                
                <div className="space-y-2">
                  <h3 className="font-semibold">表结构</h3>
                  <div className="text-sm space-y-3">
                    <div>
                      <p className="font-medium">users 表:</p>
                      <code className="block bg-gray-100 p-2 rounded text-xs">
                        id, wallet_address, did, name, bio, avatar, created_at, updated_at
                      </code>
                    </div>
                    <div>
                      <p className="font-medium">skills 表:</p>
                      <code className="block bg-gray-100 p-2 rounded text-xs">
                        id, user_id, skill
                      </code>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
        
        <div className="mt-12">
          <Card>
            <CardHeader>
              <CardTitle>用户数据模型</CardTitle>
              <CardDescription>
                集成到现有认证流程中的用户数据结构
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[300px] pr-4">
                <pre className="text-sm bg-gray-100 p-4 rounded-md overflow-x-auto">
                  {JSON.stringify({
                    UserProfile: {
                      did: "did:whichwitch:0x1234567890123456789012345678901234567890",
                      name: "示例用户",
                      bio: "用户个人简介",
                      skills: ["绘画", "设计", "编程"]
                    },
                    DatabaseFields: {
                      wallet_address: "0x1234567890123456789012345678901234567890",
                      did: "did:whichwitch:0x1234567890123456789012345678901234567890",
                      name: "示例用户",
                      bio: "用户个人简介",
                      avatar: "https://example.com/avatar.jpg",
                      created_at: "2024-01-01T00:00:00Z",
                      updated_at: "2024-01-01T00:00:00Z"
                    }
                  }, null, 2)}
                </pre>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}