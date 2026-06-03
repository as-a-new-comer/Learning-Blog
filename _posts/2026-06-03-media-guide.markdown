---
layout: post
title:  "多模态内容渲染指南"
date:   2026-06-03 00:00:00 +0800
categories: guide
tags: guide media pdf
mathjax: false
---

## PDF 嵌入

把 PDF 放到 `files/` 目录，帖子里写一行：

```liquid
{% include pdf-viewer.html src="/files/example.pdf" %}
```

> 浏览器原生支持，PC 和手机都能看。把 PDF 放进 `files/` 目录即可。

---

## PPT / PPTX

PPTX 无法直接在浏览器渲染。两种方案：

| 方案 | 做法 |
|------|------|
| **转 PDF** | PPT 导出为 PDF，放入 `files/`，用上面的 PDF 嵌入 |
| **在线托管** | 上传到 [slides.com](https://slides.com) 或 Google Slides，用 iframe 嵌入 |

### iframe 嵌入外部幻灯片：

```html
<iframe src="https://docs.google.com/presentation/d/你的ID/embed"
  width="100%" height="480" style="border:none;">
</iframe>
```

---

## 视频

```html
<video controls width="100%">
  <source src="/Learning-Blog/files/video.mp4" type="video/mp4">
</video>
```

## 音频

```html
<audio controls>
  <source src="/Learning-Blog/files/audio.mp3" type="audio/mpeg">
</audio>
```

---

## 图片

```markdown
![描述](/Learning-Blog/assets/images/photo.png)
```

> Jekyll 原生支持，无需额外配置。
