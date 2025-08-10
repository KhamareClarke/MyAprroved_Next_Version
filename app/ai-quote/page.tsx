'use client';

import { useState } from 'react';
import { Search, MapPin, Star, Shield, Users, TrendingUp, ChevronRight, Phone, Mail, ChevronLeft, Smartphone, Download, Bell } from 'lucide-react';
import AIQuoteForm from '../../components/AIQuoteForm';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';

export default function AIQuotePage() {
  const [showAIQuoteForm, setShowAIQuoteForm] = useState(true);

  return (
    <div className="min-h-screen flex flex-col">
      {/* AI Quote Form Modal */}
      <AIQuoteForm 
        isOpen={showAIQuoteForm} 
        onClose={() => window.history.back()} 
      />
      
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <Link href="/" className="text-2xl font-bold">
                <span className="text-blue-700">My</span>
                <span className="text-yellow-500">Approved</span>
              </Link>
            </div>
            <nav className="hidden md:flex space-x-8">
              <Link href="/find-tradespeople" className="text-gray-700 hover:text-blue-700 transition-colors">
                Find Tradespeople
              </Link>
              <Link href="/how-it-works" className="text-gray-700 hover:text-blue-700 transition-colors">
                How It Works
              </Link>
              <Link href="/for-tradespeople" className="text-gray-700 hover:text-blue-700 transition-colors">
                For Tradespeople
              </Link>
            </nav>
            <div className="flex items-center space-x-4">
              <Button variant="outline" asChild>
                <Link href="/login">Login</Link>
              </Button>
              <Button className="bg-yellow-500 hover:bg-yellow-600 text-black" asChild>
                <Link href="/join">Join as Trade</Link>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Fallback content if modal is closed */}
      <div className="flex-1 flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            AI Quote Generator
          </h1>
          <p className="text-gray-600 mb-8">
            Get instant price estimates for your home improvement projects
          </p>
          <Button 
            onClick={() => setShowAIQuoteForm(true)}
            className="bg-yellow-500 hover:bg-yellow-600 text-black text-lg font-medium py-4 px-8 rounded-lg"
          >
            Start New Quote
          </Button>
        </div>
      </div>
    </div>
  );
} 