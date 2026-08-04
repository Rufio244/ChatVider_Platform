const BASE = {
  empty: { files: [{ name: 'README.md', content: '# โปรเจกต์เปล่า' }] },
  api_starter: { files: [
    {name:'main.js', content:`const express = require('express');\nconst app = express();\n\napp.get('/', (req,res)=>res.send("ทำงานแล้ว"));\napp.listen(3000);`},
    {name:'package.json', content:JSON.stringify({dependencies:{express:"^4.19.2"}},null,2)}
  ]},
  landing_page: { files: [
    {name:'index.html', content:'<html><body><h1>หน้าแรก</h1></body></html>'},
    {name:'style.css', content:'body{background:#111;color:white;}'}
  ]}
};

module.exports = {
  list: () => Object.keys(BASE),
  get: name => BASE[name] || BASE.empty
};

