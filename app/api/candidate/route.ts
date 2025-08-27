import { NextRequest, NextResponse } from "next/server";

async function jobadderFetch(path: string, options: RequestInit = {}) {
  const response = await fetch(`${process.env.JOBADDER_BASE_URL}/${path}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${process.env.JOBADDER_API_ACCESS_TOKEN}`,
      "Content-Type": "application/json",
      ...options.headers,
    },
    ...options,
  });
  
  if (!response.ok) {
    throw new Error(`JobAdder API error: ${response.status} ${response.statusText}`);
  }
  
  return response.json();
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Build query parameters for JobAdder API
    const queryParams = new URLSearchParams();
    
    // Map common search parameters
    const paramMappings = {
      candidateId: 'CandidateId',
      name: 'Name',
      email: 'Email',
      phone: 'Phone',
      currentPosition: 'CurrentPosition',
      city: 'City',
      state: 'State',
      location: 'Location',
      keywords: 'Keywords',
      statusId: 'StatusId',
      createdAt: 'CreatedAt',
      updatedAt: 'UpdatedAt',
      offset: 'Offset',
      limit: 'Limit',
      embed: 'Embed'
    };
    
    // Add query parameters if they exist
    Object.entries(paramMappings).forEach(([clientParam, jobadderParam]) => {
      const value = searchParams.get(clientParam);
      if (value) {
        queryParams.append(jobadderParam, value);
      }
    });
    
    const queryString = queryParams.toString();
    const path = `candidates${queryString ? `?${queryString}` : ''}`;
    
    const data = await jobadderFetch(path);
    
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching candidates:', error);
    return NextResponse.json(
      { error: 'Failed to fetch candidates' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Get X-Allow-Duplicates header if provided
    const allowDuplicates = request.headers.get('X-Allow-Duplicates');
    
    const headers: Record<string, string> = {
      Authorization: `Bearer ${process.env.JOBADDER_API_ACCESS_TOKEN}`,
      "Content-Type": "application/json",
    };
    
    if (allowDuplicates) {
      headers['X-Allow-Duplicates'] = allowDuplicates;
    }
    
    const response = await fetch(`${process.env.JOBADDER_BASE_URL}/candidates`, {
      method: "POST",
      headers,
      body: JSON.stringify(body),
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      return NextResponse.json(data, { status: response.status });
    }
    
    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error('Error creating candidate:', error);
    return NextResponse.json(
      { error: 'Failed to create candidate' },
      { status: 500 }
    );
  }
}