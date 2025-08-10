'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Clock, AlertCircle, CheckCircle, MessageSquare } from 'lucide-react';

interface QuoteRequest {
  id: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  project_type: string;
  project_description: string;
  location: string;
  timeframe: string;
  budget_range: string;
  status: string;
  admin_approved: boolean;
  tradesperson_quoted: boolean;
  client_approved: boolean;
  created_at: string;
}

interface TradespersonQuoteRequestsProps {
  tradespersonId: string;
}

export default function TradespersonQuoteRequests({ tradespersonId }: TradespersonQuoteRequestsProps) {
  const [quoteRequests, setQuoteRequests] = useState<QuoteRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (tradespersonId) {
      fetchQuoteRequests();
    }
  }, [tradespersonId]);

  const fetchQuoteRequests = async () => {
    try {
      const response = await fetch(`/api/tradesperson/quote-requests?tradespersonId=${tradespersonId}`);
      const data = await response.json();

      if (data.success) {
        setQuoteRequests(data.quoteRequests);
      } else {
        setError('Failed to fetch quote requests');
      }
    } catch (err) {
      setError('Error fetching quote requests');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (request: QuoteRequest) => {
    if (request.tradesperson_quoted && !request.client_approved) {
      return <Badge variant="secondary">Quote Provided</Badge>;
    } else if (request.client_approved) {
      return <Badge variant="default">Client Approved</Badge>;
    } else {
      return <Badge variant="outline">Pending Quote</Badge>;
    }
  };

  const getStatusMessage = (request: QuoteRequest) => {
    if (request.tradesperson_quoted && !request.client_approved) {
      return "You have provided a quote. Waiting for client approval.";
    } else if (request.client_approved) {
      return "Client has approved your quote. Contact them to arrange the work.";
    } else {
      return "This quote request is ready for your response. Please provide a detailed quote.";
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Quote Requests</h2>
        <button 
          onClick={fetchQuoteRequests}
          className="text-blue-600 hover:text-blue-800 text-sm font-medium"
        >
          Refresh
        </button>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {quoteRequests.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No approved quote requests found</p>
            <p className="text-sm text-gray-500 mt-2">
              Approved quote requests will appear here
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6">
          {quoteRequests.map((request) => (
            <Card key={request.id} className="border-l-4 border-l-green-500">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">
                    Quote Request from {request.customer_name}
                  </CardTitle>
                  {getStatusBadge(request)}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-semibold text-sm text-gray-600 mb-2">Customer Details</h4>
                    <p><strong>Name:</strong> {request.customer_name}</p>
                    <p><strong>Email:</strong> {request.customer_email}</p>
                    <p><strong>Phone:</strong> {request.customer_phone}</p>
                    <p><strong>Location:</strong> {request.location}</p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-sm text-gray-600 mb-2">Project Details</h4>
                    <p><strong>Type:</strong> {request.project_type || 'Not specified'}</p>
                    <p><strong>Timeframe:</strong> {request.timeframe || 'Not specified'}</p>
                    <p><strong>Budget:</strong> {request.budget_range || 'Not specified'}</p>
                    <p><strong>Description:</strong></p>
                    <p className="text-sm bg-gray-50 p-2 rounded mt-1">{request.project_description}</p>
                  </div>
                </div>
                
                <div className="bg-green-50 p-4 rounded-lg">
                  <div className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 mr-2 flex-shrink-0" />
                    <p className="text-sm text-green-800">{getStatusMessage(request)}</p>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t">
                  <p className="text-sm text-gray-500">
                    Requested on {formatDate(request.created_at)}
                  </p>
                  
                  {!request.tradesperson_quoted && (
                    <div className="flex gap-2">
                      <button className="flex items-center gap-1 text-blue-600 hover:text-blue-800 text-sm font-medium">
                        <MessageSquare className="h-4 w-4" />
                        Provide Quote
                      </button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
} 