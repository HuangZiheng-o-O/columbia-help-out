# Task Plaza - 团队统一样式规范

> ⚠️ **重要提示给 AI 助手**：这是团队统一的设计模板，所有组件开发必须基于 `style.css` 中定义的变量和类名，保持整体风格一致。

---

## 📋 项目概述

- **项目名称**：Task Plaza（任务广场）
- **主色调**：`#173A81` (Royal Blue)
- **设计标准**：符合 WCAG 2.2 AA 无障碍标准
- **技术栈**：React + 纯 CSS（无 Tailwind）

---

## 📁 文件说明

| 文件 | 用途 |
|------|------|
| `style.css` | **统一样式文件** - 包含所有设计变量和组件样式，团队必须使用 |
| `task-plaza.html` | **参考示例** - 展示首页卡片列表的 HTML 结构和 class 用法 |

---

## 🚀 使用方式

### React 项目
```tsx
// 在 src/index.tsx 或 src/App.tsx 中引入
import './style.css';
```

### HTML 项目
```html
<link rel="stylesheet" href="style.css">
```

---

## 🎨 设计变量速查

### 主色调 (必须使用这些变量)
```css
--color-primary-50:  #E8EEF7   /* 最浅 - 背景高亮 */
--color-primary-100: #C5D4EB
--color-primary-200: #9BB5DB
--color-primary-300: #6E94C9
--color-primary-400: #4A75B5
--color-primary-500: #2D5A9E
--color-primary-600: #173A81   /* ★ 主色 - 按钮/链接 */
--color-primary-700: #122E68   /* hover 状态 */
--color-primary-800: #0D2250
--color-primary-900: #081738
```

### 背景色
```css
--color-bg-page:    #F7F9FC   /* 页面背景 */
--color-bg-surface: #FFFFFF   /* 卡片/容器 */
--color-bg-subtle:  #EEF2F7   /* 细微区分 */
--color-bg-sidebar: #173A81   /* 侧边栏 */
```

### 文字色
```css
--color-text-strong:   #0F1624   /* 标题 */
--color-text-default:  #1F2937   /* 正文 */
--color-text-muted:    #4D5D73   /* 次要 */
--color-text-soft:     #6E7F96   /* 辅助 */
--color-text-disabled: #9AA8BC   /* 禁用 */
```

### 边框色
```css
--color-border-subtle:  #DDE4EE
--color-border-default: #C4CFDD
```

### 语义色
```css
--color-success: #059669
--color-warning: #D97706
--color-error:   #DC2626
```

### 标签色 - 类别
```css
--tag-campus-bg / --tag-campus-text     /* 蓝色 - 校园 */
--tag-daily-bg / --tag-daily-text       /* 黄色 - 日常 */
--tag-academic-bg / --tag-academic-text /* 绿色 - 学术 */
--tag-other-bg / --tag-other-text       /* 紫色 - 其他 */
```

### 标签色 - 紧急程度
```css
--tag-urgent-bg / --tag-urgent-text     /* 红色 - 紧急 */
--tag-flexible-bg / --tag-flexible-text /* 蓝色 - 灵活 */
--tag-normal-bg / --tag-normal-text     /* 灰色 - 普通 */
```

### 标签色 - 验证状态
```css
--tag-verified-bg / --tag-verified-text /* 绿色 - 已验证 */
```

### 间距
```css
--spacing-xs:  4px
--spacing-sm:  8px
--spacing-md:  12px
--spacing-lg:  16px
--spacing-xl:  24px
--spacing-2xl: 32px
```

### 圆角
```css
--radius-sm:   6px
--radius-md:   8px
--radius-lg:   12px
--radius-xl:   16px
--radius-full: 100px  /* 胶囊形 */
```

### 阴影
```css
--shadow-sm: 0 1px 2px rgba(15, 22, 36, 0.05)
--shadow-md: 0 4px 6px rgba(15, 22, 36, 0.07)
--shadow-lg: 0 8px 24px rgba(23, 58, 129, 0.1)
```

### 焦点环 (无障碍)
```css
--focus-ring: 0 0 0 3px rgba(23, 58, 129, 0.3)
```

---

## 🏷️ 可用 Class 列表

### 布局
- `.app-container` - 整体容器 (flex)
- `.main-content` - 主内容区
- `.sidebar` - 侧边栏
- `.sidebar-icon` / `.sidebar-icon.active` - 侧边栏图标

### 导航
- `.header` - 顶部导航
- `.logo` - Logo 文字
- `.search-box` / `.search-input` / `.search-icon` - 搜索框

### 按钮
- `.btn-post` / `.btn-primary` - 主按钮 (填充)
- `.btn-action` - 操作按钮基类
- `.btn-ask` - 轮廓按钮
- `.btn-claim` - 填充按钮

### 排序
- `.sort-bar` - 排序栏
- `.sort-label` - "Sort by:" 标签
- `.sort-options` - 选项容器
- `.sort-btn` / `.sort-btn.active` - 排序按钮

### 任务列表
- `.task-list` - 任务列表容器
- `.task-grid` - 网格布局

### 任务卡片
- `.task-card` - 卡片容器
- `.task-title` - 标题
- `.task-meta` - 标签区
- `.task-credits` - 积分
- `.task-details` / `.task-details-item` / `.task-details-icon` - 详情
- `.task-actions` - 按钮区

### 标签
- `.task-tag` - 标签基类
- `.task-tag.campus` / `.daily` / `.academic` / `.other` - 类别
- `.task-tag.urgent` / `.flexible` / `.normal` - 紧急程度
- `.task-tag.verified` - 验证状态

### 表单
- `.form-group` - 表单组
- `.form-label` - 标签
- `.form-input` / `.form-input.error` - 输入框
- `.form-hint` / `.form-error` - 提示文字

### 提示框
- `.alert` - 基类
- `.alert-info` / `.alert-success` / `.alert-warning` / `.alert-error`

### 通用
- `.card` - 通用卡片
- `.text-strong` / `.text-muted` / `.text-soft` - 文字颜色
- `.font-medium` / `.font-semibold` / `.font-bold` - 字重
- `.sr-only` - 屏幕阅读器专用 (无障碍)

---

## ⚠️ 开发规范

1. **必须使用 CSS 变量**：不要硬编码颜色值，使用 `var(--color-xxx)`
2. **复用现有 class**：优先使用 `style.css` 中已定义的类名
3. **保持命名一致**：新组件命名风格参考现有 class（如 `.task-xxx`）
4. **无障碍**：按钮/链接必须有焦点状态，使用 `--focus-ring`
5. **响应式**：768px 断点已定义，遵循移动优先

---

## 📖 参考示例

打开 `task-plaza.html` 查看完整的首页实现，包括：
- 侧边栏导航
- 顶部搜索栏
- Sort by 排序栏
- 任务卡片列表（含类别/紧急程度/验证标签）

**这是团队统一的 UI 模板，所有页面都要保持这个风格！**
