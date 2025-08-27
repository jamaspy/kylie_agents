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
    const embed = searchParams.get('embed');
    
    let path = `jobs/${resolvedParams.id}`;
    if (embed) {
      path += `?Embed=${embed}`;
    }
    
    const data = await jobadderFetch(path);
    
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching job:', error);
    
    if (error instanceof Error && error.message.includes('404')) {
      return NextResponse.json(
        { error: 'Job not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to fetch job' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const body = await request.json();
    
    // Check for workflow ID parameter
    const { searchParams } = new URL(request.url);
    const workflowId = searchParams.get('workflowId');
    
    let path = `jobs/${resolvedParams.id}`;
    if (workflowId) {
      path += `?workflowId=${workflowId}`;
    }
    
    const response = await fetch(`${process.env.JOBADDER_BASE_URL}/${path}`, {
      method: "PUT",
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
    
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error updating job:', error);
    return NextResponse.json(
      { error: 'Failed to update job' },
      { status: 500 }
    );
  }
}