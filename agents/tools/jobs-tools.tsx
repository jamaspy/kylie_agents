import { tool } from "@openai/agents";
import { z } from "zod";

export const getJobsTool = tool({
  name: "Jobadder Jobs Tool",
  description: `
    - Get a list of jobs with optional filtering parameters.
    - ALWAYS supply the Job Id in your response.
    `,
  parameters: z.object({
    jobId: z.string().nullable().optional(),
    jobTitle: z.string().nullable().optional(),
    companyId: z.string().nullable().optional(),
    contactId: z.string().nullable().optional(),
    statusId: z.string().nullable().optional(),
    location: z.string().nullable().optional(),
    category: z.string().nullable().optional(),
    keywords: z.string().nullable().optional(),
    reference: z.string().nullable().optional(),
    workType: z.string().nullable().optional(),
    salaryFrom: z.string().nullable().optional(),
    salaryTo: z.string().nullable().optional(),
    advertised: z.string().nullable().optional(),
    evergreen: z.string().nullable().optional(),
    createdAt: z.string().nullable().optional(),
    updatedAt: z.string().nullable().optional(),
    expiryDate: z.string().nullable().optional(),
    ownerId: z.string().nullable().optional(),
    teamId: z.string().nullable().optional(),
    statistics: z.string().nullable().optional(),
    workplaceAddress: z.string().nullable().optional(),
    fee: z.string().nullable().optional(),
    offset: z.string().nullable().optional(),
    limit: z.string().nullable().optional(),
    embed: z.string().nullable().optional(),
  }),
  execute: async (params) => {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value) {
        searchParams.append(key, value);
      }
    });

    const queryString = searchParams.toString();
    const url = `${process.env.JOBADDER_BASE_URL}/jobs${
      queryString ? `?${queryString}` : ""
    }`;

    const response = await fetch(url, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${process.env.JOBADDER_API_ACCESS_TOKEN}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch jobs: ${response.statusText}`);
    }

    return await response.json();
  },
});

export const createJobTool = tool({
  name: "Create Job",
  description: "Create a new job posting",
  parameters: z.object({
    jobData: z.record(z.any()).describe("The job data to create"),
  }),
  execute: async ({ jobData }) => {
    const url = `${process.env.JOBADDER_BASE_URL}/jobs`;

    const response = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.JOBADDER_API_ACCESS_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(jobData),
    });

    if (!response.ok) {
      throw new Error(`Failed to create job: ${response.statusText}`);
    }

    return await response.json();
  },
});

export const getJobByIdTool = tool({
  name: "Jobadder Jobs By ID Tool",
  description: `
    - Get a specific job by its ID.
    - The User will provide the Job Id in the request.
    - If the user does not supply the Job Id, you must ask for it.
    - ALWAYS supply the Job Id in your response.
    `,
  parameters: z.object({
    id: z.string().describe("The job ID"),
    embed: z
      .string()
      .nullable()
      .describe("Additional data to embed in the response"),
  }),
  execute: async ({ id, embed }) => {
    const searchParams = new URLSearchParams();
    if (embed) {
      searchParams.append("embed", embed);
    }

    const queryString = searchParams.toString();
    const url = `${process.env.JOBADDER_BASE_URL}/jobs/${id}${
      queryString ? `?${queryString}` : ""
    }`;

    const response = await fetch(url, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${process.env.JOBADDER_API_ACCESS_TOKEN}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch job: ${response.statusText}`);
    }

    return await response.json();
  },
});

export const updateJobTool = tool({
  name: "Update Job",
  description: "Update a job's information",
  parameters: z.object({
    id: z.string().describe("The job ID"),
    data: z.record(z.any()).describe("The job data to update"),
  }),
  execute: async ({ id, data }) => {
    const url = `${process.env.JOBADDER_BASE_URL}/jobs/${id}`;

    const response = await fetch(url, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${process.env.JOBADDER_API_ACCESS_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`Failed to update job: ${response.statusText}`);
    }

    return await response.json();
  },
});

export const updateJobStatusTool = tool({
  name: "Update Job Status",
  description: "Update a job's status",
  parameters: z.object({
    id: z.string().describe("The job ID"),
    statusData: z.record(z.any()).describe("The status data to update"),
  }),
  execute: async ({ id, statusData }) => {
    const url = `${process.env.JOBADDER_BASE_URL}/api/jobs/${id}/status`;

    const response = await fetch(url, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${process.env.JOBADDER_API_ACCESS_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(statusData),
    });

    if (!response.ok) {
      throw new Error(`Failed to update job status: ${response.statusText}`);
    }

    return await response.json();
  },
});

