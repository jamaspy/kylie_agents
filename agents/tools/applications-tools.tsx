import { tool } from "@openai/agents";
import { z } from "zod";

export const getApplicationsTool = tool({
  name: "Get Applications",
  description: "Get a list of applications with optional filtering parameters",
  parameters: z.object({
    applicationId: z.string().nullable().optional(),
    candidateId: z.string().nullable().optional(),
    jobId: z.string().nullable().optional(),
    companyId: z.string().nullable().optional(),
    contactId: z.string().nullable().optional(),
    statusId: z.string().nullable().optional(),
    stage: z.string().nullable().optional(),
    createdAt: z.string().nullable().optional(),
    updatedAt: z.string().nullable().optional(),
    submittedAt: z.string().nullable().optional(),
    ownerId: z.string().nullable().optional(),
    teamId: z.string().nullable().optional(),
    includeDetails: z.string().nullable().optional(),
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
    const url = `${process.env.NEXT_PUBLIC_API_URL || ""}/api/applications${
      queryString ? `?${queryString}` : ""
    }`;

    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch applications: ${response.statusText}`);
    }

    return await response.json();
  },
});

export const getApplicationByIdTool = tool({
  name: "Get Application By ID",
  description: "Get a specific application by its ID",
  parameters: z.object({
    id: z.string().describe("The application ID"),
    embed: z
      .string()
      .optional()
      .nullable()
      .describe("Additional data to embed in the response"),
  }),
  execute: async ({ id, embed }) => {
    const searchParams = new URLSearchParams();
    if (embed) {
      searchParams.append("embed", embed);
    }

    const queryString = searchParams.toString();
    const url = `${
      process.env.NEXT_PUBLIC_API_URL || ""
    }/api/applications/${id}${queryString ? `?${queryString}` : ""}`;

    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch application: ${response.statusText}`);
    }

    return await response.json();
  },
});

export const updateApplicationTool = tool({
  name: "Update Application",
  description: "Update an application's information",
  parameters: z.object({
    id: z.string().describe("The application ID"),
    data: z.record(z.any()).describe("The application data to update"),
  }),
  execute: async ({ id, data }) => {
    const url = `${
      process.env.NEXT_PUBLIC_API_URL || ""
    }/api/applications/${id}`;

    const response = await fetch(url, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`Failed to update application: ${response.statusText}`);
    }

    return await response.json();
  },
});

export const updateApplicationStatusTool = tool({
  name: "Update Application Status",
  description: "Update an application's status",
  parameters: z.object({
    id: z.string().describe("The application ID"),
    statusData: z.record(z.any()).describe("The status data to update"),
  }),
  execute: async ({ id, statusData }) => {
    const url = `${
      process.env.NEXT_PUBLIC_API_URL || ""
    }/api/applications/${id}/status`;

    const response = await fetch(url, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(statusData),
    });

    if (!response.ok) {
      throw new Error(
        `Failed to update application status: ${response.statusText}`
      );
    }

    return await response.json();
  },
});

export const getApplicationActivitiesTool = tool({
  name: "Get Application Activities",
  description: "Get all activities for a specific application",
  parameters: z.object({
    id: z.string().describe("The application ID"),
  }),
  execute: async ({ id }) => {
    const url = `${
      process.env.NEXT_PUBLIC_API_URL || ""
    }/api/applications/${id}/activities`;

    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(
        `Failed to fetch application activities: ${response.statusText}`
      );
    }

    return await response.json();
  },
});

export const createApplicationActivityTool = tool({
  name: "Create Application Activity",
  description: "Create a new activity for an application",
  parameters: z.object({
    id: z.string().describe("The application ID"),
    activityData: z.record(z.any()).describe("The activity data"),
  }),
  execute: async ({ id, activityData }) => {
    const url = `${
      process.env.NEXT_PUBLIC_API_URL || ""
    }/api/applications/${id}/activities`;

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(activityData),
    });

    if (!response.ok) {
      throw new Error(
        `Failed to create application activity: ${response.statusText}`
      );
    }

    return await response.json();
  },
});

