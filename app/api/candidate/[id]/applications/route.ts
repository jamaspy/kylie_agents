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
    const path = `candidates/${resolvedParams.id}/applications`;
    const data = await jobadderFetch(path);
    
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching candidate applications:', error);
    
    if (error instanceof Error && error.message.includes('404')) {
      return NextResponse.json(
        { error: 'Candidate not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to fetch candidate applications' },
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
    
    // This endpoint is for adding job orders (submitting applications)
    const response = await fetch(`${process.env.JOBADDER_BASE_URL}/candidates/${resolvedParams.id}/applications`, {
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
    console.error('Error submitting candidate application:', error);
    return NextResponse.json(
      { error: 'Failed to submit candidate application' },
      { status: 500 }
    );
  }
}