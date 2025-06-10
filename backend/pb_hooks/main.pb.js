// PocketBase hooks for basic setup

console.log("✅ PocketBase hooks loaded")

// 启动后初始化数据
onAfterBootstrap((e) => {
  console.log("🚀 PocketBase 启动完成，开始初始化...")
  
  try {
    // 检查 users 集合是否存在
    let usersCollection
    try {
      usersCollection = $app.dao().findCollectionByNameOrId('users')
      console.log("✅ users 集合已存在")
    } catch (err) {
      console.log("📝 users 集合不存在，需要手动创建")
      console.log("请访问 http://127.0.0.1:8091/_/ 手动创建 users 集合")
      return
    }
    
    if (usersCollection) {
      // 检查测试用户
      try {
        const admin = $app.dao().findFirstRecordByEmail('users', 'admin@example.com')
        console.log("✅ 找到测试用户:", admin.email())
        
        if (!admin.verified()) {
          admin.setVerified(true)
          $app.dao().saveRecord(admin)
          console.log("✅ 用户验证状态已更新")
        }
      } catch (err) {
        console.log("❌ 测试用户不存在")
        console.log("请手动创建用户: admin@example.com / admin123")
      }
    }
    
  } catch (e) {
    console.log("❌ 初始化过程中出错:", e.message)
  }
})
