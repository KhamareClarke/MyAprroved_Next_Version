'use client';

import { useState, useRef } from 'react';
import { X, ChevronLeft, ChevronRight, Upload, Calendar, Clock, MapPin, Wrench, FileText, Calculator } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { motion, AnimatePresence } from 'framer-motion';

interface QuoteFormData {
  trade: string;
  description: string;
  postcode: string;
  urgency: string;
  availability: string;
  images: File[];
}

const trades = [
  'Plumber',
  'Electrician',
  'Builder',
  'Painter',
  'Roofer',
  'Gardener',
  'Tiler',
  'Carpenter',
  'Locksmith',
  'Cleaner',
  'Handyman',
  'Plasterer',
  'Flooring',
  'Kitchen Fitter',
  'Bathroom Fitter',
  'Window Cleaner',
  'Pest Control',
  'Appliance Repair',
  'HVAC',
  'Decorator',
  'Driveway',
  'Fencing',
  'Guttering',
  'Insulation',
  'Other'
];

const urgencyOptions = [
  { value: 'emergency', label: 'Emergency (Same day)', icon: '🚨' },
  { value: 'urgent', label: 'Urgent (Within 24 hours)', icon: '⚡' },
  { value: 'normal', label: 'Normal (Within a week)', icon: '📅' },
  { value: 'flexible', label: 'Flexible (No rush)', icon: '😌' }
];

interface AIQuoteFormProps {
  isOpen: boolean;
  onClose: () => void;
  initialTrade?: string;
  initialPostcode?: string;
}

