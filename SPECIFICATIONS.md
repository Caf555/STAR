# STAR - AI Art Control Panel 技術規格文檔

**版本：** 1.0  
**最後更新：** 2026-05-04  
**專案名稱：** STAR (Storyboard & Text-to-Art Rendering)

---

## 📋 目錄

1. [專案概述](#專案概述)
2. [系統架構](#系統架構)
3. [AI 模型配置](#ai-模型配置)
4. [ComfyUI 工作流](#comfyui-工作流)
5. [API 整合](#api-整合)
6. [功能模組](#功能模組)
7. [資料結構](#資料結構)
8. [檔案格式](#檔案格式)

---

## 專案概述

### 簡介
STAR 是一個整合 LM Studio 和 ComfyUI 的單頁 AI 藝術生成控制面板，專為動漫風格圖片生成和劇情分鏡製作而設計。

### 核心特性
- 🎨 內建 28+ 知名藝術家風格庫
- 👤 角色圖鑑資料庫（CSV 導入）
- 🎬 劇情分鏡自動生成
- 🖼️ QWEN EDIT 連續編輯模式
- 🎥 視覺效果參數庫（運鏡、視角、光影）
- ⚡ 三種 AI 模型切換（NetaYume v35/v40、Z-IMAGE）
- 📊 歷史紀錄管理

### 技術棧
- **前端：** HTML5 + CSS3 + Vanilla JavaScript (ES6+)
- **AI 生成引擎：** ComfyUI (REST API)
- **LLM 服務：** LM Studio (OpenAI-compatible API)
- **模型架構：** Stable Diffusion 3 (SD3)
- **圖片格式：** PNG, JPG
- **資料儲存：** LocalStorage

---

## 系統架構

### 整體架構圖

```
┌─────────────────────────────────────────────────────────┐
│                    STAR Web Application                 │
│                  (Single Page Application)               │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐ │
│  │ 風格選擇模組  │  │ 角色圖鑑模組  │  │ 劇情分鏡模組  │ │
│  └──────────────┘  └──────────────┘  └──────────────┘ │
│                                                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐ │
│  │ 視覺效果模組  │  │ 歷史紀錄模組  │  │ 提示詞編輯器  │ │
│  └──────────────┘  └──────────────┘  └──────────────┘ │
│                                                          │
├─────────────────────────────────────────────────────────┤
│                      整合層 (Integration Layer)          │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  ┌─────────────────────┐      ┌─────────────────────┐  │
│  │   LM Studio API     │      │    ComfyUI API      │  │
│  │  (本地 LLM 服務)     │      │  (圖片生成引擎)      │  │
│  │                     │      │                     │  │
│  │ • 提示詞生成         │      │ • NetaYume v35/v40  │  │
│  │ • AI 文字轉換        │      │ • Z-IMAGE           │  │
│  │ • 變動項目生成       │      │ • QWEN EDIT         │  │
│  └─────────────────────┘      └─────────────────────┘  │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

### 資料流程

```
使用者輸入
    ↓
[提示詞編輯器] → [LM Studio] → AI 生成提示詞
    ↓
[ComfyUI 設定] ← 選擇模型/參數
    ↓
[ComfyUI API] → 圖片生成
    ↓
[歷史紀錄] ← 儲存結果
    ↓
使用者查看/下載
```

---

## AI 模型配置

### 1. NetaYume Lumina 系列

#### NetaYume v4.0 (主推薦)
```json
{
  "模型檔案": "netayumeLuminaNetaLumina_v40.safetensors",
  "類型": "Checkpoint (整合模型)",
  "架構": "Stable Diffusion 3 (SD3)",
  "特點": "最新版本，優化的動漫風格",
  "推薦設定": {
    "steps": 25,
    "cfg": 4.5,
    "sampler": "euler",
    "scheduler": "simple",
    "resolution": "512×1024 ~ 1024×1024"
  }
}
```

#### NetaYume v3.5
```json
{
  "模型檔案": "NetaYumev35_pretrained_all_in_one.safetensors",
  "類型": "Checkpoint (整合模型)",
  "架構": "Stable Diffusion 3 (SD3)",
  "特點": "穩定版本，預訓練完整模型",
  "推薦設定": {
    "steps": 25,
    "cfg": 4.5,
    "sampler": "euler",
    "scheduler": "simple"
  }
}
```

#### Lightning LoRA 加速器
```json
{
  "LoRA 檔案": "netayume_v3.5_lightning_v1.0.safetensors",
  "類型": "CFG-Distilled LoRA",
  "功能": "2倍速生圖加速",
  "必要設定": {
    "lora_strength": 1.0,
    "cfg": 1,
    "steps": 20,
    "timesteps_shift": 3,
    "sampler": "euler",
    "scheduler": "normal"
  },
  "限制": "不可控制 CFG，negative prompt 無效",
  "優點": [
    "生成速度提升 2 倍",
    "手部和四肢細節更佳",
    "風格 LoRA 效果更強",
    "輸出更穩定"
  ]
}
```

### 2. Z-IMAGE

```json
{
  "模型檔案": "z_image_turbo_bf16.safetensors",
  "CLIP": "qwen_3_4b.safetensors (Qwen 3 4B, Lumina2 type)",
  "VAE": "ae.safetensors",
  "類型": "Diffusion Model (分離式)",
  "架構": "自訂擴散模型",
  "特點": "寫實風格，快速生成",
  "推薦設定": {
    "steps": 4,
    "cfg": 1,
    "sampler": "res_multistep",
    "scheduler": "simple",
    "timesteps_shift": 3
  },
  "限制": "不支援 Lightning LoRA"
}
```

### 3. QWEN EDIT

```json
{
  "模型檔案": "Qwen-Rapid-AIO-NSFW-v23.safetensors",
  "CLIP": "qwen_3_4b.safetensors",
  "VAE": "ae.safetensors",
  "類型": "Image Editing Model (圖片編輯模型)",
  "架構": "基於 Qwen 的圖片到圖片編輯",
  "功能": "連續圖片編輯，保持風格一致性",
  "推薦設定": {
    "steps": 4,
    "cfg": 1,
    "sampler": "euler_ancestral",
    "scheduler": "beta",
    "timesteps_shift": 3
  },
  "使用場景": [
    "劇情分鏡連續編輯",
    "基於參考圖的變化生成",
    "保持角色一致性的多張生成"
  ],
  "特殊節點": "TextEncodeQwenImageEditPlus"
}
```

---

## ComfyUI 工作流

### 工作流 1: NetaYume 標準生成

#### 節點配置
```json
{
  "workflow_name": "NetaYume Standard Generation",
  "nodes": {
    "41": {
      "class_type": "CheckpointLoaderSimple",
      "inputs": {
        "ckpt_name": "netayumeLuminaNetaLumina_v40.safetensors"
      },
      "outputs": ["MODEL", "CLIP", "VAE"]
    },
    "37": {
      "class_type": "PrimitiveStringMultiline",
      "inputs": {
        "value": "{user_prompt}"
      }
    },
    "38": {
      "class_type": "StringConcatenate",
      "inputs": {
        "string_a": "You are an assistant designed to generate anime images based on textual prompts. <Prompt Start>",
        "string_b": ["37", 0],
        "delimiter": " "
      }
    },
    "39": {
      "class_type": "CLIPTextEncode",
      "inputs": {
        "text": ["38", 0],
        "clip": ["41", 1]
      }
    },
    "42": {
      "class_type": "CLIPTextEncode",
      "inputs": {
        "text": "blurry, worst quality, low quality, deformed hands, bad anatomy, extra limbs, poorly drawn face, mutated, extra eyes, bad proportions",
        "clip": ["41", 1]
      }
    },
    "13": {
      "class_type": "EmptySD3LatentImage",
      "inputs": {
        "width": 512,
        "height": 1024,
        "batch_size": 1
      }
    },
    "6": {
      "class_type": "KSampler",
      "inputs": {
        "seed": -1,
        "steps": 25,
        "cfg": 4.5,
        "sampler_name": "euler",
        "scheduler": "simple",
        "denoise": 1,
        "model": ["41", 0],
        "positive": ["39", 0],
        "negative": ["42", 0],
        "latent_image": ["13", 0]
      }
    },
    "43": {
      "class_type": "VAEDecode",
      "inputs": {
        "samples": ["6", 0],
        "vae": ["41", 2]
      }
    },
    "9": {
      "class_type": "SaveImage",
      "inputs": {
        "filename_prefix": "NetaYume_{timestamp}",
        "images": ["43", 0]
      }
    }
  }
}
```

### 工作流 2: NetaYume + Lightning LoRA

#### 額外節點
```json
{
  "44": {
    "class_type": "LoraLoader",
    "inputs": {
      "lora_name": "netayume_v3.5_lightning_v1.0.safetensors",
      "strength_model": 1.0,
      "strength_clip": 1.0,
      "model": ["41", 0],
      "clip": ["41", 1]
    }
  },
  "45": {
    "class_type": "ModelSamplingAuraFlow",
    "inputs": {
      "shift": 3.0,
      "model": ["44", 0]
    }
  }
}
```

#### 修改參數
```json
{
  "6": {
    "inputs": {
      "cfg": 1,
      "steps": 20,
      "scheduler": "normal",
      "model": ["45", 0]
    }
  }
}
```

### 工作流 3: Z-IMAGE

```json
{
  "workflow_name": "Z-IMAGE Fast Generation",
  "nodes": {
    "50": {
      "class_type": "CLIPLoader",
      "inputs": {
        "clip_name": "qwen_3_4b.safetensors",
        "type": "lumina2",
        "device": "default"
      }
    },
    "51": {
      "class_type": "VAELoader",
      "inputs": {
        "vae_name": "ae.safetensors"
      }
    },
    "52": {
      "class_type": "UNETLoader",
      "inputs": {
        "unet_name": "z_image_turbo_bf16.safetensors",
        "weight_dtype": "default"
      }
    },
    "13": {
      "class_type": "EmptySD3LatentImage",
      "inputs": {
        "width": 1024,
        "height": 1024,
        "batch_size": 1
      }
    },
    "53": {
      "class_type": "CLIPTextEncode",
      "inputs": {
        "text": "{user_prompt}",
        "clip": ["50", 0]
      }
    },
    "54": {
      "class_type": "ModelSamplingAuraFlow",
      "inputs": {
        "model": ["52", 0],
        "shift": 3.0
      }
    },
    "55": {
      "class_type": "ConditioningZeroOut",
      "inputs": {
        "conditioning": ["53", 0]
      }
    },
    "6": {
      "class_type": "KSampler",
      "inputs": {
        "seed": -1,
        "steps": 4,
        "cfg": 1,
        "sampler_name": "res_multistep",
        "scheduler": "simple",
        "denoise": 1,
        "model": ["54", 0],
        "positive": ["53", 0],
        "negative": ["55", 0],
        "latent_image": ["13", 0]
      }
    },
    "56": {
      "class_type": "VAEDecode",
      "inputs": {
        "samples": ["6", 0],
        "vae": ["51", 0]
      }
    },
    "9": {
      "class_type": "SaveImage",
      "inputs": {
        "filename_prefix": "z-image_{timestamp}",
        "images": ["56", 0]
      }
    }
  }
}
```

### 工作流 4: QWEN EDIT 連續編輯

```json
{
  "workflow_name": "QWEN EDIT Continuous Editing",
  "nodes": {
    "50": {
      "class_type": "CheckpointLoaderSimple",
      "inputs": {
        "ckpt_name": "Qwen-Rapid-AIO-NSFW-v23.safetensors"
      }
    },
    "51": {
      "class_type": "LoadImage",
      "inputs": {
        "image": "{previous_image_name}",
        "subfolder": "{previous_image_subfolder}",
        "type": "{previous_image_type}",
        "upload": "image"
      }
    },
    "52": {
      "class_type": "EmptyLatentImage",
      "inputs": {
        "width": "{output_width}",
        "height": "{output_height}",
        "batch_size": 1
      }
    },
    "53": {
      "class_type": "TextEncodeQwenImageEditPlus",
      "inputs": {
        "clip": ["50", 1],
        "vae": ["50", 2],
        "image1": ["51", 0],
        "target_latent": ["52", 0],
        "prompt": "{change_description}"
      }
    },
    "54": {
      "class_type": "TextEncodeQwenImageEditPlus",
      "inputs": {
        "clip": ["50", 1],
        "vae": ["50", 2],
        "target_latent": ["52", 0],
        "prompt": ""
      }
    },
    "55": {
      "class_type": "KSampler",
      "inputs": {
        "seed": "{seed}",
        "steps": 4,
        "cfg": 1,
        "sampler_name": "euler_ancestral",
        "scheduler": "beta",
        "denoise": 1,
        "model": ["50", 0],
        "positive": ["53", 0],
        "negative": ["54", 0],
        "latent_image": ["52", 0]
      }
    },
    "56": {
      "class_type": "VAEDecode",
      "inputs": {
        "samples": ["55", 0],
        "vae": ["50", 2]
      }
    },
    "57": {
      "class_type": "SaveImage",
      "inputs": {
        "filename_prefix": "QwenEdit_{timestamp}",
        "images": ["56", 0]
      }
    }
  },
  "workflow_description": "連續編輯模式，每次生成基於前一張圖片",
  "use_case": [
    "劇情分鏡連續生成",
    "角色動作變化序列",
    "場景漸進變化"
  ]
}
```

---

## API 整合

### 1. LM Studio API

#### 端點配置
```javascript
{
  "base_url": "http://localhost:1234/v1/chat/completions",
  "protocol": "OpenAI Compatible API",
  "model": "本地部署的 LLM 模型"
}
```

#### 請求格式
```javascript
{
  "method": "POST",
  "headers": {
    "Content-Type": "application/json"
  },
  "body": {
    "messages": [
      {
        "role": "system",
        "content": "{system_prompt}"
      },
      {
        "role": "user",
        "content": "{user_input}"
      }
    ],
    "temperature": 0.7,
    "max_tokens": 600
  }
}
```

#### 用途
1. **AI 提示詞生成：** 將使用者中文描述轉換為英文提示詞
2. **變動項目生成：** 為劇情分鏡生成多個變化描述
3. **固定項目生成：** 生成場景的固定元素描述

### 2. ComfyUI API

#### 端點配置
```javascript
{
  "base_url": "http://127.0.0.1:8188",
  "endpoints": {
    "submit": "/prompt",
    "history": "/history/{prompt_id}",
    "view": "/view?filename={filename}&subfolder={subfolder}&type={type}",
    "upload": "/upload/image",
    "system_stats": "/system_stats"
  }
}
```

#### 提交工作流
```javascript
POST /prompt
{
  "prompt": {
    // ComfyUI workflow JSON
  }
}
```

#### 查詢結果
```javascript
GET /history/{prompt_id}

Response:
{
  "{prompt_id}": {
    "outputs": {
      "9": {
        "images": [
          {
            "filename": "NetaYume_0208_1430_00001.png",
            "subfolder": "",
            "type": "output"
          }
        ]
      }
    }
  }
}
```

#### 圖片上傳
```javascript
POST /upload/image
Content-Type: multipart/form-data

FormData:
- image: File
- subfolder: "qwen_edit"
- type: "input"
```

---

## 功能模組

### 1. 風格選擇模組

#### 內建風格 (28 種)
```javascript
const builtinStyles = [
  // 日本動漫風格
  { name: '新海誠', tag: '@shinkai_makoto', category: 'anime' },
  { name: '吉卜力', tag: '@studio_ghibli', category: 'anime' },
  { name: '京都動畫', tag: '@kyoto_animation', category: 'anime' },
  
  // 西方藝術風格
  { name: '慕夏', tag: '@alphonse_mucha', category: 'art' },
  { name: '畢卡索', tag: '@pablo_picasso', category: 'art' },
  { name: '梵谷', tag: '@vincent_van_gogh', category: 'art' },
  
  // 現代風格
  { name: 'Realistic (寫實)', tag: 'photorealistic, 8k, highly detailed', category: 'modern' },
  { name: 'Cyberpunk (賽博龐克)', tag: 'cyberpunk aesthetics, futuristic', category: 'modern' },
  { name: 'Vintage (復古)', tag: 'vintage 90s film grain, vhs aesthetic', category: 'modern' },
  { name: 'B&W (黑白)', tag: 'black and white photography, noir', category: 'modern' }
  // ... 其他 18 種
];
```

#### 自訂風格
- 支援 CSV 檔案匯入
- 格式：`英文名稱,中文名稱,標籤,描述`

### 2. 角色圖鑑模組

#### 資料結構
```javascript
{
  "characterDatabase": {
    "類別": {
      "類型": {
        "作品": [
          {
            "tag": "#character_name",
            "name_zh": "角色中文名",
            "name_en": "Character Name",
            "category": "類別",
            "type": "類型",
            "work": "作品名稱"
          }
        ]
      }
    }
  }
}
```

#### CSV 匯入格式
```csv
類別,類型,作品,角色英文名,角色中文名,標籤
動漫,少年,航海王,Luffy,魯夫,#luffy
遊戲,RPG,原神,Paimon,派蒙,#paimon
```

### 3. 劇情分鏡模組

#### 工作流程
```
1. 設定分鏡數量 (2-20 張)
2. 輸入風格及主體
3. 生成/輸入變動項目
4. 生成固定項目
5. 選擇種子模式
6. 批次生成
```

#### 變動項目生成模式

**正常模式：**
```
系統提示：生成完整場景描述
輸出範例：
1. happy expression, waving hand
2. surprised look, stepping back
3. determined face, clenched fist
```

**QWEN EDIT 模式：**
```
系統提示：只描述變化部分
輸出範例：
1. add smile, raise right hand
2. change to laughing, both hands up
3. turn head to left, eyes closed
```

#### 種子模式
1. **全部隨機：** 每張圖片獨立隨機種子
2. **首張隨機：** 第一張隨機，後續使用相同種子
3. **指定數值：** 使用固定種子值

### 4. QWEN EDIT 模組

#### 第一張圖來源
1. **上傳本地圖片**
   - 支援格式：JPG, PNG
   - 自動讀取尺寸
   - 即時預覽

2. **正常生成**
   - 使用當前選擇的大模型
   - 完整提示詞生成

#### 尺寸設定
1. **使用參考圖尺寸：** 完全匹配參考圖
2. **保持參考圖比例，自訂尺寸：** 鎖定比例縮放
3. **使用全局設定：** 從 ComfyUI 設定讀取

#### 連續編輯流程
```
第 1 張：參考圖 (上傳或生成)
    ↓
第 2 張：QWEN EDIT (參考第 1 張 + 變動描述 2)
    ↓
第 3 張：QWEN EDIT (參考第 2 張 + 變動描述 3)
    ↓
第 N 張：QWEN EDIT (參考第 N-1 張 + 變動描述 N)
```

### 5. 視覺效果模組

#### 鏡頭運鏡 (9 種)
```javascript
const cameraMovements = [
  { name: 'Static (固定)', tag: 'static shot' },
  { name: 'Pan Left (左搖)', tag: 'pan left' },
  { name: 'Pan Right (右搖)', tag: 'pan right' },
  { name: 'Tilt Up (上仰)', tag: 'tilt up' },
  { name: 'Tilt Down (下俯)', tag: 'tilt down' },
  { name: 'Zoom In (推近)', tag: 'slow zoom in' },
  { name: 'Zoom Out (拉遠)', tag: 'slow zoom out' },
  { name: 'Tracking (跟隨)', tag: 'tracking shot' },
  { name: 'FPV (第一人稱)', tag: 'FPV drone shot' }
];
```

#### 拍攝視角 (5 種)
```javascript
const cameraAngles = [
  { name: 'Eye Level (平視)', tag: 'eye level angle' },
  { name: 'Low Angle (低角)', tag: 'low angle shot' },
  { name: 'High Angle (高角)', tag: 'high angle shot' },
  { name: 'Overhead (頂視)', tag: 'overhead view' },
  { name: 'Dutch Angle (斜角)', tag: 'dutch angle' }
];
```

#### 光影設定 (6 種)
```javascript
const lightingEffects = [
  { name: 'Natural (自然光)', tag: 'natural lighting' },
  { name: 'Cinematic (電影光)', tag: 'cinematic lighting' },
  { name: 'Neon (霓虹)', tag: 'neon lighting' },
  { name: 'Golden Hour (黃金光)', tag: 'golden hour' },
  { name: 'Dramatic (戲劇性)', tag: 'dramatic shadows, chiaroscuro' },
  { name: 'Studio (棚拍)', tag: 'soft studio lighting' }
];
```

### 6. 歷史紀錄模組

#### 儲存資料
```javascript
{
  "history": [
    {
      "id": 1709876543210,
      "prompt": "完整提示詞",
      "status": "success|queue|failed",
      "timestamp": "2026/5/4 下午2:30:15",
      "label": "Storyboard 1/4",
      "width": 512,
      "height": 1024,
      "seed": 123456789,
      "imageUrl": "http://127.0.0.1:8188/view?filename=...",
      "promptId": "comfyui-prompt-id"
    }
  ]
}
```

#### 功能
- 圖片預覽
- 提示詞查看
- 參數記錄
- 結果下載
- Lightbox 展示

---

## 資料結構

### AppState 全局狀態
```javascript
const appState = {
  selectedStyles: [],              // 已選風格
  selectedCharacters: [],          // 已選角色
  customArtists: [],              // 自訂藝術家
  artistImages: {},               // 藝術家預覽圖
  characterDatabase: {},          // 角色資料庫
  characterCSVData: [],           // CSV 原始資料
  storyboardFrames: [],           // 舊版分鏡
  storyboardMode: 'stacking',     // 分鏡模式
  storyboardData: {               // 新版分鏡資料
    variableItems: []
  },
  seedMode: 'first-random',       // 種子模式
  seedValue: -1,                  // 種子值
  history: [],                    // 歷史紀錄
  lightboxIndex: 0,               // Lightbox 索引
  lmStudioUrl: 'http://localhost:1234/v1/chat/completions',
  qwenEdit: {                     // QWEN EDIT 狀態
    enabled: false,
    uploadedImage: null,
    uploadedImageName: null,
    referenceWidth: 1024,
    referenceHeight: 1024
  },
  cameraMovements: null,          // 選中的運鏡
  cameraAngles: null,             // 選中的視角
  lightingEffects: null           // 選中的光影
};
```

---

## 檔案格式

### 檔名規則

#### 時間戳記格式
```
MMDD_HHMM
例：0208_1430 (2月8日 14:30)
```

#### NetaYume 系列
```
NetaYume_MMDD_HHMM_NNNNN.png

範例：
NetaYume_0208_1430_00001.png
NetaYume_0208_1430_00002.png
```

#### Z-IMAGE
```
z-image_MMDD_HHMM_NNNNN.png

範例：
z-image_0208_1505_00001.png
```

#### QWEN EDIT
```
QwenEdit_MMDD_HHMM_NNNNN.png

範例：
QwenEdit_0208_1520_00001.png
QwenEdit_0208_1520_00002.png
```

### CSV 格式

#### 角色資料庫
```csv
類別,類型,作品,角色英文名,角色中文名,標籤
動漫,少年,航海王,Luffy,魯夫,#luffy
動漫,少女,原神,Paimon,派蒙,#paimon
遊戲,RPG,艾爾登法環,Malenia,瑪蓮妮亞,#malenia
```

#### 藝術家風格
```csv
英文名稱,中文名稱,標籤,描述
Makoto Shinkai,新海誠,@shinkai_makoto,精緻光影細膩背景
Studio Ghibli,吉卜力,@studio_ghibli,溫暖治癒手繪風格
```

---

## 系統需求

### 伺服器需求

#### ComfyUI
```yaml
軟體: ComfyUI (最新版)
Python: 3.10+
CUDA: 11.8+ (NVIDIA GPU)
VRAM: 8GB+ (推薦 12GB+)
儲存空間: 50GB+ (模型檔案)
```

#### LM Studio
```yaml
軟體: LM Studio (最新版)
模型: 任何支援 OpenAI API 的本地 LLM
RAM: 16GB+
```

### 瀏覽器需求
```yaml
支援瀏覽器:
  - Chrome 90+
  - Firefox 88+
  - Edge 90+
  - Safari 14+

必要功能:
  - ES6+ JavaScript
  - LocalStorage
  - Fetch API
  - FormData API
```

---

## 部署說明

### 1. 安裝 ComfyUI
```bash
git clone https://github.com/comfyanonymous/ComfyUI
cd ComfyUI
pip install -r requirements.txt
```

### 2. 下載模型

#### NetaYume 模型
```
models/checkpoints/
├── netayumeLuminaNetaLumina_v40.safetensors
└── NetaYumev35_pretrained_all_in_one.safetensors

models/loras/
└── netayume_v3.5_lightning_v1.0.safetensors
```

#### Z-IMAGE 模型
```
models/diffusion_models/
└── z_image_turbo_bf16.safetensors

models/text_encoders/
└── qwen_3_4b.safetensors

models/vae/
└── ae.safetensors
```

#### QWEN EDIT 模型
```
models/checkpoints/
└── Qwen-Rapid-AIO-NSFW-v23.safetensors
```

### 3. 安裝自訂節點
```bash
cd ComfyUI/custom_nodes
# 安裝 TextEncodeQwenImageEditPlus 節點
# (根據實際節點包安裝)
```

### 4. 啟動服務

#### 啟動 ComfyUI
```bash
python main.py --listen 127.0.0.1 --port 8188
```

#### 啟動 LM Studio
```
1. 開啟 LM Studio
2. 載入本地 LLM 模型
3. 啟動 Local Server (Port 1234)
```

### 5. 部署 STAR Web App
```bash
# 直接在瀏覽器開啟
open index.html

# 或使用本地伺服器
python -m http.server 8080
# 訪問 http://localhost:8080
```

---

## 效能優化

### 1. 圖片生成速度

| 模型 | Steps | 預估時間 (RTX 3090) |
|------|-------|-------------------|
| NetaYume v4.0 | 25 | ~15 秒 |
| NetaYume + Lightning | 20 | ~8 秒 (2x 加速) |
| Z-IMAGE | 4 | ~3 秒 |
| QWEN EDIT | 4 | ~5 秒 |

### 2. 記憶體使用

| 模型 | VRAM 使用 | RAM 使用 |
|------|----------|---------|
| NetaYume v4.0 | ~8 GB | ~4 GB |
| Z-IMAGE | ~6 GB | ~3 GB |
| QWEN EDIT | ~7 GB | ~3 GB |

### 3. 建議配置

#### 最低配置
- GPU: NVIDIA RTX 2060 (6GB VRAM)
- RAM: 16 GB
- 儲存: 50 GB SSD

#### 推薦配置
- GPU: NVIDIA RTX 3090 (24GB VRAM)
- RAM: 32 GB
- 儲存: 100 GB NVMe SSD

#### 專業配置
- GPU: NVIDIA RTX 4090 (24GB VRAM)
- RAM: 64 GB
- 儲存: 500 GB NVMe SSD

---

## 故障排除

### 常見問題

#### 1. ComfyUI 連線失敗
```
症狀: 連線狀態顯示「離線」
解決:
1. 確認 ComfyUI 已啟動
2. 檢查 URL: http://127.0.0.1:8188
3. 測試 /system_stats 端點
```

#### 2. LM Studio API 無回應
```
症狀: AI 生成提示詞失敗
解決:
1. 確認 LM Studio Local Server 已啟動
2. 檢查 Port 1234 是否被佔用
3. 確認模型已載入
```

#### 3. QWEN EDIT LoadImage 錯誤
```
症狀: Invalid image file: QwenEdit_XXXX.png
解決:
1. 確認圖片檔案存在於 ComfyUI output 目錄
2. 檢查 LoadImage 節點的 type 參數
3. 確認 subfolder 路徑正確
```

#### 4. 模型驗證失敗
```
症狀: Prompt outputs failed validation
解決:
1. 檢查模型檔案是否正確安裝
2. 確認自訂節點已安裝
3. 重啟 ComfyUI
```

---

## 版本歷史

### v1.0.0 (2026-05-04)
- ✅ 完整實作 NetaYume v35/v40 工作流
- ✅ 整合 Lightning LoRA 加速功能
- ✅ 新增 Z-IMAGE 模型支援
- ✅ 實作 QWEN EDIT 連續編輯模式
- ✅ 內建 28 種風格庫
- ✅ 角色圖鑑 CSV 匯入
- ✅ 劇情分鏡自動生成
- ✅ 視覺效果參數庫 (運鏡、視角、光影)
- ✅ 歷史紀錄管理
- ✅ UI 優化：可摺疊 ComfyUI 設定面板
- ✅ 檔名自動加上時間戳記

---

## 授權與鳴謝

### 使用的開源專案
- **ComfyUI:** [https://github.com/comfyanonymous/ComfyUI](https://github.com/comfyanonymous/ComfyUI)
- **LM Studio:** [https://lmstudio.ai](https://lmstudio.ai)

### AI 模型
- **NetaYume Lumina:** 動漫風格 SD3 模型
- **Z-IMAGE:** 快速圖片生成模型
- **QWEN EDIT:** 圖片編輯模型

---

## 附錄

### A. 快捷鍵

| 功能 | 快捷鍵 |
|------|-------|
| 生成提示詞 | 無 |
| 極速生圖 | 無 |
| 清空提示詞 | 無 |
| 複製提示詞 | 無 |

### B. API 端點完整列表

#### LM Studio
```
POST http://localhost:1234/v1/chat/completions
```

#### ComfyUI
```
POST   http://127.0.0.1:8188/prompt
GET    http://127.0.0.1:8188/history/{prompt_id}
GET    http://127.0.0.1:8188/view
POST   http://127.0.0.1:8188/upload/image
GET    http://127.0.0.1:8188/system_stats
```

### C. 提示詞範本

#### 高畫質標籤
```
masterpiece, best quality, ultra-detailed, 8k, high resolution, sharp focus
```

#### 負面提示詞
```
blurry, worst quality, low quality, deformed hands, bad anatomy, extra limbs, 
poorly drawn face, mutated, extra eyes, bad proportions
```

#### NSFW 標籤
```
nsfw
```

---

**文檔結束**

---

*此文檔由 STAR 開發團隊維護*  
*如有問題或建議，請在 GitHub Issues 中提出*
