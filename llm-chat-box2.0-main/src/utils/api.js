import { useSettingStore } from '@/stores/setting'

const API_BASE_URL = 'https://api.siliconflow.cn/v1'

export const createChatCompletion = async (messages) => {
  const settingStore = useSettingStore()
  const payload = {
    model: settingStore.settings.model,
    messages,
    stream: settingStore.settings.stream,
    max_tokens: settingStore.settings.maxTokens,
    temperature: settingStore.settings.temperature,
    top_p: settingStore.settings.topP,
    top_k: settingStore.settings.topK,
  }

  const options = {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${settingStore.settings.apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  }

  try {
    const startTime = Date.now()
    const response = await fetch(`${API_BASE_URL}/chat/completions`, options)

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      const errorMessage = errorData.error?.message || `HTTP error! status: ${response.status}`
      throw new Error(errorMessage)
    }

    if (settingStore.settings.stream) {
      return response
    }

    const data = await response.json()
    const duration = (Date.now() - startTime) / 1000
    
    // 确保 usage 存在
    const completionTokens = data.usage?.completion_tokens || 0
    data.speed = duration > 0 ? (completionTokens / duration).toFixed(2) : '0.00'
    
    return data
  } catch (error) {
    console.error('Chat API Error:', error)
    throw error
  }
}
