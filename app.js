const axios = require('axios');
const express = require('express');
const app = express();
const port = 4000;

// 假设Const.Data是一个全局对象，用于存储翻译令牌
const Const = {
  Data: {
    TranslateToken: null
  }
};

// 更新token的函数
const updateToken = async () => {
  try {
    // 添加请求头
    const config = {
      headers: {
        'User-Agent': 'Apifox/1.0.0 (https://apifox.com)',
        'Accept': '*/*',
        'Host': 'edge.microsoft.com',
        'Connection': 'keep-alive'
      }
    };

    const response = await axios.get('https://edge.microsoft.com/translate/auth', config);
    if (response.status === 200) {
      Const.Data.TranslateToken = response.data; // 直接将返回的字符串设置为token
    } else {
      console.error('Failed to get token, status code: ' + response.status);
    }
  } catch (error) {
    console.error('Failed to update token:', error);
  }
};

// 定时每分钟更新token
setInterval(updateToken, 60000); // 每60000毫秒（即1分钟）执行一次

app.use(express.static('static'));
app.use(express.json());

app.post('/translate', async (req, res) => {
  const { text, lang } = req.body;
  if (!text || !lang) {
    return res.status(400).send('Text and language are required');
  }

  const url = `https://api.cognitive.microsofttranslator.com/translate?api-version=3.0&to=${lang}&textType=plain`;
  const headers = {
    'User-Agent': 'Apifox/1.0.0 (https://apifox.com)',
    'Accept': '*/*',
    'Host': 'api.cognitive.microsofttranslator.com',
    'Connection': 'keep-alive',
    'Authorization': `Bearer ${Const.Data.TranslateToken}`, // 使用更新后的token
    'Content-Type': 'application/json' // 设置正确的Content-Type
  };

  try {
    var data = JSON.stringify([{ 'Text': text }]); // 确保请求体是JSON格式
    const response = await axios.post(url, data, { headers });
    const translatedText = response.data[0].translations[0].text;
    if (translatedText) {
      res.send(translatedText);
    } else {
      res.status(500).send('Translation failed');
    }
  } catch (error) {
    if (error.response && error.response.status === 401) {
      // 如果是401错误，尝试更新token并重试
      await updateToken();
      if (Const.Data.TranslateToken) {
        headers['Authorization'] = `Bearer ${Const.Data.TranslateToken}`;
        const response = await axios.post(url, data, { headers });
        const translatedText = response.data[0].translations[0].text;
        if (translatedText) {
          res.send(translatedText);
        } else {
          res.status(500).send('Translation failed after retry');
        }
      } else {
        res.status(500).send('Token update failed, cannot retry');
      }
    } else {
      console.error('Error during request:', error);
      res.status(500).send('Error during translation');
    }
  }
});

app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.listen(port, () => {
  console.log(`App running at http://localhost:${port}/`);
});

exports.app = app;