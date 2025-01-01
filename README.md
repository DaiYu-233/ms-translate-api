# ms-translate-api

## Introduction

为了方便调用edge浏览器的翻译接口翻译文本, 而使用nodejs编写的轻量项目.

A lightweight project written in Node.js for the convenience of calling the translation interface of Edge browser to translate text

## Get Started

```bash
git clone https://github.com/DaiYu-233/ms-translate-api.git
cd ms-translate-api
npm install
node app.js 5408
```

## Call Api

###  · POST  /translate 

```json
{
  "text": "Hello",
  "lang": "zh"
}
```

