<script setup>
import { ref, onMounted, computed } from 'vue'
import { Plus } from '@element-plus/icons-vue'
import ChatInput from '@/components/ChatInput.vue'
import ChatMessage from '@/components/ChatMessage.vue'
import { useChatStore } from '@/stores/chat'
import { useChat } from '@/composables/useChat'
import SettingsPanel from '@/components/SettingsPanel.vue'
import PopupMenu from '@/components/PopupMenu.vue'
import DialogEdit from '@/components/DialogEdit.vue'
import { useRouter } from 'vue-router'

// 获取聊天状态和消息容器
const chatStore = useChatStore()
const messagesContainer = ref(null)

// 使用 useChat composable
const {
  currentMessages,
  isLoading,
  sendMessage,
  regenerateMessage,
  scrollToBottom
} = useChat(messagesContainer)

onMounted(() => {
  scrollToBottom()
  if (chatStore.conversations.length === 0) {
    chatStore.createConversation()
  }
})

// 处理发送和重新生成
const handleSend = sendMessage
const handleRegenerate = regenerateMessage

// 添加组件引用
const settingDrawer = ref(null)
const popupMenu = ref(null)
const dialogEdit = ref(null)

// 路由控制
const router = useRouter()
const handleBack = () => router.push('/')

// 对话控制
const handleNewChat = () => chatStore.createConversation()
const currentTitle = computed(() => chatStore.currentConversation?.title || 'LLM Chat')
const formatTitle = (title = 'LLM Chat') => title.length > 8 ? title.slice(0, 8) + '...' : title
</script>

<template>
  <!-- 聊天容器 -->
  <div class="chat-container">
    <!-- 聊天头部 -->
    <div class="chat-header">
      <div class="header-left">
        <PopupMenu ref="popupMenu" />
        <el-button class="new-chat-btn" :icon="Plus" @click="handleNewChat">新对话</el-button>
        <div class="divider"></div>
        <div class="title-wrapper">
          <h1 class="chat-title">{{ formatTitle(currentTitle) }}</h1>
          <button
            class="edit-btn"
            @click="dialogEdit.openDialog(chatStore.currentConversationId, 'edit')"
          >
            <img src="@/assets/photo/编辑.png" alt="edit" />
          </button>
        </div>
      </div>

      <div class="header-right">
        <el-tooltip content="设置" placement="top">
          <button class="action-btn" @click="settingDrawer.openDrawer()">
            <img src="@/assets/photo/设置.png" alt="settings" />
          </button>
        </el-tooltip>
        <el-tooltip content="回到首页" placement="top">
          <button class="action-btn" @click="handleBack">
            <img src="@/assets/photo/返回.png" alt="back" />
          </button>
        </el-tooltip>
      </div>
    </div>

    <!-- 消息容器，显示对话消息 -->
    <div class="messages-container" ref="messagesContainer">
      <template v-if="currentMessages.length > 0">
        <chat-message
          v-for="(message, index) in currentMessages"
          :key="message.id"
          :message="message"
          :is-last-assistant-message="
            index === currentMessages.length - 1 && message.role === 'assistant'
          "
          @regenerate="handleRegenerate"
        />
      </template>
      <div v-else class="empty-state">
        <div class="empty-content">
          <img src="@/assets/photo/对话.png" alt="chat" class="empty-icon" />
          <h2>开始对话吧</h2>
          <p>有什么想和我聊的吗？</p>
        </div>
      </div>
    </div>

    <!-- 聊天输入框 -->
    <div class="chat-input-container">
      <chat-input :loading="isLoading" @send="handleSend" />
    </div>

    <!-- 设置面板 -->
    <SettingsPanel ref="settingDrawer" />

    <!-- 添加对话框组件 -->
    <DialogEdit ref="dialogEdit" />
  </div>
</template>

<style lang="scss" scoped>
/* 定义聊天容器的样式，占据整个视口高度，使用flex布局以支持列方向的布局 */
.chat-container {
  height: 100vh;
  display: flex;
  flex-direction: column;
}

