import { Component, HostListener, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ChatbotService, ChatSession, Message } from './chatbot.service';

@Component({
  selector: 'app-chatbot',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './chatbot.component.html',
  styleUrls: ['./chatbot.component.scss']
})
export class ChatbotComponent implements OnInit {
  mode: 'collapsed' | 'minimized' | 'expanded' = 'collapsed';

  messageInput = '';
  showAttachments = false;
  isRecording = false;
  
  isProcessing = false; 

  chatHistory: ChatSession[] = [];
  messages: Message[] = [];
  currentSessionId: string | null = null;

  constructor(
    private chatbot: ChatbotService,
    private cdr: ChangeDetectorRef 
  ) {}

  ngOnInit() {
    this.loadHistory();
  }

  openMinimized() { 
    this.mode = 'minimized'; 
    this.startNewChat();
  }
  
  openExpanded()  { this.mode = 'expanded'; }
  closeChat()     { this.mode = 'collapsed'; }
  closeSidebar()  { this.mode = 'collapsed'; }

  loadHistory() {
    this.chatbot.getChatHistory().subscribe({
      next: (sessions) => { 
        this.chatHistory = sessions; 
        this.cdr.detectChanges();
      },
      error: (err) => console.error('Failed to load history', err)
    });
  }

  loadSession(sessionId: string) {
    if (this.isProcessing) return; 
    
    this.currentSessionId = sessionId;
    this.chatbot.getChatSession(sessionId).subscribe({
      next: (msgs) => { 
        this.messages = msgs; 
        this.cdr.detectChanges(); 
        this.scrollToBottom();
      },
      error: (err) => console.error('Failed to load messages', err)
    });
  }

  startNewChat() {
    this.currentSessionId = null;
    this.messages = [];
    this.messageInput = '';
    this.isProcessing = false;
    this.cdr.detectChanges();
  }

  sendMessage() {
    const text = this.messageInput.trim();
    
    if (!text || this.isProcessing) return;

    this.isProcessing = true;
    
    const userMsg: Message = {
      id: Date.now().toString(),
      text,
      sender: 'user',
      timestamp: new Date()
    };
    this.messages.push(userMsg);
    this.messageInput = '';
    
    this.cdr.detectChanges();
    this.scrollToBottom();

    this.chatbot.sendMessage(text, this.currentSessionId ?? undefined).subscribe({
      next: (res) => {
        if (!this.currentSessionId && res.conversation_id) {
          this.currentSessionId = String(res.conversation_id);
          this.loadHistory();
        }

        const botMsg: Message = {
          id: String(res.assistant_message?.id || Date.now()),
          text: res.assistant_message?.content || '...',
          sender: 'bot',
          timestamp: new Date(res.assistant_message?.created_at || new Date())
        };
        
        this.messages.push(botMsg);
        this.cdr.detectChanges();
        this.scrollToBottom();
      },
      error: (err) => {
        console.error('Send failed', err);
        this.messages.push({
          id: Date.now().toString(),
          text: 'Sorry, there was an error during the connection.',
          sender: 'bot',
          timestamp: new Date()
        });
        this.cdr.detectChanges();
      },
      complete: () => { 
        this.isProcessing = false; 
        this.cdr.detectChanges();
      }
    });
  }

  private scrollToBottom() {
    setTimeout(() => {
      const container = document.querySelector('.messages-container');
      if(container) container.scrollTop = container.scrollHeight;
    }, 50);
  }

  toggleAttachments(event: MouseEvent) {
    event.stopPropagation();
    this.showAttachments = !this.showAttachments;
  }

  @HostListener('document:click')
  onDocumentClick() {
    if (this.showAttachments) this.showAttachments = false;
  }

  uploadFile(type: string) {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = type === 'image' ? 'image/*' : type === 'document' ? '.pdf,.doc,.docx,.txt' : 'video/*';
    input.onchange = (e: any) => {
      const file = e.target.files[0];
      if (file) this.sendWithFile(file);
    };
    input.click();
    this.showAttachments = false;
  }

  private sendWithFile(file: File) {
    if (this.isProcessing) return;
    this.isProcessing = true;
    this.cdr.detectChanges();

    this.chatbot.sendFile(file, '', this.currentSessionId ?? undefined).subscribe({
      next: (res) => {
        if (!this.currentSessionId && res.conversation_id) {
          this.currentSessionId = String(res.conversation_id);
          this.loadHistory();
        }
        const botMsg: Message = {
          id: String(res.assistant_message?.id),
          text: res.assistant_message?.content || 'The file has been received',
          sender: 'bot',
          timestamp: new Date()
        };
        this.messages.push(botMsg);
        this.cdr.detectChanges();
      },
      error: (err) => console.error('Upload failed', err),
      complete: () => { this.isProcessing = false; this.cdr.detectChanges(); }
    });
  }

  toggleVoiceInput() {
    if (this.isRecording) return;
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) { alert('Your browser does not support voice recognition.'); return; }

    this.isRecording = true;
    const rec = new SR();
    rec.lang = 'ar-EG';
    rec.onresult = (e: any) => {
      this.messageInput = e.results[0][0].transcript;
      this.isRecording = false;
      this.cdr.detectChanges();
    };
    rec.onerror = () => { this.isRecording = false; this.cdr.detectChanges(); };
    rec.start();
  }
}