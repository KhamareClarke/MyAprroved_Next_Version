'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { MessageCircle, Send, X, Users, Shield, AlertTriangle } from 'lucide-react';

interface ChatMessage {
  id: string;
  sender_id: string;
  sender_type: 'client' | 'tradesperson';
  message_text: string;
  created_at: string;
  is_read: boolean;
}

interface ChatRoom {
  id: string;
  job_id?: string | null;
  jobs?: {
    trade?: string;
    job_description?: string;
    postcode?: string;
  } | null;
  clients?: {
    first_name?: string;
    last_name?: string;
    email?: string;
  } | null;
  tradespeople?: {
    first_name?: string;
    last_name?: string;
    trade?: string;
    email?: string;
  } | null;
  updated_at: string;
}

interface DatabaseChatSystemProps {
  userId: string;
  userType: 'client' | 'tradesperson';
  isOpen: boolean;
  onClose: () => void;
}

export default function DatabaseChatSystem({ 
  userId, 
  userType, 
  isOpen, 
  onClose 
}: DatabaseChatSystemProps) {
  const [chatRooms, setChatRooms] = useState<ChatRoom[]>([]);
  const [selectedRoom, setSelectedRoom] = useState<ChatRoom | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load unread message count
  const loadUnreadCount = async () => {
    try {
      const response = await fetch(`/api/chat/unread-count?userId=${userId}&userType=${userType}`);
      const data = await response.json();
      
      if (response.ok) {
        setUnreadCount(data.unreadCount || 0);
      } else {
        console.error('Failed to load unread count:', data.error);
      }
    } catch (error) {
      console.error('Error loading unread count:', error);
    }
  };

  // Load chat rooms
  const loadChatRooms = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/chat/rooms?userId=${userId}&userType=${userType}`);
      const data = await response.json();
      
      if (response.ok) {
        setChatRooms(data.chatRooms || []);
        // Also load unread count
        loadUnreadCount();
      } else {
        console.error('Failed to load chat rooms:', data.error);
      }
    } catch (error) {
      console.error('Error loading chat rooms:', error);
    } finally {
      setLoading(false);
    }
  };

  // Load messages for a chat room
  const loadMessages = async (roomId: string) => {
    try {
      const response = await fetch(`/api/chat/messages?chatRoomId=${roomId}`);
      const data = await response.json();
      
      if (response.ok) {
        setMessages(data.messages || []);
        scrollToBottom();
      } else {
        console.error('Failed to load messages:', data.error);
      }
    } catch (error) {
      console.error('Error loading messages:', error);
    }
  };

  // Send a new message
  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedRoom) return;

    // Check for personal information in message
    const personalInfoPatterns = [
      /\b\d{4}[\s-]?\d{4}[\s-]?\d{4}[\s-]?\d{4}\b/, // Credit card
      /\b\d{3}[\s-]?\d{3}[\s-]?\d{4}\b/, // Phone number
      /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/, // Email
      /\b\d{5}[\s-]?\d{6}\b/, // UK National Insurance
      /\b\d{2}[\s-]?\d{2}[\s-]?\d{2}[\s-]?\d{2}[\s-]?\d{2}\b/, // UK Driving License
    ];

    const containsPersonalInfo = personalInfoPatterns.some(pattern => pattern.test(newMessage));
    if (containsPersonalInfo) {
      alert('⚠️ Security Warning: Please do not share personal information like phone numbers, emails, or financial details in chat messages. Use the platform\'s secure contact methods instead.');
      return;
    }

    try {
      setSending(true);
      const response = await fetch('/api/chat/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chatRoomId: selectedRoom.id,
          senderId: userId,
          senderType: userType,
          messageText: newMessage.trim()
        })
      });

      const data = await response.json();
      
      if (response.ok) {
        setNewMessage('');
        // Add the new message to the list
        setMessages(prev => [...prev, data.message]);
        scrollToBottom();
        // Refresh chat rooms to update the last message
        loadChatRooms();
      } else {
        console.error('Failed to send message:', data.error);
      }
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setSending(false);
    }
  };

  // Scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Handle room selection
  const handleRoomSelect = async (room: ChatRoom) => {
    setSelectedRoom(room);
    await loadMessages(room.id);
    
    // Mark messages as read for this room
    try {
      await fetch('/api/chat/mark-read', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          chatRoomId: room.id,
          userId: userId,
          userType: userType
        }),
      });
      
      // Refresh unread count
      loadUnreadCount();
    } catch (error) {
      console.error('Error marking messages as read:', error);
    }
  };

  // Auto-refresh messages every 3 seconds for real-time updates
  useEffect(() => {
    if (selectedRoom) {
      const interval = setInterval(() => {
        loadMessages(selectedRoom.id);
      }, 3000);

      return () => clearInterval(interval);
    }
  }, [selectedRoom]);

  // Load chat rooms on mount
  useEffect(() => {
    if (isOpen) {
      loadChatRooms();
    }
  }, [isOpen, userId, userType]);

  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b bg-gradient-to-r from-blue-600 to-blue-700 text-white">
          <div className="flex items-center gap-2">
            <MessageCircle className="w-5 h-5" />
            <div>
              <h2 className="text-lg font-semibold">My Approved - Secure Chat</h2>
              <p className="text-xs text-blue-100">Professional communication platform</p>
            </div>
            <Badge variant="secondary" className="bg-blue-500 text-white">
              {chatRooms.length} conversations
            </Badge>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose} className="text-white hover:bg-blue-600">
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* Security Notice */}
        <div className="bg-yellow-50 border-b border-yellow-200 p-3">
          <div className="flex items-center gap-2 text-yellow-800">
            <Shield className="w-4 h-4" />
            <span className="text-sm font-medium">Security Notice:</span>
            <span className="text-xs">Do not share personal information, contact details, or financial information in chat messages.</span>
          </div>
        </div>

        <div className="flex flex-1 overflow-hidden">
          {/* Chat Rooms List */}
          <div className="w-1/3 border-r bg-gray-50">
            <div className="p-4">
              <h3 className="font-medium mb-3 flex items-center gap-2">
                <Users className="w-4 h-4" />
                Active Conversations
              </h3>
              {loading ? (
                <div className="text-center py-4">Loading...</div>
              ) : chatRooms.length === 0 ? (
                <div className="text-center py-4 text-gray-500">
                  <MessageCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p>No active conversations</p>
                  <p className="text-xs mt-1">Chat rooms appear when quotations are accepted</p>
                </div>
              ) : (
                <ScrollArea className="h-[calc(80vh-200px)]">
                  {chatRooms.map((room) => {
                    const tradeLabel = room && room.jobs && room.jobs.trade ? room.jobs.trade : 'Conversation';
                    const jobDesc = room && room.jobs && room.jobs.job_description ? room.jobs.job_description : 'Direct message';
                    const partnerName = userType === 'client'
                      ? `${room.tradespeople?.first_name || ''} ${room.tradespeople?.last_name || ''}`.trim() || 'Tradesperson'
                      : `${room.clients?.first_name || ''} ${room.clients?.last_name || ''}`.trim() || 'Client';
                    return (
                      <div
                        key={room.id}
                        className={`p-3 rounded-lg cursor-pointer mb-2 transition-colors ${
                          selectedRoom?.id === room.id
                            ? 'bg-blue-100 border border-blue-200'
                            : 'bg-white hover:bg-gray-100 border border-gray-200'
                        }`}
                        onClick={() => handleRoomSelect(room)}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <Badge variant="outline" className="text-xs">{tradeLabel}</Badge>
                          <span className="text-xs text-gray-500">
                            {new Date(room.updated_at).toLocaleDateString()}
                          </span>
                        </div>
                        <div className="text-sm font-medium mb-1">{partnerName}</div>
                        <div className="text-xs text-gray-600 truncate">{jobDesc}</div>
                      </div>
                    );
                  })}
                </ScrollArea>
              )}
            </div>
          </div>

          {/* Chat Messages */}
          <div className="flex-1 flex flex-col">
            {selectedRoom ? (
              <>
                {/* Chat Header */}
                <div className="p-4 border-b bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium">
                        {userType === 'client' 
                          ? `${selectedRoom.tradespeople?.first_name || ''} ${selectedRoom.tradespeople?.last_name || ''}`.trim() || 'Tradesperson'
                          : `${selectedRoom.clients?.first_name || ''} ${selectedRoom.clients?.last_name || ''}`.trim() || 'Client'
                        }
                      </h3>
                      {(() => {
                        const trade = selectedRoom?.jobs?.trade || 'Conversation';
                        const postcode = selectedRoom?.jobs?.postcode;
                        return (
                          <p className="text-sm text-gray-600">
                            {trade}{postcode ? ` • ${postcode}` : ''}
                          </p>
                        );
                      })()}
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">{selectedRoom?.jobs?.trade || 'Conversation'}</Badge>
                      <Badge variant="secondary" className="bg-green-100 text-green-800">
                        My Approved
                      </Badge>
                    </div>
                  </div>
                </div>

                {/* Messages */}
                <ScrollArea className="flex-1 p-4">
                  <div className="space-y-4">
                    {messages.length === 0 ? (
                      <div className="text-center py-8 text-gray-500">
                        <MessageCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
                        <p>No messages yet</p>
                        <p className="text-xs">Start the conversation!</p>
                      </div>
                    ) : (
                      messages.map((message) => (
                        <div
                          key={message.id}
                          className={`flex ${message.sender_type === userType ? 'justify-end' : 'justify-start'}`}
                        >
                          <div
                            className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                              message.sender_type === userType
                                ? 'bg-blue-500 text-white'
                                : 'bg-gray-200 text-gray-900'
                            }`}
                          >
                            <div className="text-sm">{message.message_text}</div>
                            <div className={`text-xs mt-1 ${
                              message.sender_type === userType ? 'text-blue-100' : 'text-gray-500'
                            }`}>
                              {new Date(message.created_at).toLocaleTimeString()}
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                    <div ref={messagesEndRef} />
                  </div>
                </ScrollArea>

                {/* Message Input */}
                <div className="p-4 border-t">
                  <div className="flex gap-2">
                    <Input
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder="Type your message... (No personal information please)"
                      onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                      disabled={sending}
                    />
                    <Button 
                      onClick={sendMessage} 
                      disabled={!newMessage.trim() || sending}
                      size="sm"
                    >
                      <Send className="w-4 h-4" />
                    </Button>
                  </div>
                  <div className="flex items-center gap-2 mt-2 text-xs text-gray-500">
                    <AlertTriangle className="w-3 h-3" />
                    <span>Keep conversations professional. Use secure contact methods for personal details.</span>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-gray-500">
                <div className="text-center">
                  <MessageCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Select a conversation to start chatting</p>
                  <p className="text-sm mt-1">My Approved - Secure professional communication</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 