/* 设置聊天头部的样式，包括对齐方式和背景色等 */
.chat-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem 1rem;
  background-color: var(--bg-color);
  border-bottom: 1px solid #ffffff;

  .header-left {
    display: flex;
    align-items: center;
    gap: 1rem;

    .action-btn {
      width: 2rem;
      height: 2rem;
      padding: 0;
      border: none;
      background: none;
      cursor: pointer;
      border-radius: 4px;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.2s ease;

      img {
        width: 1.4rem;
        height: 1.4rem;
        opacity: 1;
        transition: filter 0.2s;
      }

      &:hover {
        background-color: rgba(0, 0, 0, 0.05);
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
      }
    }

    .new-chat-btn {
      /* 基础尺寸设置 */
      font-size: 0.8rem;
      height: 2rem;
      padding: 0rem 0.5rem;

      /* 文字垂直居中对齐 */
      display: inline-flex; /* 使用 flex 布局 */
      align-items: center; /* 垂直居中对齐 */
      line-height: 1; /* 重置行高 */

      /* 圆角设置 - 添加胶囊形状 */
      border-radius: 9999px; /* 使用较大的值来确保完全的胶囊形状 */

      /* 未选中状态 */
      border: 1px solid #3f7af1;
      background-color: #ffffff;
      color: #3f7af1;

      /* 鼠标悬停效果 */
      &:hover {
        background-color: #3f7af1;
        border-color: #3f7af1;
        color: #ffffff;
      }

      /* 图标样式 */
      :deep(.el-icon) {
        margin-right: 4px;
        font-size: 0.875rem;
      }
    }

    /* 添加分隔线样式 */
    .divider {
      height: 1.5rem; /* 设置分隔线高度 */
      width: 1px; /* 设置分隔线宽度 */
      background-color: #e5e7eb; /* 设置分隔线颜色 */
      margin: 0 0.2rem; /* 设置左右间距 */
    }

    .title-wrapper {
      position: relative;
      display: flex;
      align-items: center;
      gap: 0.5rem;

      .chat-title {
        margin: 0;
        font-size: 0.9rem;
        font-weight: 500;
        color: var(--text-color-primary);
      }

      .edit-btn {
        opacity: 0;
        width: 0.9rem;
        height: 0.9rem;
        padding: 0;
        border: none;
        background: none;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: opacity 0.2s ease;

        img {
          width: 100%;
          height: 100%;
        }
      }

      &:hover {
        .edit-btn {
          opacity: 1;
        }
      }
    }
  }

  .header-right {
    display: flex;
    gap: 0.5rem;

    .action-btn {
      width: 2rem;
      height: 2rem;
      padding: 0;
      border: none;
      background: none;
      cursor: pointer;
      border-radius: 4px;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.2s ease;

      img {
        width: 1.25rem;
        height: 1.25rem;
        opacity: 1;
        transition: filter 0.2s;
      }

      &:hover {
        background-color: rgba(0, 0, 0, 0.05);
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);

        img {
          filter: brightness(0.4);
        }
      }
    }
  }
}

/* 定义消息容器的样式 */
.messages-container {
  flex: 1;
  overflow-y: auto;
  padding: 2rem 1rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  scroll-behavior: smooth;
  background-color: var(--bg-color-secondary);

  & > * {
    width: 100%;
    max-width: 800px;
  }

  /* 自定义滚动条样式 */
  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-thumb {
    background-color: rgba(0, 0, 0, 0.1);
    border-radius: 3px;
  }

  &::-webkit-scrollbar-track {
    background-color: transparent;
  }
}

/* 设置空状态时的样式，占据全部高度，居中对齐内容 */
.empty-state {
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;

  .empty-content {
    text-align: center;

    .empty-icon {
      width: 64px;
      height: 64px;
      opacity: 0.6;
      margin-bottom: 1.5rem;
    }

    h2 {
      font-size: 1.5rem;
      font-weight: 500;
      color: var(--text-color-primary);
      margin-bottom: 0.5rem;
    }

    p {
      font-size: 1rem;
      color: var(--text-color-secondary);
      margin: 0;
    }
  }
}

/* 添加输入框容器样式 */
.chat-input-container {
  position: sticky;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 10;
  padding: 1rem 2rem 2rem;
  display: flex;
  justify-content: center;
  background: linear-gradient(to top, var(--bg-color) 80%, transparent);

  & > * {
    width: 100%;
    max-width: 800px;
  }
}
</style>
