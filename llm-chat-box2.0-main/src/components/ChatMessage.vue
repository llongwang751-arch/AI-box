<script setup>
import { computed, ref, onMounted, onUnmounted } from 'vue'
import { renderMarkdown } from '@/utils/markdown'
import { Document, ArrowDown } from '@element-plus/icons-vue'
// 导入图片资源
import copyIcon from '@/assets/photo/复制.png'
import successIcon from '@/assets/photo/成功.png'
import likeIcon from '@/assets/photo/赞.png'
import likeActiveIcon from '@/assets/photo/赞2.png'
import dislikeIcon from '@/assets/photo/踩.png'
import dislikeActiveIcon from '@/assets/photo/踩2.png'
import regenerateIcon from '@/assets/photo/重新生成.png'
import thinkingIcon from '@/assets/photo/深度思考.png'

// 定义props
const props = defineProps({
  message: {
    type: Object,
    required: true,
  },
  isLastAssistantMessage: {
    type: Boolean,
    default: false,
  },
})

// 点赞和踩的状态
const isLiked = ref(false)
const isDisliked = ref(false)

// 添加复制状态
const isCopied = ref(false)

// 添加重新生成的事件
const emit = defineEmits(['regenerate'])

// 添加展开/折叠状态控制
const isReasoningExpanded = ref(true)

// 切换展开/折叠状态
const toggleReasoning = () => {
  isReasoningExpanded.value = !isReasoningExpanded.value
}

// 处理复制函数
const handleCopy = async () => {
  try {
    await navigator.clipboard.writeText(props.message.content)
    isCopied.value = true

    // 1.5秒后恢复原始图标
    setTimeout(() => {
      isCopied.value = false
    }, 2500)
  } catch (err) {
    console.error('复制失败:', err)
  }
}

// 处理点赞
const handleLike = () => {
  if (isDisliked.value) isDisliked.value = false
  isLiked.value = !isLiked.value
}

// 处理踩
const handleDislike = () => {
  if (isLiked.value) isLiked.value = false
  isDisliked.value = !isDisliked.value
}

// 添加重新生成的事件
const handleRegenerate = () => {
  emit('regenerate')
}

// 处理代码块的复制
const handleCodeCopy = async (event) => {
  const codeBlock = event.target.closest('.code-block')
  const code = codeBlock.querySelector('code').textContent

  try {
    await navigator.clipboard.writeText(code)
    // 可以添加复制成功的提示
  } catch (err) {
    console.error('复制失败:', err)
  }
}

// 处理代码块主题切换
const handleThemeToggle = (event) => {
  // 确保我们获取到正确的元素
  const codeBlock = event.target.closest('.code-block')
  // 修改获取图标元素的方式
  const themeBtn = event.target.closest('[data-action="theme"]')
  const themeIcon = themeBtn.querySelector('img')
  const lightIcon = themeIcon.dataset.lightIcon
  const darkIcon = themeIcon.dataset.darkIcon

  // 添加调试日志
  // console.log('切换主题', {
  //   codeBlock,
  //   themeIcon,
  //   lightIcon,
  //   darkIcon,
  //   isDark: codeBlock.classList.contains('dark-theme'),
  // })

  codeBlock.classList.toggle('dark-theme')

  // 切换图标
  themeIcon.src = codeBlock.classList.contains('dark-theme') ? lightIcon : darkIcon
}