export const getApplicationActivityTool = tool({
  name: "Get Application Activity",
  description: "Get a specific activity from an application",
  parameters: z.object({
    id: z.string().describe("The application ID"),
    activityId: z.string().describe("The activity ID"),
  }),
  execute: async ({ id, activityId }) => {
    const url = `${
      process.env.NEXT_PUBLIC_API_URL || ""
    }/api/applications/${id}/activities/${activityId}`;

    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(
        `Failed to fetch application activity: ${response.statusText}`
      );
    }

    return await response.json();
  },
});

export const updateApplicationActivityTool = tool({
  name: "Update Application Activity",
  description: "Update a specific activity for an application",
  parameters: z.object({
    id: z.string().describe("The application ID"),
    activityId: z.string().describe("The activity ID"),
    activityData: z.record(z.any()).describe("The activity data to update"),
  }),
  execute: async ({ id, activityId, activityData }) => {
    const url = `${
      process.env.NEXT_PUBLIC_API_URL || ""
    }/api/applications/${id}/activities/${activityId}`;

    const response = await fetch(url, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(activityData),
    });

    if (!response.ok) {
      throw new Error(
        `Failed to update application activity: ${response.statusText}`
      );
    }

    return await response.json();
  },
});

export const getApplicationAttachmentsTool = tool({
  name: "Get Application Attachments",
  description: "Get all attachments for a specific application",
  parameters: z.object({
    id: z.string().describe("The application ID"),
  }),
  execute: async ({ id }) => {
    const url = `${
      process.env.NEXT_PUBLIC_API_URL || ""
    }/api/applications/${id}/attachments`;

    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(
        `Failed to fetch application attachments: ${response.statusText}`
      );
    }

    return await response.json();
  },
});

export const createApplicationAttachmentTool = tool({
  name: "Create Application Attachment",
  description: "Create a new attachment for an application",
  parameters: z.object({
    id: z.string().describe("The application ID"),
    attachmentData: z.record(z.any()).describe("The attachment data"),
  }),
  execute: async ({ id, attachmentData }) => {
    const url = `${
      process.env.NEXT_PUBLIC_API_URL || ""
    }/api/applications/${id}/attachments`;

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(attachmentData),
    });

    if (!response.ok) {
      throw new Error(
        `Failed to create application attachment: ${response.statusText}`
      );
    }

    return await response.json();
  },
});

export const getApplicationAttachmentTool = tool({
  name: "Get Application Attachment",
  description: "Get a specific attachment from an application",
  parameters: z.object({
    id: z.string().describe("The application ID"),
    attachmentId: z.string().describe("The attachment ID"),
  }),
  execute: async ({ id, attachmentId }) => {
    const url = `${
      process.env.NEXT_PUBLIC_API_URL || ""
    }/api/applications/${id}/attachments/${attachmentId}`;

    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(
        `Failed to fetch application attachment: ${response.statusText}`
      );
    }

    return await response.json();
  },
});

export const deleteApplicationAttachmentTool = tool({
  name: "Delete Application Attachment",
  description: "Delete a specific attachment from an application",
  parameters: z.object({
    id: z.string().describe("The application ID"),
    attachmentId: z.string().describe("The attachment ID"),
  }),
  execute: async ({ id, attachmentId }) => {
    const url = `${
      process.env.NEXT_PUBLIC_API_URL || ""
    }/api/applications/${id}/attachments/${attachmentId}`;

    const response = await fetch(url, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(
        `Failed to delete application attachment: ${response.statusText}`
      );
    }

    return await response.json();
  },
});

export const getAllApplicationActivitiesTool = tool({
  name: "Get All Application Activities",
  description: "Get activities across all applications",
  parameters: z.object({}),
  execute: async () => {
    const url = `${
      process.env.NEXT_PUBLIC_API_URL || ""
    }/api/applications/activities`;

    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(
        `Failed to fetch all application activities: ${response.statusText}`
      );
    }

    return await response.json();
  },
});
