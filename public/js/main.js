function getSessionId() {
  let sessionId = localStorage.getItem("sessionId");
  if (!sessionId) {
    sessionId = crypto.randomUUID();
    localStorage.setItem("sessionId", sessionId);
  }
  return sessionId;
}

document.getElementById('pdfInput').addEventListener('change', async (e) => {
  const file = e.target.files[0];
  const analysisDepth = document.getElementById('analysisDepth').value;

  const formData = new FormData();
  formData.append('statement', file);
  formData.append('sessionId', getSessionId());
  formData.append('analysisDepth', analysisDepth);

  appendMessage("Uploading your bank statement...", "assistant");

  const res = await fetch('/api/upload', {
    method: 'POST',
    body: formData
  });

  const data = await res.json();
  appendMessage(data.insight || 'No insight received.', "assistant");
});


document.getElementById('sendBtn').addEventListener('click', async () => {
  const input = document.getElementById('questionInput');
  const message = input.value.trim();
  if (!message) return;

  appendMessage(message, 'user');
  input.value = '';
  showTypingIndicator();

  const res = await fetch('/api/upload/ask', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ sessionId: getSessionId(), question: message })
  });

  const data = await res.json();
  removeTypingIndicator();
  appendMessage(data.answer, 'bot');
});

function appendMessage(text, sender = 'bot') {
  console.log(sender)
  const div = document.createElement('div');
  div.className = `message ${sender}`;

  if (sender === 'bot') {
    div.innerHTML = marked.parse(text);
  } else {
    div.innerText = text;
  }

  const box = document.getElementById('response');
  box.appendChild(div);
  box.scrollTop = box.scrollHeight;
}

function showTypingIndicator() {
  const typing = document.createElement('div');
  typing.className = 'message bot';
  typing.id = 'typing';
  typing.innerText = 'Assistant is typing…';
  document.getElementById('response').appendChild(typing);
  document.getElementById('response').scrollTop = document.getElementById('response').scrollHeight;
}

function removeTypingIndicator() {
  const typing = document.getElementById('typing');
  if (typing) typing.remove();
}

window.addEventListener('DOMContentLoaded', async () => {
  const sessionId = getSessionId();
  try {
    const res = await fetch(`/api/upload/history?sessionId=${sessionId}`);
    const history = await res.json();
    history.forEach(entry => appendMessage(entry.content, entry.role));
  } catch (err) {
    console.error('Error loading history:', err);
  }
});

document.getElementById('clearChatBtn').addEventListener('click', () => {
  if (confirm('Are you sure you want to clear this chat?')) {
    localStorage.removeItem('sessionId');
    document.getElementById('response').innerHTML = '';
    getSessionId();
    window.location.reload();
  }
});