import { NextResponse } from 'next/server';

// This is a placeholder for the actual OpenAI API call
// In a production environment, you would call the OpenAI API here
async function getAIEstimate(description: string): Promise<string> {
  // This is a mock implementation - replace with actual API call
  const mockEstimates = [
    'between £90 and £150',
    'between £120 and £200',
    'between £50 and £100',
    'between £200 and £350',
    'between £75 and £125',
  ];
  
  // Return a random estimate for demo purposes
  return new Promise((resolve) => {
    setTimeout(() => {
      const randomEstimate = mockEstimates[Math.floor(Math.random() * mockEstimates.length)];
      resolve(randomEstimate);
    }, 1000);
  });
  
  /*
  // Production code would look something like this:
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
    },
    body: JSON.stringify({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "You're a tradesperson cost estimator in the UK. Based on job descriptions, return a price estimate range in GBP like 'between £90 and £150'."
        },
        {
          role: "user",
          content: description
        }
      ],
      temperature: 0.2
    })
  });

  const data = await response.json();
  return data.choices[0].message.content;
  */
}

export async function POST(request: Request) {
  try {
    const { description } = await request.json();
    
    if (!description) {
      return NextResponse.json(
        { error: 'Description is required' },
        { status: 400 }
      );
    }

    const estimate = await getAIEstimate(description);
    
    return NextResponse.json({ estimate });
  } catch (error) {
    console.error('Error getting estimate:', error);
    return NextResponse.json(
      { error: 'Failed to get estimate' },
      { status: 500 }
    );
  }
}