// 修改事件监听的方式
onMounted(() => {
  // 使用 MutationObserver 来监听 DOM 变化
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (mutation.addedNodes.length) {
        const codeBlocks = document.querySelectorAll('.code-block')
        codeBlocks.forEach((block) => {
          const copyBtn = block.querySelector('[data-action="copy"]')
          const themeBtn = block.querySelector('[data-action="theme"]')

          if (copyBtn && !copyBtn._hasListener) {
            copyBtn.addEventListener('click', handleCodeCopy)
            copyBtn._hasListener = true
          }
          if (themeBtn && !themeBtn._hasListener) {
            themeBtn.addEventListener('click', handleThemeToggle)
            themeBtn._hasListener = true
            // console.log('添加主题切换监听器', { block, themeBtn })
          }
        })
      }
    })
  })

  // 开始观察
  observer.observe(document.body, {
    childList: true,
    subtree: true,
  })

  // 组件卸载时清理
  onUnmounted(() => {
    observer.disconnect()
    const codeBlocks = document.querySelectorAll('.code-block')
    codeBlocks.forEach((block) => {
      const copyBtn = block.querySelector('[data-action="copy"]')
      const themeBtn = block.querySelector('[data-action="theme"]')

      copyBtn?.removeEventListener('click', handleCodeCopy)
      themeBtn?.removeEventListener('click', handleThemeToggle)
    })
  })
})

// 将消息内容转换为 HTML
const renderedContent = computed(() => {
  return renderMarkdown(props.message.content)
})

// 添加 reasoning_content 的渲染
const renderedReasoning = computed(() => {
  if (!props.message.reasoning_content) return ''
  return renderMarkdown(props.message.reasoning_content)
})
</script>

