# 管理者新增化學元素資料功能實作說明

## 目標
建立一個管理者表單，讓管理者可以新增化學元素資料，包含以下欄位：
- 元素符號
- 中文名稱
- 英文名稱
- 原子序
- 原子量
- 混成軌域
- 外觀
- 結構

填寫後點擊「儲存資料」，前端會將資料送到 Google Apps Script 後端，後端再將資料寫入 Google 試算表。

---

## 1. 更新前端 HTML

1. 開啟 `/workspaces/homework/element.html`。
2. 在頁面主選單中新增一個管理者模式按鈕：
   - `data-mode="admin"`
   - 按鈕文字：`管理者新增資料`
3. 在 `<body>` 中加入新的 section 區塊：
   - `id="admin"`
   - class `section card`
   - 內含 `<form id="adminForm">` 與輸入欄位
4. 新增輸入欄位：
   - `adminSymbol`：元素符號
   - `adminChinese`：中文名稱
   - `adminEnglish`：英文名稱
   - `adminNumber`：原子序
   - `adminMass`：原子量
   - `adminHybrid`：混成軌域
   - `adminAppearance`：外觀
   - `adminStructure`：結構
   - `saveElementBtn`：儲存資料按鈕
5. 加一個狀態顯示區塊 `adminStatus`，用來呈現送出結果或錯誤訊息。

---

## 2. 加入必要樣式

在原本的 CSS 中，讓 `.balance-form` 和其中的 `button` 也支援管理者表單輸入欄位：
- `display: grid; gap: 12px;`
- `input` 與 `button` 寬度 100%
- `button` 顏色與 hover 效果

這樣表單欄位就能在手機與桌機上正常排列。

---

## 3. 加入前端 JavaScript

在 `element.html` 的 `<script>` 內，新增以下程式邏輯：

1. 取得管理者表單欄位節點
   - `document.getElementById('adminSymbol')`
   - `document.getElementById('adminChinese')`
   - `document.getElementById('adminEnglish')`
   - `document.getElementById('adminNumber')`
   - `document.getElementById('adminMass')`
   - `document.getElementById('adminHybrid')`
   - `document.getElementById('adminAppearance')`
   - `document.getElementById('adminStructure')`
   - `document.getElementById('adminStatus')`
   - `document.getElementById('saveElementBtn')`

2. 寫入送出函式 `submitAdminElement()`：
   - 收集欄位值
   - 檢查必要欄位是否填寫
   - 組成 JSON payload
   - `fetch()` POST 到 Apps Script Web App URL
   - 根據回傳值更新 `adminStatus`
   - 成功時重置表單

3. `saveElementBtn.addEventListener('click', submitAdminElement)`。
4. `showSection('lookup')` 仍然保留，讓預設頁面為搜尋模式。

---

## 4. 設定後端 Google Apps Script

### 4.1 建立 Google 試算表

1. 開啟 Google 試算表。
2. 建立新試算表。
3. 在第一列加入欄位名稱：
   - `元素符號`
   - `中文名稱`
   - `英文名稱`
   - `原子序`
   - `原子量`
   - `混成軌域`
   - `外觀`
   - `結構`
   - `建立時間`

4. 記下試算表 ID，位於網址中 `spreadsheets/d/` 與 `/edit` 之間的字串。

### 4.2 建立 Apps Script 專案

1. 在 Google 試算表中，選單 `擴充功能 > Apps Script`。或直接造訪 `https://script.google.com/`。
2. 建立新專案。
3. 將以下程式碼貼入 `Code.gs`：

```javascript
function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    const sheet = SpreadsheetApp.openById('REPLACE_WITH_SPREADSHEET_ID').getActiveSheet();
    const row = [
      data.symbol || '',
      data.chinese || '',
      data.english || '',
      data.number || '',
      data.mass || '',
      data.hybrid || '',
      data.appearance || '',
      data.structure || '',
      new Date()
    ];
    sheet.appendRow(row);
    return ContentService
      .createTextOutput(JSON.stringify({ success: true }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    return ContentService
      .createTextOutput(JSON.stringify({ success: false, message: error.message }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}
```

4. 將 `REPLACE_WITH_SPREADSHEET_ID` 改成你的試算表 ID。

### 4.3 部署 Web App

1. 點選右上角 `部署 > 新版部署`。
2. 選擇類型 `Web 應用程式`。
3. 設定：
   - `描述`：例如 `Element Admin Save API`
   - `執行應用程式的人`：選 `我`。
   - `誰有權使用`：選 `任何人` 或 `任何知道網址的人`。
4. 部署後，複製 Web App URL。

---

## 5. 設定前端送出 URL

在 `/workspaces/homework/element.html` 的 JavaScript 中，找到：

```js
const endpoint = 'https://script.google.com/macros/s/REPLACE_WITH_YOUR_DEPLOYED_WEB_APP_URL/exec';
```

將它改成你剛剛部署後的 Web App URL。例如：

```js
const endpoint = 'https://script.google.com/macros/s/ABC1234567890/exec';
```

---

## 6. 測試流程

1. 將 `element.html` 放在可存取的 Web 伺服器環境中（避免 `file://` 發生 CORS 或安全限制）。
   - 可用簡單本機伺服器，如 `python3 -m http.server 8000`。
2. 開啟瀏覽器並前往 `http://localhost:8000/element.html`。
3. 點選頁籤 `管理者新增資料`。
4. 填寫元素資料欄位。
5. 點擊 `儲存資料`。
6. 確認畫面顯示成功訊息，並檢查 Google 試算表是否新增一列資料。

---

## 7. 注意事項

- 若瀏覽器出現 CORS 或跨域錯誤，請確認 Web App 部署權限是否設定為「任何人」或「任何知道網址的人」。
- 若 `fetch()` 失敗，請打開開發者工具查看 Network 與 Console 錯誤訊息。
- `Apps Script` 第一次執行時，可能需要授權存取試算表。
- 如果前端是從 `file://` 開啟，建議改用本機伺服器，以避免瀏覽器對 POST 請求的限制。

---

## 8. 已實作的檔案與位置

- 前端檔案：`/workspaces/homework/element.html`
- 教學文件：`/workspaces/homework/admin_element_integration.md`

---

## 9. 進階可擴充項目

- 若要驗證內容，前端可在送出前加入更嚴格的欄位格式檢查。
- 後端可以新增 `sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()` 來檢查欄位數量。
- 可在 Apps Script 中加入 `Logger.log()` 記錄，或擴充回傳欄位以利前端顯示更清楚的錯誤資訊。
