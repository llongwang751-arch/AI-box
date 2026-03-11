import { computed, nextTick, watch } from 'vue'
import { useChatStore } from '@/stores/chat'
import { useSettingStore } from '@/stores/setting'
import { messageHandler } from '@/utils/messageHandler'
import { createChatCompletion } from '@/utils/api'

export function useChat(messagesContainer) {
  const chatStore = useChatStore()
  const settingStore = useSettingStore()

  const currentMessages = computed(() => chatStore.currentMessages)
  const isLoading = computed(() => chatStore.isLoading)
  const currentConversation = computed(() => chatStore.currentConversation)

  // 滚动到底部
  const scrollToBottom = () => {
    nextTick(() => {
      if (messagesContainer.value) {
        messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
      }
    })
  }

  // 监听消息变化自动滚动
  watch(currentMessages, scrollToBottom, { deep: true })

  const sendMessage = async (messageContent) => {
    if (!settingStore.settings.apiKey) {
      chatStore.addMessage(
        messageHandler.formatMessage('assistant', '请先在设置中配置 API Key 再进行对话。'),
      )
      return
    }

    try {
      chatStore.addMessage(
        messageHandler.formatMessage('user', messageContent.text, '', messageContent.files),
      )
      chatStore.addMessage(messageHandler.formatMessage('assistant', '', ''))

      chatStore.setIsLoading(true)
      const lastMessage = chatStore.getLastMessage()
      lastMessage.loading = true

      const messages = chatStore.currentMessages.map(({ role, content }) => ({ role, content }))
      const response = await createChatCompletion(messages)

      await messageHandler.handleResponse(
        response,
        settingStore.settings.stream,
        (content, reasoning_content, tokens, speed) => {
          chatStore.updateLastMessage(content, reasoning_content, tokens, speed)
        },
      )
    } catch (error) {
      console.error('Failed to send message:', error)
      const errorMsg = error.message.includes('401')
        ? 'API Key 无效，请检查设置。'
        : '抱歉，网络请求失败，请稍后重试。'
      chatStore.updateLastMessage(errorMsg)
    } finally {
      chatStore.setIsLoading(false)
      const lastMessage = chatStore.getLastMessage()
      if (lastMessage) {
        lastMessage.loading = false
      }
    }
  }

  const regenerateMessage = async () => {
    try {
      const lastUserMessage = chatStore.currentMessages[chatStore.currentMessages.length - 2]
      chatStore.currentMessages.splice(-2, 2)
      await sendMessage({ text: lastUserMessage.content, files: lastUserMessage.files })
    } catch (error) {
      console.error('Failed to regenerate message:', error)
    }
  }

  return {
    currentMessages,
    isLoading,
    currentConversation,
    sendMessage,
    regenerateMessage,
    scrollToBottom
  }
}
