require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

const TaskDispatcher = require('./task_dispatcher');
const ResourceManager = require('./resource_manager');
const ExtensionHub = require('./extension_hub');
const HealthMonitor = require('./health_monitor');

const app = express();
const PORT = process.env.PORT || 3000;

const dispatcher = new TaskDispatcher();
const resources = new ResourceManager();
const extensions = new ExtensionHub();
const monitor = new HealthMonitor();

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true }));

app.use((req, res, next) => {
  req.system = { dispatcher, resources, extensions };
  monitor.registerRequest(req);
  next();
});

app.get('/api/system/status', async (req, res) => {
  const status = {
    systemName: 'Chat Vider',
    running: true,
    version: '1.0.0',
    owner: 'Thanva Phupingbut 244',
    health: await monitor.getSummary(),
    resources: resources.getCurrentUsage()
  };
  res.json(status);
});

app.post('/api/task/submit', async (req, res) => {
  try {
    const result = await dispatcher.addTask(req.body);
    res.json({ ok: true, taskId: result.id, position: result.position });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

app.get('/api/task/:id', async (req, res) => {
  const task = dispatcher.getTask(req.params.id);
  task ? res.json(task) : res.status(404).json({ error: 'ไม่พบรายการ' });
});

app.use('/static', express.static(path.join(__dirname, '../5_FRONTEND_PUBLIC')));
app.get('/', (req, res) => res.sendFile(path.join(__dirname, '../5_FRONTEND_PUBLIC/index.html')));

app.listen(PORT, () => {
  console.log(`✅ 🧠 Chat Vider Server ทำงานที่พอร์ต ${PORT}`);
  monitor.start();
  dispatcher.startProcessing();
});

module.exports = app;
const textToSpeech = require('@google-cloud/text-to-speech');
app.post('/api/voice/synthesize', async (req, res) => {
  try {
    const { text, lang = 'th-TH' } = req.body;
    const client = new textToSpeech.TextToSpeechClient();
    
    const request = {
      input: { text },
      voice: { languageCode: lang, ssmlGender: 'NEUTRAL' },
      audioConfig: { audioEncoding: 'MP3' },
    };

    const [response] = await client.synthesizeSpeech(request);
    res.set({ 'Content-Type': 'audio/mpeg' });
    res.send(response.audioContent);
  } catch (err) {
    res.json({ ok: true, note: 'ใช้ระบบเสียงเบราว์เซอร์แทน', fallback: true });
  }
});