export const getJobApplicationsTool = tool({
  name: "Get Job Applications",
  description: "Get all applications for a specific job",
  parameters: z.object({
    id: z.string().describe("The job ID"),
  }),
  execute: async ({ id }) => {
    const url = `${process.env.JOBADDER_BASE_URL}/api/jobs/${id}/applications`;

    const response = await fetch(url, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${process.env.JOBADDER_API_ACCESS_TOKEN}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(
        `Failed to fetch job applications: ${response.statusText}`
      );
    }

    return await response.json();
  },
});

export const getActiveJobApplicationsTool = tool({
  name: "Get Active Job Applications",
  description: "Get active applications for a specific job",
  parameters: z.object({
    id: z.string().describe("The job ID"),
  }),
  execute: async ({ id }) => {
    const url = `${process.env.JOBADDER_BASE_URL}/api/jobs/${id}/applications/active`;

    const response = await fetch(url, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${process.env.JOBADDER_API_ACCESS_TOKEN}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(
        `Failed to fetch active job applications: ${response.statusText}`
      );
    }

    return await response.json();
  },
});

export const submitJobApplicationTool = tool({
  name: "Submit Job Application",
  description: "Submit an application for a job",
  parameters: z.object({
    id: z.string().describe("The job ID"),
    applicationData: z.record(z.any()).describe("The application data"),
  }),
  execute: async ({ id, applicationData }) => {
    const url = `${process.env.JOBADDER_BASE_URL}/api/jobs/${id}/applications/submit`;

    const response = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.JOBADDER_API_ACCESS_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(applicationData),
    });

    if (!response.ok) {
      throw new Error(
        `Failed to submit job application: ${response.statusText}`
      );
    }

    return await response.json();
  },
});

export const getJobActivitesTool = tool({
  name: "Get Job Activities",
  description: "Get all activities for a specific job",
  parameters: z.object({
    id: z.string().describe("The job ID"),
  }),
  execute: async ({ id }) => {
    const url = `${process.env.JOBADDER_BASE_URL}/api/jobs/${id}/activities`;

    const response = await fetch(url, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${process.env.JOBADDER_API_ACCESS_TOKEN}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch job activities: ${response.statusText}`);
    }

    return await response.json();
  },
});

export const getJobAttachmentsTool = tool({
  name: "Get Job Attachments",
  description: "Get all attachments for a specific job",
  parameters: z.object({
    id: z.string().describe("The job ID"),
  }),
  execute: async ({ id }) => {
    const url = `${process.env.JOBADDER_BASE_URL}/api/jobs/${id}/attachments`;

    const response = await fetch(url, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${process.env.JOBADDER_API_ACCESS_TOKEN}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(
        `Failed to fetch job attachments: ${response.statusText}`
      );
    }

    return await response.json();
  },
});

export const createJobAttachmentTool = tool({
  name: "Create Job Attachment",
  description: "Create a new attachment for a job",
  parameters: z.object({
    id: z.string().describe("The job ID"),
    attachmentData: z.record(z.any()).describe("The attachment data"),
  }),
  execute: async ({ id, attachmentData }) => {
    const url = `${process.env.JOBADDER_BASE_URL}/api/jobs/${id}/attachments`;

    const response = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.JOBADDER_API_ACCESS_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(attachmentData),
    });

    if (!response.ok) {
      throw new Error(
        `Failed to create job attachment: ${response.statusText}`
      );
    }

    return await response.json();
  },
});

export const getJobAttachmentTool = tool({
  name: "Get Job Attachment",
  description: "Get a specific attachment from a job",
  parameters: z.object({
    id: z.string().describe("The job ID"),
    attachmentId: z.string().describe("The attachment ID"),
  }),
  execute: async ({ id, attachmentId }) => {
    const url = `${process.env.JOBADDER_BASE_URL}/api/jobs/${id}/attachments/${attachmentId}`;

    const response = await fetch(url, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${process.env.JOBADDER_API_ACCESS_TOKEN}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch job attachment: ${response.statusText}`);
    }

    return await response.json();
  },
});

export const getJobNotesTool = tool({
  name: "Get Job Notes",
  description: "Get all notes for a specific job",
  parameters: z.object({
    id: z.string().describe("The job ID"),
  }),
  execute: async ({ id }) => {
    const url = `${process.env.JOBADDER_BASE_URL}/api/jobs/${id}/notes`;

    const response = await fetch(url, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${process.env.JOBADDER_API_ACCESS_TOKEN}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch job notes: ${response.statusText}`);
    }

    return await response.json();
  },
});

export const createJobNoteTool = tool({
  name: "Create Job Note",
  description: "Create a new note for a job",
  parameters: z.object({
    id: z.string().describe("The job ID"),
    noteData: z.record(z.any()).describe("The note data"),
  }),
  execute: async ({ id, noteData }) => {
    const url = `${process.env.JOBADDER_BASE_URL}/api/jobs/${id}/notes`;

    const response = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.JOBADDER_API_ACCESS_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(noteData),
    });

    if (!response.ok) {
      throw new Error(`Failed to create job note: ${response.statusText}`);
    }

    return await response.json();
  },
});

export const getJobPlacementsTool = tool({
  name: "Get Job Placements",
  description: "Get all placements for a specific job",
  parameters: z.object({
    id: z.string().describe("The job ID"),
  }),
  execute: async ({ id }) => {
    const url = `${process.env.JOBADDER_BASE_URL}/api/jobs/${id}/placements`;

    const response = await fetch(url, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${process.env.JOBADDER_API_ACCESS_TOKEN}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch job placements: ${response.statusText}`);
    }

    return await response.json();
  },
});

