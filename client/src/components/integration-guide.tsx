
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Code, Copy, ExternalLink, Globe, Mail, Smartphone } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAssistantStore } from '@/store/assistant-store';

export function IntegrationGuide() {
  const { currentAssistant } = useAssistantStore();
  const { toast } = useToast();
  
  const baseUrl = window.location.origin;

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied!",
      description: "Code copied to clipboard",
    });
  };

  if (!currentAssistant) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-muted-foreground">Deploy an assistant to see integration options.</p>
        </CardContent>
      </Card>
    );
  }

  const webIntegration = `<!-- Add this to your website -->
<div id="ai-assistant-chat"></div>
<script>
const assistantId = ${currentAssistant.id};
const baseUrl = '${baseUrl}';
let sessionId = 'web_' + Date.now();

function createChatWidget() {
  const container = document.getElementById('ai-assistant-chat');
  container.innerHTML = \`
    <div style="max-width: 400px; border: 1px solid #ddd; border-radius: 8px; padding: 16px;">
      <h3>${currentAssistant.name}</h3>
      <div id="messages" style="height: 300px; overflow-y: auto; margin: 16px 0;"></div>
      <div style="display: flex; gap: 8px;">
        <input id="messageInput" type="text" placeholder="Type your message..." style="flex: 1; padding: 8px; border: 1px solid #ddd; border-radius: 4px;" />
        <button id="sendBtn" style="padding: 8px 16px; background: #007bff; color: white; border: none; border-radius: 4px;">Send</button>
      </div>
    </div>
  \`;

  document.getElementById('sendBtn').onclick = sendMessage;
  document.getElementById('messageInput').onkeypress = (e) => {
    if (e.key === 'Enter') sendMessage();
  };
}

async function sendMessage() {
  const input = document.getElementById('messageInput');
  const message = input.value.trim();
  if (!message) return;

  const messagesDiv = document.getElementById('messages');
  messagesDiv.innerHTML += \`<div><strong>You:</strong> \${message}</div>\`;
  input.value = '';

  try {
    const response = await fetch(\`\${baseUrl}/api/integrate/chat/\${assistantId}\`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message, sessionId })
    });

    const data = await response.json();
    messagesDiv.innerHTML += \`<div><strong>${currentAssistant.name}:</strong> \${data.response}</div>\`;
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
  } catch (error) {
    messagesDiv.innerHTML += \`<div style="color: red;">Error: \${error.message}</div>\`;
  }
}

createChatWidget();
</script>`;

  const gmailIntegration = `// Gmail Add-on Integration (Google Apps Script)
function onGmailMessage(e) {
  const assistantId = ${currentAssistant.id};
  const baseUrl = '${baseUrl}';
  
  // Get email content
  const message = e.messageMetadata.subject + "\\n\\n" + getEmailBody(e);
  
  // Send to AI assistant
  const response = UrlFetchApp.fetch(\`\${baseUrl}/api/integrate/chat/\${assistantId}\`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    payload: JSON.stringify({
      message: "Please help me respond to this email: " + message,
      sessionId: "gmail_" + e.messageMetadata.messageId
    })
  });
  
  const data = JSON.parse(response.getContentText());
  
  // Create draft response
  createDraftResponse(e.messageMetadata.messageId, data.response);
}

function getEmailBody(e) {
  // Implementation to extract email body
  return "Email content here";
}

function createDraftResponse(messageId, response) {
  // Implementation to create draft response in Gmail
}`;

  const mobileAppIntegration = `// React Native / Mobile App Integration
import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView } from 'react-native';

const ChatAssistant = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const assistantId = ${currentAssistant.id};
  const baseUrl = '${baseUrl}';
  const sessionId = 'mobile_' + Date.now();

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');

    try {
      const response = await fetch(\`\${baseUrl}/api/integrate/chat/\${assistantId}\`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: input, sessionId })
      });

      const data = await response.json();
      const aiMessage = { role: 'assistant', content: data.response };
      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  return (
    <View style={{ flex: 1, padding: 16 }}>
      <ScrollView style={{ flex: 1 }}>
        {messages.map((msg, index) => (
          <Text key={index} style={{ 
            padding: 8, 
            backgroundColor: msg.role === 'user' ? '#e3f2fd' : '#f5f5f5',
            marginBottom: 8 
          }}>
            {msg.role === 'user' ? 'You' : '${currentAssistant.name}'}: {msg.content}
          </Text>
        ))}
      </ScrollView>
      <View style={{ flexDirection: 'row' }}>
        <TextInput
          style={{ flex: 1, borderWidth: 1, padding: 8 }}
          value={input}
          onChangeText={setInput}
          placeholder="Type your message..."
        />
        <TouchableOpacity onPress={sendMessage} style={{ padding: 8, backgroundColor: '#007bff' }}>
          <Text style={{ color: 'white' }}>Send</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};`;

  const apiIntegration = `// Direct API Integration
const assistantId = ${currentAssistant.id};
const baseUrl = '${baseUrl}';

// Simple chat function
async function chatWithAssistant(message, sessionId = null) {
  try {
    const response = await fetch(\`\${baseUrl}/api/integrate/chat/\${assistantId}\`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: message,
        sessionId: sessionId || 'api_' + Date.now()
      })
    });

    if (!response.ok) {
      throw new Error(\`HTTP error! status: \${response.status}\`);
    }

    const data = await response.json();
    return {
      response: data.response,
      sessionId: data.sessionId,
      assistantName: data.assistantName
    };
  } catch (error) {
    console.error('Error chatting with assistant:', error);
    throw error;
  }
}

// Usage example
chatWithAssistant("Hello, how can you help me?")
  .then(result => {
    console.log('Assistant Response:', result.response);
    console.log('Session ID:', result.sessionId);
  })
  .catch(error => {
    console.error('Error:', error);
  });

// Get list of active assistants
async function getActiveAssistants() {
  const response = await fetch(\`\${baseUrl}/api/assistants/active\`);
  return response.json();
}`;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Code className="w-5 h-5" />
          Integration Guide
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Integrate "{currentAssistant.name}" into your applications
        </p>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="website" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="website" className="flex items-center gap-1">
              <Globe className="w-4 h-4" />
              Website
            </TabsTrigger>
            <TabsTrigger value="gmail" className="flex items-center gap-1">
              <Mail className="w-4 h-4" />
              Gmail
            </TabsTrigger>
            <TabsTrigger value="mobile" className="flex items-center gap-1">
              <Smartphone className="w-4 h-4" />
              Mobile
            </TabsTrigger>
            <TabsTrigger value="api" className="flex items-center gap-1">
              <Code className="w-4 h-4" />
              API
            </TabsTrigger>
          </TabsList>

          <TabsContent value="website" className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2">Website Integration</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Add this code to any webpage to embed your assistant as a chat widget.
              </p>
              <div className="relative">
                <pre className="bg-muted p-4 rounded-lg text-sm overflow-x-auto">
                  <code>{webIntegration}</code>
                </pre>
                <Button
                  size="sm"
                  variant="outline"
                  className="absolute top-2 right-2"
                  onClick={() => copyToClipboard(webIntegration)}
                >
                  <Copy className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="gmail" className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2">Gmail Add-on Integration</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Use Google Apps Script to integrate your assistant with Gmail for email assistance.
              </p>
              <div className="relative">
                <pre className="bg-muted p-4 rounded-lg text-sm overflow-x-auto">
                  <code>{gmailIntegration}</code>
                </pre>
                <Button
                  size="sm"
                  variant="outline"
                  className="absolute top-2 right-2"
                  onClick={() => copyToClipboard(gmailIntegration)}
                >
                  <Copy className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="mobile" className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2">Mobile App Integration</h3>
              <p className="text-sm text-muted-foreground mb-4">
                React Native example for integrating your assistant into mobile apps.
              </p>
              <div className="relative">
                <pre className="bg-muted p-4 rounded-lg text-sm overflow-x-auto">
                  <code>{mobileAppIntegration}</code>
                </pre>
                <Button
                  size="sm"
                  variant="outline"
                  className="absolute top-2 right-2"
                  onClick={() => copyToClipboard(mobileAppIntegration)}
                >
                  <Copy className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="api" className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2">Direct API Integration</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Use the REST API directly for custom integrations.
              </p>
              <div className="relative">
                <pre className="bg-muted p-4 rounded-lg text-sm overflow-x-auto">
                  <code>{apiIntegration}</code>
                </pre>
                <Button
                  size="sm"
                  variant="outline"
                  className="absolute top-2 right-2"
                  onClick={() => copyToClipboard(apiIntegration)}
                >
                  <Copy className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <div className="mt-6 p-4 bg-muted rounded-lg">
          <h4 className="font-semibold mb-2">Integration Endpoints</h4>
          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2">
              <Badge variant="outline">POST</Badge>
              <code>/api/integrate/chat/{currentAssistant.id}</code>
              <span className="text-muted-foreground">- Send messages to your assistant</span>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline">GET</Badge>
              <code>/api/assistants/active</code>
              <span className="text-muted-foreground">- List all active assistants</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
