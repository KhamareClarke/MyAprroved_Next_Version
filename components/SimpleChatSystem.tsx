'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { MessageCircle, Send, X, Users } from 'lucide-react';

interface ChatMessage {
  id: string;
  sender_id: string;
  sender_type: 'client' | 'tradesperson';
  sender_name: string;
  message_text: string;
  timestamp: Date;
}

interface ChatRoom {
  id: string;
  job_id: string;
  job_title: string;
  trade: string;
  client_name: string;
  tradesperson_name: string;
  messages: ChatMessage[];
}

interface SimpleChatSystemProps {
  userId: string;
  userType: 'client' | 'tradesperson';
  userName: string;
  isOpen: boolean;
  onClose: () => void;
  acceptedJobs: any[]; // Jobs where quotations were accepted
}

// In-memory storage for chat rooms (will be lost on page refresh)
let globalChatRooms: { [key: string]: ChatRoom } = {};

export default function SimpleChatSystem({ 
  userId, 
  userType, 
  userName, 
  isOpen, 
  onClose, 
  acceptedJobs 
}: SimpleChatSystemProps) {
  const [chatRooms, setChatRooms] = useState<ChatRoom[]>([]);
  const [selectedRoom, setSelectedRoom] = useState<ChatRoom | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initialize chat rooms from accepted jobs
  useEffect(() => {
    if (isOpen && acceptedJobs.length > 0) {
      const rooms: ChatRoom[] = [];
      
      acceptedJobs.forEach(job => {
        const roomId = `room_${job.id}_${job.assigned_tradesperson_id}`;
        
        // Create room if it doesn't exist
        if (!globalChatRooms[roomId]) {
          globalChatRooms[roomId] = {
            id: roomId,
            job_id: job.id,
            job_title: job.job_description,
            trade: job.trade,
            client_name: job.clients?.first_name + ' ' + job.clients?.last_name || 'Client',
            tradesperson_name: job.tradespeople?.first_name + ' ' + job.tradespeople?.last_name || 'Tradesperson',
            messages: []
          };
        }
        
        rooms.push(globalChatRooms[roomId]);
      });
      
      setChatRooms(rooms);
    }
  }, [isOpen, acceptedJobs]);

  // Send a new message
  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedRoom) return;

    try {
      setSending(true);
      
      const message: ChatMessage = {
        id: `msg_${Date.now()}_${Math.random()}`,
        sender_id: userId,
        sender_type: userType,
        sender_name: userName,
        message_text: newMessage.trim(),
        timestamp: new Date()
      };

      // Add message to the room
      if (globalChatRooms[selectedRoom.id]) {
        globalChatRooms[selectedRoom.id].messages.push(message);
        
        // Update local state
        setSelectedRoom(prev => prev ? {
          ...prev,
          messages: [...prev.messages, message]
        } : null);
        
        setChatRooms(prev => prev.map(room => 
          room.id === selectedRoom.id 
            ? { ...room, messages: [...room.messages, message] }
            : room
        ));
      }

      setNewMessage('');
      scrollToBottom();
      
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
  };

  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [selectedRoom?.messages]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center gap-2">
            <MessageCircle className="w-5 h-5" />
            <h2 className="text-lg font-semibold">Real-time Chat</h2>
            <Badge variant="secondary">{chatRooms.length} conversations</Badge>
            <Badge variant="outline" className="text-xs">
              Messages not saved
            </Badge>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </div>

        <div className="flex flex-1 overflow-hidden">
          {/* Chat Rooms List */}
          <div className="w-1/3 border-r bg-gray-50">
            <div className="p-4">
              <h3 className="font-medium mb-3 flex items-center gap-2">
                <Users className="w-4 h-4" />
                Active Conversations
              </h3>
              {chatRooms.length === 0 ? (
                <div className="text-center py-4 text-gray-500">
                  No active conversations
                  <div className="text-xs mt-1">
                    Chat rooms appear when quotations are accepted
                  </div>
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
                          {room.trade}
                        </Badge>
                        <span className="text-xs text-gray-500">
                          {room.messages.length} messages
                        </span>
                      </div>
                      <div className="text-sm font-medium mb-1">
                        {userType === 'client' 
                          ? room.tradesperson_name
                          : room.client_name
                        }
                      </div>
                      <div className="text-xs text-gray-600 truncate">
                        {room.job_title}
                      </div>
                      {room.messages.length > 0 && (
                        <div className="text-xs text-gray-500 mt-1">
                          Last: {room.messages[room.messages.length - 1].message_text.substring(0, 30)}...
                        </div>
                      )}
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
                          ? selectedRoom.tradesperson_name
                          : selectedRoom.client_name
                        }
                      </h3>
                      <p className="text-sm text-gray-600">
                        {selectedRoom.trade} • {selectedRoom.job_title}
                      </p>
                    </div>
                    <Badge variant="outline">{selectedRoom.trade}</Badge>
                  </div>
                </div>

                {/* Messages */}
                <ScrollArea className="flex-1 p-4">
                  <div className="space-y-4">
                    {selectedRoom.messages.length === 0 ? (
                      <div className="text-center py-8 text-gray-500">
                        <MessageCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
                        <p>No messages yet</p>
                        <p className="text-xs">Start the conversation!</p>
                      </div>
                    ) : (
                      selectedRoom.messages.map((message) => (
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
                              {message.sender_name} • {message.timestamp.toLocaleTimeString()}
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
                  <div className="text-xs text-gray-500 mt-2">
                    💡 Messages are temporary and will be lost when you refresh the page
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-gray-500">
                <div className="text-center">
                  <MessageCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Select a conversation to start chatting</p>
                  <p className="text-sm mt-1">Real-time messaging without database storage</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 