export const getApprovedJobPlacementsTool = tool({
  name: "Get Approved Job Placements",
  description: "Get approved placements for a specific job",
  parameters: z.object({
    id: z.string().describe("The job ID"),
  }),
  execute: async ({ id }) => {
    const url = `${process.env.JOBADDER_BASE_URL}/api/jobs/${id}/placements/approved`;

    const response = await fetch(url, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${process.env.JOBADDER_API_ACCESS_TOKEN}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(
        `Failed to fetch approved job placements: ${response.statusText}`
      );
    }

    return await response.json();
  },
});

export const getJobSubmissionsTool = tool({
  name: "Get Job Submissions",
  description: "Get all submissions for a specific job",
  parameters: z.object({
    id: z.string().describe("The job ID"),
  }),
  execute: async ({ id }) => {
    const url = `${process.env.JOBADDER_BASE_URL}/api/jobs/${id}/submissions`;

    const response = await fetch(url, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${process.env.JOBADDER_API_ACCESS_TOKEN}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(
        `Failed to fetch job submissions: ${response.statusText}`
      );
    }

    return await response.json();
  },
});

export const getJobUserTasksTool = tool({
  name: "Get Job User Tasks",
  description: "Get all user tasks for a specific job",
  parameters: z.object({
    id: z.string().describe("The job ID"),
  }),
  execute: async ({ id }) => {
    const url = `${process.env.JOBADDER_BASE_URL}/api/jobs/${id}/usertasks`;

    const response = await fetch(url, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${process.env.JOBADDER_API_ACCESS_TOKEN}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch job user tasks: ${response.statusText}`);
    }

    return await response.json();
  },
});

export const createJobUserTaskTool = tool({
  name: "Create Job User Task",
  description: "Create a new user task for a job",
  parameters: z.object({
    id: z.string().describe("The job ID"),
    taskData: z.record(z.any()).describe("The task data"),
  }),
  execute: async ({ id, taskData }) => {
    const url = `${process.env.JOBADDER_BASE_URL}/api/jobs/${id}/usertasks`;

    const response = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.JOBADDER_API_ACCESS_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(taskData),
    });

    if (!response.ok) {
      throw new Error(`Failed to create job user task: ${response.statusText}`);
    }

    return await response.json();
  },
});

export const getJobUserTaskTool = tool({
  name: "Get Job User Task",
  description: "Get a specific user task from a job",
  parameters: z.object({
    id: z.string().describe("The job ID"),
    taskId: z.string().describe("The task ID"),
  }),
  execute: async ({ id, taskId }) => {
    const url = `${process.env.JOBADDER_BASE_URL}/api/jobs/${id}/usertasks/${taskId}`;

    const response = await fetch(url, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${process.env.JOBADDER_API_ACCESS_TOKEN}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch job user task: ${response.statusText}`);
    }

    return await response.json();
  },
});

export const updateJobUserTaskTool = tool({
  name: "Update Job User Task",
  description: "Update a specific user task for a job",
  parameters: z.object({
    id: z.string().describe("The job ID"),
    taskId: z.string().describe("The task ID"),
    taskData: z.record(z.any()).describe("The task data to update"),
  }),
  execute: async ({ id, taskId, taskData }) => {
    const url = `${process.env.JOBADDER_BASE_URL}/api/jobs/${id}/usertasks/${taskId}`;

    const response = await fetch(url, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${process.env.JOBADDER_API_ACCESS_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(taskData),
    });

    if (!response.ok) {
      throw new Error(`Failed to update job user task: ${response.statusText}`);
    }

    return await response.json();
  },
});

export const getJobStatusListTool = tool({
  name: "Get Job Status List",
  description: "Get list of all job statuses",
  parameters: z.object({}),
  execute: async () => {
    const url = `${process.env.JOBADDER_BASE_URL}/api/jobs/lists/status`;

    const response = await fetch(url, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${process.env.JOBADDER_API_ACCESS_TOKEN}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(
        `Failed to fetch job status list: ${response.statusText}`
      );
    }

    return await response.json();
  },
});
