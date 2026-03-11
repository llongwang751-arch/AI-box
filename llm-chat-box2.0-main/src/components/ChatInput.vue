<script setup>
import { ref } from 'vue'
import { Close, Document } from '@element-plus/icons-vue'

// 输入框的值，使用 ref 实现响应式
const inputValue = ref('')
const fileList = ref([]) // 存储上传的文件列表

// 定义组件的 props，接收 loading 状态
const props = defineProps({
  loading: {
    type: Boolean, // loading 的类型为布尔值
    default: false, // 默认值为 false
  },
})

// 定义组件的事件，这里声明了一个 send 事件
const emit = defineEmits(['send'])

// 处理发送消息的方法
const handleSend = () => {
  if (!inputValue.value.trim() || props.loading) return

  // 构建消息对象
  const messageContent = {
    text: inputValue.value.trim(),
    files: fileList.value,
  }

  // 触发 send 事件，将消息内容作为参数传递
  emit('send', messageContent)

  // 清空输入框和文件列表
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

    <el-input
      v-model="inputValue"
      class="chat-input__textarea"
      type="textarea"
      :autosize="{ minRows: 1, maxRows: 6 }"
      placeholder="输入消息，Enter 发送，Shift + Enter 换行"
      resize="none"
      @keydown.enter.exact.prevent="handleSend"
      @keydown.enter.shift="handleNewline"
    />
    <div class="chat-input__actions">
      <div class="chat-input__left-actions">
        <el-upload
          class="chat-input__upload"
          :auto-upload="false"
          :show-file-list="false"
          :on-change="handleFileUpload"
          accept=".pdf,.doc,.docx,.txt"
        >
          <button class="chat-input__action-btn" title="添加附件">
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
          <button class="chat-input__action-btn" title="添加图片">
            <img src="@/assets/photo/图片.png" alt="image" />
          </button>
        </el-upload>
      </div>
      <div class="chat-input__right-actions">
        <div class="chat-input__divider"></div>
        <button
          class="chat-input__action-btn chat-input__action-btn--send"
          :disabled="props.loading"
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
  padding: 0.8rem;
  background-color: var(--bg-color);
  border: 1px solid var(--border-color);
  border-radius: 16px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);

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
      img {
        opacity: 1;
        filter: brightness(100) invert(0); // 确保它是白色的
      }
      &:hover:not(:disabled) {
        background-color: #3266d6;
      }
    }
  }

  &__divider {
    height: 1.25rem;
    width: 1px;
    background-color: var(--border-color);
    margin: 0 4px;
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
