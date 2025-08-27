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

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const { searchParams } = new URL(request.url);
    
    // Build query parameters for applications filtering
    const queryParams = new URLSearchParams();
    
    const paramMappings = {
      offset: 'Offset',
      limit: 'Limit'
    };
    
    Object.entries(paramMappings).forEach(([clientParam, jobadderParam]) => {
      const value = searchParams.get(clientParam);
      if (value) {
        queryParams.append(jobadderParam, value);
      }
    });
    
    const queryString = queryParams.toString();
    const path = `jobs/${resolvedParams.id}/applications${queryString ? `?${queryString}` : ''}`;
    
    const data = await jobadderFetch(path);
    
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching job applications:', error);
    
    if (error instanceof Error && error.message.includes('404')) {
      return NextResponse.json(
        { error: 'Job not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to fetch job applications' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const body = await request.json();
    
    // This endpoint is for adding candidates to a job
    const response = await fetch(`${process.env.JOBADDER_BASE_URL}/jobs/${resolvedParams.id}/applications`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.JOBADDER_API_ACCESS_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      return NextResponse.json(data, { status: response.status });
    }
    
    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error('Error adding candidates to job:', error);
    return NextResponse.json(
      { error: 'Failed to add candidates to job' },
      { status: 500 }
    );
  }
}