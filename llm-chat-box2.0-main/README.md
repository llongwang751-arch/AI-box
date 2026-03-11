# 🤖 智能化多模态 AI 交互平台

一个基于 **Vue 3** + **Vite** 构建的现代化 AI 聊天应用。支持多模型切换、流式响应、Markdown 渲染及代码高亮，提供极致的对话体验。


## �🌟 核心特性

- 💬 **多会话管理**：支持创建、切换、重命名及删除会话，历史记录自动保存。
- 🌊 **流式响应**：基于 Fetch API 实现的流式数据传输，实时查看 AI 生成内容。
- 📝 **Markdown & 代码高亮**：深度集成 `markdown-it` 与 `highlight.js`，支持复杂的 Markdown 语法及多语言代码高亮。
- 📤 **多模态支持**：支持图片及文件上传预览。
-  **主题切换**：内置深色/浅色模式，适配各种使用场景。
- 💾 **数据持久化**：使用 Pinia 结合 `pinia-plugin-persistedstate` 实现本地配置及消息历史持久化。
- 📱 **响应式设计**：完美适配移动端与桌面端。

## 🛠️ 技术栈

| 领域 | 技术方案 |
| :--- | :--- |
| **前端框架** | [Vue 3 (Composition API)](https://vuejs.org/) |
| **构建工具** | [Vite 6](https://vitejs.dev/) |
| **状态管理** | [Pinia](https://pinia.vuejs.org/) |
| **UI 组件库** | [Element Plus](https://element-plus.org/) |
| **路由管理** | [Vue Router 4](https://router.vuejs.org/) |
| **样式处理** | SCSS |
| **Markdown** | markdown-it + markdown-it-emoji |
| **代码高亮** | highlight.js |
| **依赖管理** | pnpm |

## 📸 项目演示

### 首页展示
![首页展示](src/assets/sampels/首页.png)
*简洁直观的引导界面，快速开启对话。*

### 独立对话界面
![独立对话界面](src/assets/sampels/独立对话框.png)
*支持流式输出、推理过程展示及代码复制功能。*

### 内联搜索对话
![内联搜索对话](src/assets/sampels/内联对话框.png)
*轻量级搜索框形式，随时随地唤起 AI 辅助。*

## 🚀 快速上手

### 1. 环境准备
确保已安装 [Node.js](https://nodejs.org/) (建议 v18+) 和 [pnpm](https://pnpm.io/)。

### 2. 克隆并安装
```bash
# 安装依赖
pnpm install
```

### 3. 配置 API Key
项目默认使用 **SiliconFlow** 接口。你可以通过以下两种方式配置：

- **方式一（推荐）**：复制 `.env.example` 为 `.env`，填入你的 Key。
  ```bash
  VITE_SILICONFLOW_API_KEY=你的_API_KEY
  ```
- **方式二**：在运行后的网页中，点击右侧“设置”图标手动输入。

### 4. 运行开发服务器
```bash
pnpm dev
```
访问浏览器控制台显示的地址（默认 `http://localhost:5173`）即可。

## 📦 目录结构

```text
src/
├── components/       # 核心组件（输入框、消息列表、设置面板等）
├── stores/           # Pinia 状态（聊天历史、系统设置）
├── utils/            # 工具函数（API 封装、Markdown 解析、流式处理）
├── views/            # 页面视图（首页、聊天主页）
└── assets/           # 静态资源（图标、样式、示例图片）
```

## 🔧 进阶配置

你可以在 [SettingsPanel.vue](src/components/SettingsPanel.vue) 中调整以下参数：
- **模型选择**：支持 DeepSeek-R1, DeepSeek-V3, Qwen 等多种主流模型。
- **参数调优**：支持 Temperature, Top_P, Max Tokens 等推理参数设置。
- **流式开关**：开启或关闭流式响应模式。

## 📄 许可证

本项目基于 [MIT License](LICENSE) 开源。