<template>
  <div class="chat-message" :class="{ 'chat-message--mine': message.role === 'user' }">
    <div class="chat-message__avatar" v-if="message.role === 'assistant'">
      <img :src="message.loading ? thinkingIcon : thinkingIcon" alt="AI" v-if="message.loading" class="chat-message__loading-icon" />
      <img src="@/assets/photo/对话.png" alt="AI" v-else />
    </div>

    <div class="chat-message__content">
      <!-- 文件预览区域 -->
      <div v-if="message.files?.length > 0" class="chat-message__files">
        <div v-for="file in message.files" :key="file.url" class="chat-message__file-item">
          <!-- 图片预览 -->
          <div v-if="file.type === 'image'" class="chat-message__image-preview">
            <el-image
              :src="file.url"
              :preview-src-list="[file.url]"
              fit="cover"
              class="chat-message__img"
            />
          </div>
          <!-- 文件预览 -->
          <div v-else class="chat-message__file-preview">
            <el-icon><Document /></el-icon>
            <span class="chat-message__file-name">{{ file.name }}</span>
            <span class="chat-message__file-size">{{ (file.size / 1024).toFixed(1) }}KB</span>
          </div>
        </div>
      </div>

      <!-- 消息内容 -->
      <div v-if="message.loading && message.role === 'assistant' && !message.content && !message.reasoning_content" class="chat-message__thinking">
        <img :src="thinkingIcon" alt="loading" class="chat-message__loading-icon" />
        <span>思考中...</span>
      </div>

      <!-- Reasoning Content -->
      <div v-if="message.reasoning_content" class="chat-message__reasoning">
        <div class="chat-message__reasoning-header" @click="toggleReasoning">
          <div class="chat-message__reasoning-title">
            <img :src="thinkingIcon" alt="thinking" />
            <span>思考过程</span>
          </div>
          <el-icon class="chat-message__reasoning-toggle" :class="{ 'is-expanded': isReasoningExpanded }">
            <ArrowDown />
          </el-icon>
        </div>
        <div v-show="isReasoningExpanded" class="chat-message__reasoning-body markdown-body" v-html="renderedReasoning"></div>
      </div>

      <!-- Main Content -->
      <div
        v-if="message.content"
        class="chat-message__text markdown-body"
        v-html="renderedContent"
      ></div>

      <!-- Assistant Actions -->
      <div v-if="message.role === 'assistant' && !message.loading" class="chat-message__actions">
        <el-tooltip :content="isCopied ? '已复制' : '复制'" placement="top">
          <button class="chat-message__action-btn" @click="handleCopy">
            <img :src="isCopied ? successIcon : copyIcon" alt="copy" />
          </button>
        </el-tooltip>

        <div class="chat-message__action-group">
          <button class="chat-message__action-btn" :class="{ 'is-active': isLiked }" @click="handleLike">
            <img :src="isLiked ? likeActiveIcon : likeIcon" alt="like" />
          </button>
          <button class="chat-message__action-btn" :class="{ 'is-active': isDisliked }" @click="handleDislike">
            <img :src="isDisliked ? dislikeActiveIcon : dislikeIcon" alt="dislike" />
          </button>
        </div>

        <el-tooltip v-if="isLastAssistantMessage" content="重新生成" placement="top">
          <button class="chat-message__action-btn" @click="handleRegenerate">
            <img :src="regenerateIcon" alt="regenerate" />
          </button>
        </el-tooltip>

        <!-- 添加 tokens 信息 -->
        <span v-if="message.completion_tokens" class="tokens-info">
          tokens: {{ message.completion_tokens }}, speed: {{ message.speed }} tokens/s
        </span>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.chat-message {
  display: flex;
  gap: 16px;
  margin-bottom: 32px;
  width: 100%;

  &--mine {
    flex-direction: row-reverse;

    .chat-message__content {
      background-color: var(--el-color-primary-light-9);
      border-radius: 18px 4px 18px 18px;
      border: 1px solid var(--el-color-primary-light-8);
    }

    .chat-message__avatar {
      background: var(--el-color-primary-light-8);
    }
  }

  &__avatar {
    width: 36px;
    height: 36px;
    flex-shrink: 0;
    border-radius: 10px; // 稍微方一点的圆角更现代
    overflow: hidden;
    background: #f0f2f5;
    display: flex;
    align-items: center;
    justify-content: center;
    border: 1px solid var(--border-color);

    img {
      width: 24px;
      height: 24px;
    }
  }

  &__content {
    flex: 1;
    min-width: 0;
    padding: 14px 20px;
    background-color: white;
    border-radius: 4px 18px 18px 18px;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04);
    border: 1px solid var(--border-color);
  }

  &__files {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    margin-bottom: 8px;
  }

  &__image-preview {
    width: 150px;
    height: 150px;
    border-radius: 8px;
    overflow: hidden;
    border: 1px solid var(--border-color);
  }

  &__img {
    width: 100%;
    height: 100%;
  }

  &__file-preview {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px 12px;
    background: #f8f9fa;
    border-radius: 8px;
    border: 1px solid var(--border-color);
  }

  &__file-name {
    font-size: 13px;
    max-width: 150px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  &__file-size {
    font-size: 12px;
    color: var(--text-color-secondary);
  }

  &__thinking {
    display: flex;
    align-items: center;
    gap: 8px;
    color: var(--text-color-secondary);
    font-size: 14px;
  }

  &__loading-icon {
    width: 16px;
    height: 16px;
    animation: rotate 1.5s linear infinite;
  }

  &__reasoning {
    margin-bottom: 1.5rem;
    border: 1px solid var(--el-color-info-light-8);
    background: var(--el-color-info-light-9);
    border-radius: 12px;
    overflow: hidden;

    &-header {
      padding: 10px 16px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      cursor: pointer;
      user-select: none;
      background: rgba(0, 0, 0, 0.02);

      &:hover {
        background: rgba(0, 0, 0, 0.04);
      }
    }

    &-title {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 13px;
      color: var(--el-color-info);
      font-weight: 500;

      img {
        width: 16px;
        height: 16px;
        opacity: 0.7;
      }
    }

    &-toggle {
      font-size: 12px;
      color: var(--el-color-info);
      transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      &.is-expanded {
        transform: rotate(180deg);
      }
    }

    &-body {
      padding: 12px 16px;
      font-size: 14px;
      line-height: 1.6;
      color: var(--el-color-info-dark-2);
      border-top: 1px solid var(--el-color-info-light-8);
      background: white;
    }
  }

  &__text {
    font-size: 15px;
    line-height: 1.6;
    word-break: break-word;
  }

  &__actions {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-top: 12px;
    padding-top: 8px;
    border-top: 1px solid #f0f0f0;
  }

  &__action-group {
    display: flex;
    gap: 4px;
  }

  &__action-btn {
    width: 28px;
    height: 28px;
    display: flex;
    align-items: center;
    justify-content: center;
    border: none;
    background: transparent;
    border-radius: 4px;
    cursor: pointer;
    transition: all 0.2s;

    img {
      width: 16px;
      height: 16px;
      opacity: 0.6;
    }

    &:hover {
      background: #f0f2f5;
      img { opacity: 0.9; }
    }

    &.is-active {
      background: var(--el-color-primary-light-9);
      img { opacity: 1; }
    }
  }

  .tokens-info {
    margin-left: auto;
    font-size: 12px;
    color: var(--text-color-secondary);
    opacity: 0.8;
  }
}

