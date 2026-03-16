<script setup>
import { ref, computed } from 'vue'
import { Close, Document } from '@element-plus/icons-vue'

// 输入框的值，使用 ref 实现响应式
const inputValue = ref('')
const fileList = ref([]) // 存储上传的文件列表

// 是否可以发送
const canSend = computed(() => {
  return inputValue.value.trim().length > 0 || fileList.value.length > 0
})

// 定义组件的 props，接收 loading 状态
defineProps({
  loading: {
    type: Boolean, // loading 的类型为布尔值
    default: false, // 默认值为 false
  },
})

// 定义组件的事件，这里声明了一个 send 事件
const emit = defineEmits(['send'])

// 处理发送消息的方法
const handleSend = () => {
  console.log('[ChatInput] handleSend trigger')

  emit('send', {
    text: inputValue.value,
    files: [...fileList.value],
  })

  inputValue.value = ''
  fileList.value = []
}

// 处理换行的方法（Shift + Enter）
const handleNewline = (e) => {
  e.preventDefault() // 阻止默认的 Enter 发送行为
  inputValue.value += '\n' // 在当前位置添加换行符
}

// 处理文件上传
const handleFileUpload = (uploadFile) => {
  // 确保获取到的是文件对象
  const file = uploadFile.raw
  if (!file) return false

  fileList.value.push({
    name: file.name,
    url: URL.createObjectURL(file),
    type: file.type.startsWith('image/') ? 'image' : 'file',
    size: file.size,
  })
  return false // 阻止自动上传
}

// 移除文件
const handleFileRemove = (file) => {
  const index = fileList.value.findIndex((item) => item.url === file.url)
  if (index !== -1) {
    URL.revokeObjectURL(fileList.value[index].url)
    fileList.value.splice(index, 1)
  }
}
</script>

<template>
  <div class="chat-input">
    <!-- 文件预览区域 -->
    <div v-if="fileList.length > 0" class="chat-input__previews">
      <div v-for="file in fileList" :key="file.url" class="chat-input__preview-item">
        <!-- 图片预览 -->
        <div v-if="file.type === 'image'" class="chat-input__image-preview">
          <img :src="file.url" :alt="file.name" />
          <div class="chat-input__remove-btn" @click="handleFileRemove(file)">
            <el-icon><Close /></el-icon>
          </div>
        </div>
        <!-- 文件预览 -->
        <div v-else class="chat-input__file-preview">
          <el-icon><Document /></el-icon>
          <span class="chat-input__file-name">{{ file.name }}</span>
          <span class="chat-input__file-size">{{ (file.size / 1024).toFixed(1) }}KB</span>
          <div class="chat-input__remove-btn" @click="handleFileRemove(file)">
            <el-icon><Close /></el-icon>
          </div>
        </div>
      </div>
    </div>

    <div class="chat-input__input-area">
      <textarea
        v-model="inputValue"
        class="chat-input__native-textarea"
        placeholder="输入消息，Enter 发送，Shift + Enter 换行"
        rows="1"
        @keydown.enter.exact.prevent="handleSend"
        @keydown.enter.shift="handleNewline"
      ></textarea>
    </div>
    <div class="chat-input__actions">
      <div class="chat-input__left-actions">
        <el-upload
          class="chat-input__upload"
          :auto-upload="false"
          :show-file-list="false"
          :on-change="handleFileUpload"
          accept=".pdf,.doc,.docx,.txt"
        >
          <button class="chat-input__action-btn" type="button" title="添加附件">
            <img src="@/assets/photo/附件.png" alt="attachment" />
          </button>
        </el-upload>
        <el-upload
          class="chat-input__upload"
          :auto-upload="false"
          :show-file-list="false"
          :on-change="handleFileUpload"
          accept="image/*"
        >
          <button class="chat-input__action-btn" type="button" title="添加图片">
            <img src="@/assets/photo/图片.png" alt="image" />
          </button>
        </el-upload>
      </div>
      <div class="chat-input__right-actions">
        <div class="chat-input__divider"></div>
        <button
          class="chat-input__action-btn chat-input__action-btn--send"
          :class="{ 'chat-input__action-btn--active': canSend }"
          type="button"
          @click="handleSend"
          title="发送"
        >
          <img src="@/assets/photo/发送.png" alt="send" />
        </button>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.chat-input {
  padding: 1rem;
  background-color: white;
  border: 1px solid var(--border-color);
  border-radius: 20px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
  transition: all 0.3s ease;

  &:focus-within {
    border-color: var(--el-color-primary);
    box-shadow: 0 8px 32px rgba(63, 122, 241, 0.12);
  }

  &__previews {
    margin-bottom: 8px;
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }

  &__preview-item {
    position: relative;
    border-radius: 8px;
    overflow: hidden;
  }

  &__image-preview {
    width: 60px;
    height: 60px;

    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
  }

  &__file-preview {
    padding: 8px;
    background-color: #f4f4f5;
    border-radius: 8px;
    display: flex;
    align-items: center;
    gap: 8px;
  }

  &__file-name {
    max-width: 120px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    font-size: 13px;
  }

  &__file-size {
    color: #909399;
    font-size: 12px;
  }

  &__remove-btn {
    position: absolute;
    top: 4px;
    right: 4px;
    width: 20px;
    height: 20px;
    background-color: rgba(0, 0, 0, 0.5);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    color: white;
    font-size: 12px;
    transition: background-color 0.2s;

    &:hover {
      background-color: rgba(0, 0, 0, 0.7);
    }
  }

  &__actions {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: 8px;
  }

  &__left-actions,
  &__right-actions {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  &__action-btn {
    width: 2rem;
    height: 2rem;
    padding: 4px;
    border: none;
    background: none;
    cursor: pointer;
    border-radius: 6px;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s ease;

    img {
      width: 1.25rem;
      height: 1.25rem;
      opacity: 0.7;
    }

    &:hover:not(:disabled) {
      background-color: rgba(0, 0, 0, 0.05);
      img {
        opacity: 1;
      }
    }

    &:disabled {
      cursor: not-allowed;
      opacity: 0.5;
    }

    &--send {
      background-color: #3f7af1;
      border-radius: 8px;
      opacity: 0.6; // 默认半透明
      cursor: not-allowed;
      transition: all 0.2s ease;

      img {
        opacity: 1;
        filter: brightness(100) invert(0);
        pointer-events: none; // 防止图标拦截点击事件
      }

      &.chat-input__action-btn--active {
        opacity: 1; // 激活状态不透明
        cursor: pointer;

        &:hover {
          background-color: #3266d6;
        }
      }
    }
  }

  &__divider {
    height: 1.25rem;
    width: 1px;
    background-color: var(--border-color);
    margin: 0 4px;
  }

  &__native-textarea {
    width: 100%;
    border: none;
    outline: none;
    resize: none;
    background: transparent;
    font-size: 14px;
    line-height: 1.5;
    color: var(--text-color-primary);
    font-family: inherit;
    padding: 0;
    margin: 0;
    display: block;

    &::placeholder {
      color: var(--text-color-secondary);
    }
  }

  &__textarea {
    :deep(.el-textarea__inner) {
      padding: 0;
      border: none;
      box-shadow: none;
      background: transparent;
      font-size: 14px;
      line-height: 1.5;
      color: var(--text-color-primary);

      &::placeholder {
        color: var(--text-color-secondary);
      }
    }
  }
}
</style>
