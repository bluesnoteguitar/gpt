# gpt — ChatGPT MCP server

這個 repo 提供一個 MCP server，讓 Claude Code（或任何支援 MCP 的客戶端）可以呼叫 ChatGPT（OpenAI API）。

## 工具
- `ask_chatgpt`：傳 prompt 給 ChatGPT 並取得回覆（可選 `system`、`model`）
- `list_models`：列出你的 API key 能用的模型

## 安裝
```bash
git clone https://github.com/bluesnoteguitar/gpt.git
cd gpt/chatgpt-mcp && npm install && cd ..
export OPENAI_API_KEY=sk-...        # 你的 OpenAI API key
export OPENAI_MODEL=gpt-5           # 選填，預設 gpt-5
claude                              # 在 repo 根目錄啟動，會讀取 .mcp.json
```
第一次啟動時 Claude Code 會詢問是否啟用專案的 `chatgpt` MCP server，選同意即可。用 `/mcp` 檢查狀態。

### 改成全域安裝（任何資料夾都能用）
```bash
claude mcp add chatgpt --scope user -e OPENAI_API_KEY=sk-... -- node /絕對路徑/gpt/chatgpt-mcp/server.mjs
```

## 環境變數
| 變數 | 說明 |
|---|---|
| `OPENAI_API_KEY` | 必填 |
| `OPENAI_MODEL` | 預設模型，預設 `gpt-5` |
| `OPENAI_BASE_URL` | 選填，相容 OpenAI 的 API 位址 |
