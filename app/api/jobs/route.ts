import { NextRequest, NextResponse } from "next/server";

async function jobadderFetch(path: string, options: RequestInit = {}) {
  console.log("jobadderFetch RAN>>>>>>", path, options);
  const response = await fetch(`${process.env.JOBADDER_BASE_URL}/${path}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${process.env.JOBADDER_API_ACCESS_TOKEN}`,
      "Content-Type": "application/json",
      ...options.headers,
    },
    ...options,
  });
  console.log("🚀 ~ jobadderFetch ~ response:", response);

  if (!response.ok) {
    throw new Error(
      `JobAdder API error: ${response.status} ${response.statusText}`
    );
  }

  return response.json();
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    // Build query parameters for JobAdder API
    const queryParams = new URLSearchParams();

    // Map common search parameters for jobs
    const paramMappings = {
      jobId: "JobId",
      jobTitle: "JobTitle",
      companyId: "CompanyId",
      contactId: "ContactId",
      statusId: "StatusId",
      location: "Location",
      category: "Category",
      keywords: "Keywords",
      reference: "Reference",
      workType: "WorkType",
      salaryFrom: "SalaryFrom",
      salaryTo: "SalaryTo",
      advertised: "Advertised",
      evergreen: "Evergreen",
      createdAt: "CreatedAt",
      updatedAt: "UpdatedAt",
      expiryDate: "ExpiryDate",
      ownerId: "OwnerId",
      teamId: "TeamId",
      statistics: "Statistics",
      workplaceAddress: "WorkplaceAddress",
      fee: "Fee",
      offset: "Offset",
      limit: "Limit",
      embed: "Embed",
    };

    // Add query parameters if they exist
    Object.entries(paramMappings).forEach(([clientParam, jobadderParam]) => {
      const value = searchParams.get(clientParam);
      if (value) {
        queryParams.append(jobadderParam, value);
      }
    });

    const queryString = queryParams.toString();
    const path = `jobs${queryString ? `?${queryString}` : ""}`;

    const data = await jobadderFetch(path);

    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching jobs:", error);
    return NextResponse.json(
      { error: "Failed to fetch jobs" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const response = await fetch(`${process.env.JOBADDER_BASE_URL}/jobs`, {
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
    console.error("Error creating job:", error);
    return NextResponse.json(
      { error: "Failed to create job" },
      { status: 500 }
    );
  }
}
