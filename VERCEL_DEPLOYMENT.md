# Vercel 部署指南

## 方法一：网页界面部署（推荐）

### 步骤 1: 注册 Vercel
1. 访问 https://vercel.com
2. 点击 "Sign Up"
3. 选择 "Continue with GitHub"
4. 授权 Vercel 访问您的 GitHub 账号

### 步骤 2: 导入项目
1. 在 Vercel 控制台，点击 "Add New..." → "Project"
2. 找到并选择 `baby-log` 仓库
3. 点击 "Import"

### 步骤 3: 配置部署
Vercel 会自动检测配置，确认以下设置：
- **Framework Preset**: Vite
- **Root Directory**: `./`
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Install Command**: `npm install`

### 步骤 4: 部署
1. 点击 "Deploy" 按钮
2. 等待构建完成（约 1-2 分钟）
3. 部署成功后，您会获得一个 URL，例如：
   - `https://baby-log.vercel.app`
   - `https://baby-log-xxx.vercel.app`

### 步骤 5: 自定义域名（可选）
1. 在项目设置中，点击 "Domains"
2. 添加您的自定义域名
3. 按照提示配置 DNS

---

## 方法二：命令行部署

### 步骤 1: 安装 Vercel CLI
```bash
npm install -g vercel
```

### 步骤 2: 登录
```bash
vercel login
```
选择 GitHub 登录

### 步骤 3: 部署
在项目目录下运行：
```bash
cd /Users/charlesqi/Desktop/antigdemo/baby-log
vercel
```

首次部署会询问：
- Set up and deploy? → **Y**
- Which scope? → 选择您的账号
- Link to existing project? → **N**
- What's your project's name? → **baby-log**
- In which directory is your code located? → **./（直接回车）**

### 步骤 4: 生产部署
```bash
vercel --prod
```

---

## 注意事项

### 关于后端 API (server.js)
当前项目使用 `server.js` 作为后端。在 Vercel 上有两种处理方式：

#### 选项 1: 纯前端部署（推荐）
- 只部署前端，数据存储在浏览器的 IndexedDB 中
- 无需后端，完全离线可用
- **当前配置已支持此方式**

#### 选项 2: 使用 Vercel Serverless Functions
如果需要服务器端数据存储，需要：
1. 将 `server.js` 改造为 Serverless Function
2. 放在 `api/` 目录下
3. 使用云数据库（如 Vercel Postgres、MongoDB Atlas）

---

## 自动部署

部署成功后，每次您推送代码到 GitHub：
1. Vercel 会自动检测到更新
2. 自动构建新版本
3. 自动部署到生产环境

**预览部署**：
- 每个 Pull Request 都会创建预览部署
- 可以在合并前测试

---

## 常见问题

### Q: 部署后数据会丢失吗？
A: 不会。数据存储在浏览器的 IndexedDB 中，与部署无关。

### Q: 可以绑定自定义域名吗？
A: 可以。在 Vercel 项目设置中添加域名，并配置 DNS。

### Q: 免费版有限制吗？
A: 免费版限制：
- 100GB 带宽/月
- 无限项目
- 自动 HTTPS
- 对个人项目完全够用

### Q: 国内访问速度如何？
A: Vercel 在国内访问速度较好，通常在 100-300ms。

---

## 推荐的工作流程

1. **开发**: 本地运行 `npm run dev`
2. **测试**: 本地测试功能
3. **提交**: `git add . && git commit -m "message"`
4. **推送**: `git push`
5. **自动部署**: Vercel 自动部署新版本

---

## 下一步

部署成功后，您可以：
1. 分享 Vercel 提供的 URL 给其他人使用
2. 绑定自定义域名
3. 在手机浏览器中添加到主屏幕（PWA）
4. 导出/导入数据备份
