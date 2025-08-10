'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { MessageCircle, Send, X } from 'lucide-react';

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
  job_id: string;
  jobs: {
    trade: string;
    job_description: string;
    postcode: string;
  };
  clients?: {
    first_name: string;
    last_name: string;
    email: string;
  };
  tradespeople?: {
    first_name: string;
    last_name: string;
    trade: string;
    email: string;
  };
  updated_at: string;
}

interface ChatSystemProps {
  userId: string;
  userType: 'client' | 'tradesperson';
  isOpen: boolean;
  onClose: () => void;
}

export default function ChatSystem({ userId, userType, isOpen, onClose }: ChatSystemProps) {
  const [chatRooms, setChatRooms] = useState<ChatRoom[]>([]);
  const [selectedRoom, setSelectedRoom] = useState<ChatRoom | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [unreadCounts, setUnreadCounts] = useState<{ [roomId: string]: number }>({});

  // Load chat rooms
  const loadChatRooms = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/chat/rooms?userId=${userId}&userType=${userType}`);
      const data = await response.json();
      
      if (response.ok) {
        setChatRooms(data.chatRooms || []);
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
  const handleRoomSelect = (room: ChatRoom) => {
    setSelectedRoom(room);
    loadMessages(room.id);
  };

  // Auto-refresh messages every 5 seconds
  useEffect(() => {
    if (selectedRoom) {
      const interval = setInterval(() => {
        loadMessages(selectedRoom.id);
      }, 5000);

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
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center gap-2">
            <MessageCircle className="w-5 h-5" />
            <h2 className="text-lg font-semibold">Chat Messages</h2>
            <Badge variant="secondary">{chatRooms.length} conversations</Badge>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </div>

        <div className="flex flex-1 overflow-hidden">
          {/* Chat Rooms List */}
          <div className="w-1/3 border-r bg-gray-50">
            <div className="p-4">
              <h3 className="font-medium mb-3">Conversations</h3>
              {loading ? (
                <div className="text-center py-4">Loading...</div>
              ) : chatRooms.length === 0 ? (
                <div className="text-center py-4 text-gray-500">
                  No conversations yet
                </div>
              ) : (
                <ScrollArea className="h-[calc(80vh-120px)]">
                  {chatRooms.map((room) => (
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
                        <Badge variant="outline" className="text-xs">
                          {room.jobs.trade}
                        </Badge>
                        <span className="text-xs text-gray-500">
                          {new Date(room.updated_at).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="text-sm font-medium mb-1">
                        {userType === 'client' 
                          ? `${room.tradespeople?.first_name} ${room.tradespeople?.last_name}`
                          : `${room.clients?.first_name} ${room.clients?.last_name}`
                        }
                      </div>
                      <div className="text-xs text-gray-600 truncate">
                        {room.jobs.job_description}
                      </div>
                    </div>
                  ))}
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
                          ? `${selectedRoom.tradespeople?.first_name} ${selectedRoom.tradespeople?.last_name}`
                          : `${selectedRoom.clients?.first_name} ${selectedRoom.clients?.last_name}`
                        }
                      </h3>
                      <p className="text-sm text-gray-600">
                        {selectedRoom.jobs.trade} • {selectedRoom.jobs.postcode}
                      </p>
                    </div>
                    <Badge variant="outline">{selectedRoom.jobs.trade}</Badge>
                  </div>
                </div>

                {/* Messages */}
                <ScrollArea className="flex-1 p-4">
                  <div className="space-y-4">
                    {messages.map((message) => (
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
                    ))}
                    <div ref={messagesEndRef} />
                  </div>
                </ScrollArea>

                {/* Message Input */}
                <div className="p-4 border-t">
                  <div className="flex gap-2">
                    <Input
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder="Type your message..."
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
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-gray-500">
                Select a conversation to start chatting
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 