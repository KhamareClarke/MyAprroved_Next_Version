import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET(request: NextRequest) {
  try {
    const supabaseUrl = 'https://jismdkfjkngwbpddhomx.supabase.co';
    const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imppc21ka2Zqa25nd2JwZGRob214Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI5Mzc2MzksImV4cCI6MjA2ODUxMzYzOX0.1pK4G-Mu5v8lSdDJUAsPsoDAlK9d7ocFaUH9dd2vl3A';
    
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get search parameters
    const { searchParams } = new URL(request.url);
    const searchTerm = searchParams.get('search') || '';
    const location = searchParams.get('location') || '';
    const trade = searchParams.get('trade') || '';
    const sortBy = searchParams.get('sortBy') || 'created_at';
    
    // Fix pagination parameters with proper validation
    const pageParam = searchParams.get('page');
    const limitParam = searchParams.get('limit');
    
    const page = pageParam && !isNaN(parseInt(pageParam)) ? parseInt(pageParam) : 1;
    const limit = limitParam && !isNaN(parseInt(limitParam)) ? parseInt(limitParam) : 6;

    console.log('Fetching tradespeople with params:', { searchTerm, location, trade, sortBy, page, limit });

    // Build query with reviews data
    let query = supabase
      .from('tradespeople')
      .select(`
        id,
        first_name,
        last_name,
        trade,
        city,
        postcode,
        phone,
        email,
        profile_picture_url,
        years_experience,
        hourly_rate,
        is_verified,
        is_active,
        is_approved,
        created_at,
        job_reviews!job_reviews_tradesperson_id_fkey (
          id,
          rating,
          review_text,
          reviewer_type,
          reviewer_id,
          reviewed_at
        )
      `)
      .eq('is_active', true) // Only show active tradespeople
      .eq('is_approved', true); // Only show approved tradespeople

    // Add search filters
    if (searchTerm) {
      query = query.or(`first_name.ilike.%${searchTerm}%,last_name.ilike.%${searchTerm}%,trade.ilike.%${searchTerm}%`);
    }

    if (trade) {
      query = query.eq('trade', trade);
    }

    if (location) {
      query = query.or(`city.ilike.%${location}%,postcode.ilike.%${location}%`);
    }

    // Add sorting - use created_at as default since it should exist
    query = query.order('created_at', { ascending: false });

    // Add pagination
    const from = (page - 1) * limit;
    const to = from + limit - 1;
    query = query.range(from, to);

    console.log('Executing query with pagination:', { page, limit, from, to });
    
    // Get total count for pagination
    const { count } = await supabase
      .from('tradespeople')
      .select('*', { count: 'exact', head: true })
      .eq('is_active', true)
      .eq('is_approved', true);

    const { data: tradespeople, error } = await query;

    if (error) {
      console.error('Error fetching tradespeople:', error);
      return NextResponse.json(
        { error: `Failed to fetch tradespeople: ${error.message}` },
        { status: 500 }
      );
    }

    console.log(`Found ${tradespeople?.length || 0} tradespeople`);

    // Transform the data to match the frontend expectations
    const transformedTradespeople = tradespeople?.map((person, index) => {
      // Combine first_name and last_name for full name
      const fullName = `${person.first_name || ''} ${person.last_name || ''}`.trim();
      
      // Generate initials for profile picture
      const nameParts = fullName.split(' ').filter(part => part.length > 0);
      const initials = nameParts.length >= 2 
        ? `${nameParts[0][0]}${nameParts[nameParts.length - 1][0]}`.toUpperCase()
        : (fullName.substring(0, 2) || 'NA').toUpperCase();

      // Calculate real ratings and reviews from job_reviews
      const reviews = person.job_reviews || [];
      const totalReviews = reviews.length;
      const averageRating = totalReviews > 0 
        ? reviews.reduce((sum: number, review: any) => sum + review.rating, 0) / totalReviews
        : 0;

      // Mock data for fields we don't have yet
      const mockData = {
        distance: `${(Math.random() * 10 + 1).toFixed(1)} miles`,
        description: `Professional ${person.trade?.toLowerCase() || 'tradesperson'} with ${person.years_experience || 'several'} years of experience in ${person.city || 'the area'}.`,
        responseTime: `${Math.floor(Math.random() * 4) + 1} hours`
      };

      // Format hourly rate (no duplicate '/hr')
      let hourlyRate: string;
      if (person.hourly_rate) {
        const num = typeof person.hourly_rate === 'number' ? person.hourly_rate : parseFloat(person.hourly_rate);
        hourlyRate = `£${(isNaN(num) ? 0 : num).toFixed(2)}/hr`;
      } else {
        const low = Math.floor(Math.random() * 30) + 30;
        const high = Math.floor(Math.random() * 30) + 60;
        hourlyRate = `£${low}-${high}/hr`;
      }

      return {
        id: person.id,
        name: fullName || 'Unknown',
        trade: person.trade || 'General',
        rating: parseFloat(averageRating.toFixed(1)) || 0,
        reviews: totalReviews,
        reviewsData: reviews.map((review: any) => ({
          id: review.id,
          rating: review.rating,
          text: review.review_text,
          reviewerType: review.reviewer_type,
          reviewedAt: review.reviewed_at
        })),
        location: `${person.city || 'Unknown'}, ${person.postcode || 'Unknown'}`,
        distance: mockData.distance,
        image: person.profile_picture_url || null, // Will use initials if no image
        initials: initials,
        verified: person.is_verified || false,
        yearsExperience: person.years_experience || Math.floor(Math.random() * 15) + 3,
        description: mockData.description,
        hourlyRate: hourlyRate,
        responseTime: mockData.responseTime,
        phone: person.phone || '',
        email: person.email || ''
      };
    }) || [];

    const response = {
      success: true,
      tradespeople: transformedTradespeople,
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit),
        hasMore: (page * limit) < (count || 0)
      }
    };

    console.log('API Response:', {
      success: response.success,
      tradespeopleCount: response.tradespeople.length,
      pagination: response.pagination
    });

    return NextResponse.json(response);

  } catch (error: any) {
    console.error('Error in tradespeople list API:', error);
    return NextResponse.json(
      { error: `Internal server error: ${error.message}` },
      { status: 500 }
    );
  }
} 