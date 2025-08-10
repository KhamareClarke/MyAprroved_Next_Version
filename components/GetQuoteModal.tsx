'use client';

import { useState } from 'react';
import { X, MapPin, Calendar, Clock, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface GetQuoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  tradesperson: {
    id: string;
    name: string;
    trade: string;
  };
}

export default function GetQuoteModal({ isOpen, onClose, tradesperson }: GetQuoteModalProps) {
  const [formData, setFormData] = useState({
    customerName: '',
    customerEmail: '',
    customerPhone: '',
    projectType: '',
    projectDescription: '',
    location: '',
    timeframe: '',
    budget: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      // Check if user is logged in as client
      const isLoggedIn = localStorage.getItem('clientToken') || sessionStorage.getItem('clientToken');
      
      if (!isLoggedIn) {
        // Store the current page to redirect back after login
        const currentUrl = window.location.href;
        localStorage.setItem('redirectAfterLogin', currentUrl);
        
        // Redirect to client login (relative path)
        window.location.href = '/login/client';
        return;
      }

      const response = await fetch('/api/quotes/request', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${isLoggedIn}`
        },
        body: JSON.stringify({
          ...formData,
          tradespersonId: tradesperson.id,
          tradespersonName: tradesperson.name,
          tradespersonTrade: tradesperson.trade
        }),
      });

      const data = await response.json();

      if (data.success) {
        setSuccess(true);
        setTimeout(() => {
          onClose();
          setSuccess(false);
          setFormData({
            customerName: '',
            customerEmail: '',
            customerPhone: '',
            projectType: '',
            projectDescription: '',
            location: '',
            timeframe: '',
            budget: ''
          });
        }, 2000);
      } else {
        if (data.requiresAuth) {
          // Store the current page to redirect back after login
          const currentUrl = window.location.href;
          localStorage.setItem('redirectAfterLogin', currentUrl);
          
          // Redirect to client login (relative path)
          window.location.href = '/login/client';
          return;
        } else if (data.isDuplicate) {
          setError('You have already sent a quote request to this tradesperson. Please wait for their response.');
        } else {
          setError(data.error || 'Failed to send quote request');
        }
      }
    } catch (err) {
      setError('An error occurred while sending the quote request');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold">Get Quote from {tradesperson.name}</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {success ? (
          <div className="p-6 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Quote Request Sent!</h3>
            <p className="text-gray-600">
              Your quote request has been sent to {tradesperson.name}. They will contact you soon with a detailed quote.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                {error}
              </div>
            )}

            <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
              <h3 className="font-medium text-blue-900 mb-2">Requesting quote from:</h3>
              <p className="text-blue-800">{tradesperson.name} - {tradesperson.trade}</p>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Your Name <span className="text-red-500">*</span>
                </label>
                <Input
                  name="customerName"
                  value={formData.customerName}
                  onChange={handleChange}
                  required
                  placeholder="John Doe"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address <span className="text-red-500">*</span>
                </label>
                <Input
                  type="email"
                  name="customerEmail"
                  value={formData.customerEmail}
                  onChange={handleChange}
                  required
                  placeholder="john@example.com"
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number <span className="text-red-500">*</span>
                </label>
                <Input
                  type="tel"
                  name="customerPhone"
                  value={formData.customerPhone}
                  onChange={handleChange}
                  required
                  placeholder="+44 1234 567890"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Project Type
                </label>
                <Select onValueChange={(value) => handleSelectChange('projectType', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select project type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="emergency">Emergency Repair</SelectItem>
                    <SelectItem value="installation">New Installation</SelectItem>
                    <SelectItem value="maintenance">Maintenance</SelectItem>
                    <SelectItem value="renovation">Renovation</SelectItem>
                    <SelectItem value="inspection">Inspection</SelectItem>
                    <SelectItem value="consultation">Consultation</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Project Location <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <MapPin className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <Input
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  required
                  placeholder="Enter your address or postcode"
                  className="pl-10"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Project Description <span className="text-red-500">*</span>
              </label>
              <Textarea
                name="projectDescription"
                value={formData.projectDescription}
                onChange={handleChange}
                required
                placeholder="Please describe your project in detail..."
                rows={4}
                className="resize-none"
              />
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Calendar className="inline w-4 h-4 mr-1" />
                  Preferred Timeframe
                </label>
                <Select onValueChange={(value) => handleSelectChange('timeframe', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="When do you need this done?" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="asap">As soon as possible</SelectItem>
                    <SelectItem value="week">Within a week</SelectItem>
                    <SelectItem value="month">Within a month</SelectItem>
                    <SelectItem value="flexible">I'm flexible</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Budget Range (Optional)
                </label>
                <Select onValueChange={(value) => handleSelectChange('budget', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select budget range" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="under-500">Under £500</SelectItem>
                    <SelectItem value="500-1000">£500 - £1,000</SelectItem>
                    <SelectItem value="1000-2500">£1,000 - £2,500</SelectItem>
                    <SelectItem value="2500-5000">£2,500 - £5,000</SelectItem>
                    <SelectItem value="over-5000">Over £5,000</SelectItem>
                    <SelectItem value="discuss">Prefer to discuss</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex space-x-4 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 bg-yellow-500 hover:bg-yellow-600 text-black"
              >
                {isSubmitting ? 'Sending...' : 'Send Quote Request'}
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}