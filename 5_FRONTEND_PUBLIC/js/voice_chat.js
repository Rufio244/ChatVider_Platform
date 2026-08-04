class VoiceChat {
  constructor() {
    this.recognition = null;
    this.synth = window.speechSynthesis;
    this.isRecording = false;
    this.autoSpeak = true;
    this.initRecognition();
  }

  initRecognition() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      this.recognition = new SpeechRecognition();
      this.recognition.continuous = false;
      this.recognition.interimResults = true;
      this.recognition.lang = 'th-TH';

      this.recognition.onresult = (event) => {
        const transcript = Array.from(event.results)
          .map(r => r[0])
          .map(r => r.transcript)
          .join('');
        document.getElementById('messageInput').value = transcript;
      };

      this.recognition.onend = () => {
        this.isRecording = false;
        this.updateMicButton();
      };
    }
  }

  toggleRecording() {
    if (!this.recognition) return alert('เบราว์เซอร์ไม่รองรับการรับเสียง');
    
    if (this.isRecording) {
      this.recognition.stop();
    } else {
      this.recognition.start();
      this.isRecording = true;
    }
    this.updateMicButton();
  }

  updateMicButton() {
    const btn = document.getElementById('micBtn');
    btn.style.background = this.isRecording ? '#dc2626' : '#6366f1';
    btn.textContent = this.isRecording ? '⏹️' : '🎤';
  }

  speak(text) {
    if (!this.autoSpeak || !text) return;
    this.synth.cancel();
    const utter = new SpeechSynthesisUtterance(text);
    utter.lang = 'th-TH';
    utter.rate = 0.95;
    utter.pitch = 1;
    this.synth.speak(utter);
  }

  toggleAutoSpeak() {
    this.autoSpeak = !this.autoSpeak;
    alert(this.autoSpeak ? '🔊 เปิดตอบด้วยเสียง' : '🔇 ปิดตอบด้วยเสียง');
  }
}

window.voiceChat = new VoiceChat();