export default function AIQuoteForm({ isOpen, onClose, initialTrade = '', initialPostcode = '' }: AIQuoteFormProps) {
  const [currentStep, setCurrentStep] = useState(initialTrade ? 2 : 1);
  const [formData, setFormData] = useState<QuoteFormData>({
    trade: initialTrade,
    description: '',
    postcode: initialPostcode,
    urgency: '',
    availability: '',
    images: []
  });
  const [isLoading, setIsLoading] = useState(false);
  const [estimate, setEstimate] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const steps = [
    { number: 1, title: 'Select Trade', icon: Wrench },
    { number: 2, title: 'Describe Job', icon: FileText },
    { number: 3, title: 'Location & Timing', icon: MapPin },
    { number: 4, title: 'Get Estimate', icon: Calculator }
  ];

  const handleInputChange = (field: keyof QuoteFormData, value: string | File[]) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    setFormData(prev => ({ ...prev, images: [...prev.images, ...files] }));
  };

  const removeImage = (index: number) => {
    setFormData(prev => ({ 
      ...prev, 
      images: prev.images.filter((_, i) => i !== index) 
    }));
  };

  const nextStep = () => {
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const generateEstimate = async () => {
    setIsLoading(true);
    try {
      // Simulate AI estimate generation
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const estimates = {
        'plumber': { emergency: '£200-350', urgent: '£150-250', normal: '£100-200', flexible: '£80-150' },
        'electrician': { emergency: '£300-500', urgent: '£200-350', normal: '£150-250', flexible: '£100-200' },
        'builder': { emergency: '£500-1000', urgent: '£400-800', normal: '£300-600', flexible: '£200-400' },
        'painter': { emergency: '£250-400', urgent: '£200-300', normal: '£150-250', flexible: '£100-200' }
      };
      
      const tradeKey = formData.trade.toLowerCase();
      const urgencyKey = formData.urgency as keyof typeof estimates.plumber;
      const estimate = estimates[tradeKey as keyof typeof estimates]?.[urgencyKey] || '£100-500';
      
      setEstimate(estimate);
    } catch (error) {
      console.error('Error generating estimate:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div className="text-center mb-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">What service do you need?</h3>
              <p className="text-gray-600">Select the type of trade you're looking for</p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Trade Category <span className="text-red-500">*</span>
              </label>
              <Select value={formData.trade} onValueChange={(value) => handleInputChange('trade', value)}>
                <SelectTrigger className="w-full h-12 text-base">
                  <SelectValue placeholder="Select a trade..." />
                </SelectTrigger>
                <SelectContent>
                  {trades.map((trade) => (
                    <SelectItem key={trade} value={trade}>
                      {trade}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </motion.div>
        );

      case 2:
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div className="text-center mb-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Describe your job</h3>
              <p className="text-gray-600">Tell us what you need done</p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Job Description <span className="text-red-500">*</span>
              </label>
              <Textarea
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Describe the work you need done in detail..."
                className="min-h-[120px] text-base"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Upload Images (Optional)
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-500 transition-colors">
                <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-600 mb-2">
                  Click to upload images or drag and drop
                </p>
                <Button
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  className="mt-2"
                >
                  Choose Files
                </Button>
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </div>
              
              {formData.images.length > 0 && (
                <div className="mt-4 grid grid-cols-2 gap-2">
                  {formData.images.map((file, index) => (
                    <div key={index} className="relative">
                      <img
                        src={URL.createObjectURL(file)}
                        alt={`Upload ${index + 1}`}
                        className="w-full h-24 object-cover rounded-lg"
                      />
                      <button
                        onClick={() => removeImage(index)}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Urgency Level <span className="text-red-500">*</span>
              </label>
              <Select value={formData.urgency} onValueChange={(value) => handleInputChange('urgency', value)}>
                <SelectTrigger className="w-full h-12 text-base">
                  <SelectValue placeholder="Select urgency level..." />
                </SelectTrigger>
                <SelectContent>
                  {urgencyOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      <div className="flex items-center">
                        <span className="mr-2">{option.icon}</span>
                        {option.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </motion.div>
        );

      case 3:
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div className="text-center mb-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Location & Availability</h3>
              <p className="text-gray-600">Where and when do you need the work done?</p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Postcode <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <Input
                  value={formData.postcode}
                  onChange={(e) => handleInputChange('postcode', e.target.value.toUpperCase())}
                  placeholder="Enter your postcode"
                  className="pl-10 h-12 text-base"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Preferred Availability
              </label>
              <div className="grid grid-cols-2 gap-3">
                {['Morning', 'Afternoon', 'Evening', 'Flexible'].map((time) => (
                  <Button
                    key={time}
                    variant={formData.availability === time ? 'default' : 'outline'}
                    onClick={() => handleInputChange('availability', time)}
                    className="h-12"
                  >
                    {time}
                  </Button>
                ))}
              </div>
            </div>
          </motion.div>
        );

      case 4:
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div className="text-center mb-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Your AI Estimate</h3>
              <p className="text-gray-600">Based on your job details and location</p>
            </div>
            
            {isLoading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-700 mx-auto mb-4"></div>
                <p className="text-gray-600">Generating your estimate...</p>
              </div>
            ) : estimate ? (
              <Card className="border-2 border-blue-200 bg-blue-50">
                <CardContent className="p-8 text-center">
                  <div className="text-6xl font-bold text-blue-700 mb-4">
                    {estimate}
                  </div>
                  <p className="text-gray-600 mb-6">
                    Estimated cost for your {formData.trade.toLowerCase()} job
                  </p>
                  <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                    <div>
                      <strong>Trade:</strong> {formData.trade}
                    </div>
                    <div>
                      <strong>Urgency:</strong> {urgencyOptions.find(u => u.value === formData.urgency)?.label}
                    </div>
                    <div>
                      <strong>Location:</strong> {formData.postcode}
                    </div>
                    <div>
                      <strong>Availability:</strong> {formData.availability || 'Flexible'}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="text-center">
                <Button
                  onClick={generateEstimate}
                  className="bg-yellow-500 hover:bg-yellow-600 text-black text-lg font-medium py-4 px-8 rounded-lg"
                >
                  Generate Estimate
                </Button>
              </div>
            )}
            
            {estimate && (
              <div className="text-center space-y-4">
                <Button
                  onClick={() => {
                    // Handle quote submission
                    console.log('Quote submitted:', { ...formData, estimate });
                  }}
                  className="bg-blue-700 hover:bg-blue-800 text-white text-lg font-medium py-4 px-8 rounded-lg w-full"
                >
                  Get Quotes from Tradespeople
                </Button>
                <p className="text-sm text-gray-500">
                  We'll connect you with verified tradespeople in your area
                </p>
              </div>
            )}
          </motion.div>
        );

      default:
        return null;
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 rounded-t-xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="text-2xl font-bold">
                    <span className="text-blue-700">My</span>
                    <span className="text-yellow-500">Approved</span>
                  </div>
                  <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                    AI Quote
                  </Badge>
                </div>
                <button
                  onClick={onClose}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              
              {/* Progress Steps */}
              <div className="flex items-center justify-between mt-6">
                {steps.map((step, index) => (
                  <div key={step.number} className="flex items-center">
                    <div className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium ${
                      currentStep >= step.number 
                        ? 'bg-blue-700 text-white' 
                        : 'bg-gray-200 text-gray-600'
                    }`}>
                      {currentStep > step.number ? (
                        <ChevronRight className="w-4 h-4" />
                      ) : (
                        step.number
                      )}
                    </div>
                    {index < steps.length - 1 && (
                      <div className={`w-12 h-1 mx-2 ${
                        currentStep > step.number ? 'bg-blue-700' : 'bg-gray-200'
                      }`} />
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Content */}
            <div className="p-6">
              {renderStep()}
            </div>

            {/* Footer */}
            <div className="sticky bottom-0 bg-white border-t border-gray-200 px-6 py-4 rounded-b-xl">
              <div className="flex justify-between">
                <Button
                  variant="outline"
                  onClick={prevStep}
                  disabled={currentStep === 1}
                  className="flex items-center"
                >
                  <ChevronLeft className="w-4 h-4 mr-2" />
                  Previous
                </Button>
                
                {currentStep < 4 && (
                  <Button
                    onClick={nextStep}
                    disabled={
                      (currentStep === 1 && !formData.trade) ||
                      (currentStep === 2 && (!formData.description || !formData.urgency)) ||
                      (currentStep === 3 && !formData.postcode)
                    }
                    className="bg-yellow-500 hover:bg-yellow-600 text-black"
                  >
                    Next
                    <ChevronRight className="w-4 h-4 ml-2" />
                  </Button>
                )}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
} 