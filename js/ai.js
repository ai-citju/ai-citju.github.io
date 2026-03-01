// ================================
// ai.js - AI Client + Cache
// ================================

// Preserve any existing values (set by config.js) to avoid overwriting backendURL
;(function(){
  const _prev = window.AI || {}
  window.AI = {
    backendURL: _prev.backendURL || "",
    provider: _prev.provider || "",
    apiKey: _prev.apiKey || "",

  // Helper: prefer runtime API base, then explicit user override, then APP_CONFIG/AI.
  getBackendURLFromConfig() {
    try{
      const runtime = String((typeof window !== 'undefined' && window.API_BASE_URL) || '').trim()
      const explicit = String(localStorage.getItem('backend_url_explicit') || '') === '1'
      const stored = explicit ? String(localStorage.getItem('backend_url') || '').trim() : ''
      const raw = runtime || stored || (window.APP_CONFIG && window.APP_CONFIG.backendURL) || (window.AI && window.AI.backendURL) || ''
      return String(raw || '').replace(/\/+$/,'')
    }catch(e){ return '' }
  },

  // Helper: Get headers with JWT token for authenticated requests
  getAuthHeaders() {
    const headers = {}
    try{
      const token = localStorage.getItem('auth_token')
      if(token){
        headers['Authorization'] = 'Bearer ' + token
      }
    }catch(e){}
    return headers
  },

  init({ backendURL, provider, apiKey }) {
    // idempotent init: skip if nothing changed
    if (
      this.backendURL === backendURL &&
      this.provider === provider &&
      this.apiKey === apiKey
    ) {
      return
    }

    this.backendURL = backendURL
    this.provider = provider
    this.apiKey = apiKey

    console.log("🤖 AI ready:", provider)
    console.trace("AI.init called from:")
  },

  cacheKey(movieId) {
    return `ai_summary_${this.provider}_${movieId}`
  },

  async summarize({ movieId, title, overview }) {
    const key = this.cacheKey(movieId)

    // ===== CACHE HIT =====
    const cached = localStorage.getItem(key)
    if (cached) {
      console.log("🧠 AI cache hit")
      return cached
    }

    // ===== PROMPT =====
    const prompt = `
Ringkas film berikut secara singkat, padat, dan menarik:

Judul: ${title}
Sinopsis: ${overview}
    `.trim()

    // ===== CALL BACKEND =====
    const data = await this._callBackendSummarize({
      provider: this.provider,
      apiKey: this.apiKey,
      prompt
    })

    // ===== SAVE CACHE =====
    localStorage.setItem(key, data.result)

    return data.result
  }
  ,

  // Backend-only call path keeps behavior consistent across region/browser/network.
  async _callBackendSummarize({ provider, apiKey, prompt, model, noCache }) {
    const base = this.getBackendURLFromConfig() || this.backendURL
    if(!base) throw new Error('AI backendURL not configured')
    const body = { provider, prompt, model, allowFallback: true }
    if(apiKey) body.apiKey = apiKey
    if(noCache) body.noCache = true

    const configuredTimeout = (() => {
      try{
        const raw = Number(localStorage.getItem('ai_request_timeout_ms') || '')
        if(Number.isFinite(raw) && raw >= 30000 && raw <= 180000) return Math.floor(raw)
      }catch(e){}
      return 90000
    })()
    const attempts = [configuredTimeout, Math.min(180000, configuredTimeout + 30000)]
    let lastTimeoutSec = Math.round(configuredTimeout / 1000)

    for(let i=0;i<attempts.length;i++){
      const timeoutMs = attempts[i]
      const controller = new AbortController()
      const timer = setTimeout(()=> controller.abort(), timeoutMs)
      let res
      try{
        res = await fetch(`${base}/ai/summarize`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...this.getAuthHeaders()
          },
          body: JSON.stringify(body),
          signal: controller.signal
        })
      } catch (e) {
        if (e && e.name === 'AbortError') {
          lastTimeoutSec = Math.round(timeoutMs / 1000)
          if(i < attempts.length - 1){
            try{ console.warn('[AI] timeout, retrying summarize once', { provider, timeoutMs }) }catch(_){}
            continue
          }
          throw new Error(`AI request timeout (>${lastTimeoutSec}s)`)
        }
        throw e
      } finally {
        clearTimeout(timer)
      }

      const data = await res.json().catch(() => ({}))
      if (!res.ok || data?.error) {
        const msg = data?.error || `${res.status} ${res.statusText || 'Backend error'}`
        throw new Error(msg)
      }
      return data
    }
    throw new Error(`AI request timeout (>${lastTimeoutSec}s)`)
  },

  // Generic prompt runner (used by AI suggestions / social generator)
  async generate({ provider, apiKey, prompt, model, noCache } = {}) {
    const useProvider = provider || this.provider
    const useKey = apiKey || this.apiKey || ""
    if (!useProvider) throw new Error("AI provider not configured")
    if (!prompt) throw new Error("Missing prompt")

    const data = await this._callBackendSummarize({
      provider: useProvider,
      apiKey: useKey,
      prompt,
      model,
      noCache: !!noCache
    })
    return data?.result
  }
  }
})();