@keyframes rotate {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

/* Markdown Override */
:deep(.markdown-body) {
  background: transparent;
  font-size: 15px;
  line-height: 1.75;
  color: var(--text-color-primary);

  p {
    margin-bottom: 1.25rem;
    &:last-child {
      margin-bottom: 0;
    }
  }

  h1, h2, h3, h4, h5, h6 {
    margin-top: 2rem;
    margin-bottom: 1rem;
    font-weight: 600;
    line-height: 1.25;
  }

  ul, ol {
    margin-bottom: 1.25rem;
    padding-left: 1.5rem;
    li {
      margin-bottom: 0.5rem;
      &::marker {
        color: var(--el-color-primary);
      }
    }
  }

  blockquote {
    margin: 1.5rem 0;
    padding: 0.5rem 1rem;
    border-left: 4px solid var(--el-color-info-light-7);
    background-color: var(--el-color-info-light-9);
    color: var(--text-color-secondary);
    border-radius: 0 4px 4px 0;
  }

  hr {
    height: 1px;
    background-color: var(--border-color);
    border: none;
    margin: 2rem 0;
  }

  pre {
    background-color: #f6f8fa;
    border-radius: 12px;
    padding: 1rem;
    margin: 1.5rem 0;
    border: 1px solid var(--border-color);
  }

  code {
    background-color: rgba(175, 184, 193, 0.2);
    padding: 0.2em 0.4em;
    border-radius: 6px;
    font-size: 85%;
    font-family: var(--font-family-mono);
  }

  /* 代码块容器样式 */
  .code-block {
    position: relative;
    margin: 1rem 0;
    border-radius: 8px;
    overflow: hidden;
    border: 1px solid var(--code-border);
    background-color: var(--code-block-bg);

    .code-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0.5rem 1rem;
      background-color: var(--code-header-bg);
      border-bottom: 1px solid var(--code-border);

      .code-lang {
        font-size: 0.75rem;
        color: var(--text-color-secondary);
        font-family: var(--font-family-mono);
        text-transform: uppercase;
      }

      .code-actions {
        display: flex;
        gap: 0.75rem;

        .code-action-btn {
          background: none;
          border: none;
          padding: 4px;
          cursor: pointer;
          display: flex;
          align-items: center;
          border-radius: 4px;
          transition: background-color 0.2s;
          width: 24px;
          height: 24px;

          &:hover {
            background-color: rgba(0, 0, 0, 0.05);
          }

          img {
            width: 14px;
            height: 14px;
            opacity: 0.6;
            display: block;
          }
        }
      }
    }

    pre {
      margin: 0 !important;
      padding: 1rem;
      background-color: transparent;
      overflow-x: auto;

      code {
        padding: 0;
        background-color: transparent;
        color: var(--code-text);
        font-family: var(--font-family-mono);
        font-size: 0.875rem;
        line-height: 1.5;
      }
    }

    &.dark-theme {
      background-color: #1e1e1e;
      border-color: #333;

      .code-header {
        background-color: #252526;
        border-color: #333;

        .code-lang {
          color: #9cdcfe;
        }

        .code-action-btn:hover {
          background-color: rgba(255, 255, 255, 0.1);
        }
      }

      pre code {
        color: #d4d4d4;
      }
    }
  }

  /* 通用图片限制 */
  img {
    max-width: 100%;
    height: auto;
    border-radius: 4px;
  }
}
</style>
