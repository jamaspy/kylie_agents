import { NextRequest, NextResponse } from "next/server";
import { jobadderFetch } from "@/lib/api/jobadder";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Build query parameters for JobAdder API
    const queryParams = new URLSearchParams();
    
    // Map common search parameters for applications
    const paramMappings = {
      applicationId: 'ApplicationId',
      candidateId: 'CandidateId',
      jobId: 'JobId',
      companyId: 'CompanyId',
      contactId: 'ContactId',
      statusId: 'StatusId',
      stage: 'Stage',
      createdAt: 'CreatedAt',
      updatedAt: 'UpdatedAt',
      submittedAt: 'SubmittedAt',
      ownerId: 'OwnerId',
      teamId: 'TeamId',
      includeDetails: 'IncludeDetails',
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
    const path = `applications${queryString ? `?${queryString}` : ''}`;
    
    const data = await jobadderFetch(path);
    
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching applications:', error);
    return NextResponse.json(
      { error: 'Failed to fetch applications' },
      { status: 500 }
    );
  }
}