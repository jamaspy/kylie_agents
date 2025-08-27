import { tool } from "@openai/agents";
import { z } from "zod";

export const getPlacementsTool = tool({
  name: "Get Placements",
  description: "Get a list of placements with optional filtering parameters",
  parameters: z.object({
    placementId: z.string().nullable().optional(),
    candidateId: z.string().nullable().optional(),
    jobId: z.string().nullable().optional(),
    companyId: z.string().nullable().optional(),
    contactId: z.string().nullable().optional(),
    statusId: z.string().nullable().optional(),
    stage: z.string().nullable().optional(),
    createdAt: z.string().nullable().optional(),
    updatedAt: z.string().nullable().optional(),
    startDate: z.string().nullable().optional(),
    endDate: z.string().nullable().optional(),
    approvedDate: z.string().nullable().optional(),
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
    const url = `${process.env.NEXT_PUBLIC_API_URL || ""}/api/placements${
      queryString ? `?${queryString}` : ""
    }`;

    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch placements: ${response.statusText}`);
    }

    return await response.json();
  },
});

export const getPlacementByIdTool = tool({
  name: "Get Placement By ID",
  description: "Get a specific placement by its ID",
  parameters: z.object({
    id: z.string().describe("The placement ID"),
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
    const url = `${process.env.NEXT_PUBLIC_API_URL || ""}/api/placements/${id}${
      queryString ? `?${queryString}` : ""
    }`;

    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch placement: ${response.statusText}`);
    }

    return await response.json();
  },
});

export const updatePlacementTool = tool({
  name: "Update Placement",
  description: "Update a placement's information",
  parameters: z.object({
    id: z.string().describe("The placement ID"),
    data: z.record(z.any()).describe("The placement data to update"),
  }),
  execute: async ({ id, data }) => {
    const url = `${process.env.NEXT_PUBLIC_API_URL || ""}/api/placements/${id}`;

    const response = await fetch(url, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`Failed to update placement: ${response.statusText}`);
    }

    return await response.json();
  },
});

export const updatePlacementStatusTool = tool({
  name: "Update Placement Status",
  description: "Update a placement's status",
  parameters: z.object({
    id: z.string().describe("The placement ID"),
    statusData: z.record(z.any()).describe("The status data to update"),
  }),
  execute: async ({ id, statusData }) => {
    const url = `${
      process.env.NEXT_PUBLIC_API_URL || ""
    }/api/placements/${id}/status`;

    const response = await fetch(url, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(statusData),
    });

    if (!response.ok) {
      throw new Error(
        `Failed to update placement status: ${response.statusText}`
      );
    }

    return await response.json();
  },
});

export const getPlacementAttachmentsTool = tool({
  name: "Get Placement Attachments",
  description: "Get all attachments for a specific placement",
  parameters: z.object({
    id: z.string().describe("The placement ID"),
  }),
  execute: async ({ id }) => {
    const url = `${
      process.env.NEXT_PUBLIC_API_URL || ""
    }/api/placements/${id}/attachments`;

    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(
        `Failed to fetch placement attachments: ${response.statusText}`
      );
    }

    return await response.json();
  },
});

export const createPlacementAttachmentTool = tool({
  name: "Create Placement Attachment",
  description: "Create a new attachment for a placement",
  parameters: z.object({
    id: z.string().describe("The placement ID"),
    attachmentData: z.record(z.any()).describe("The attachment data"),
  }),
  execute: async ({ id, attachmentData }) => {
    const url = `${
      process.env.NEXT_PUBLIC_API_URL || ""
    }/api/placements/${id}/attachments`;

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(attachmentData),
    });

    if (!response.ok) {
      throw new Error(
        `Failed to create placement attachment: ${response.statusText}`
      );
    }

    return await response.json();
  },
});

export const getPlacementAttachmentTool = tool({
  name: "Get Placement Attachment",
  description: "Get a specific attachment from a placement",
  parameters: z.object({
    id: z.string().describe("The placement ID"),
    attachmentId: z.string().describe("The attachment ID"),
  }),
  execute: async ({ id, attachmentId }) => {
    const url = `${
      process.env.NEXT_PUBLIC_API_URL || ""
    }/api/placements/${id}/attachments/${attachmentId}`;

    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(
        `Failed to fetch placement attachment: ${response.statusText}`
      );
    }

    return await response.json();
  },
});

export const deletePlacementAttachmentTool = tool({
  name: "Delete Placement Attachment",
  description: "Delete a specific attachment from a placement",
  parameters: z.object({
    id: z.string().describe("The placement ID"),
    attachmentId: z.string().describe("The attachment ID"),
  }),
  execute: async ({ id, attachmentId }) => {
    const url = `${
      process.env.NEXT_PUBLIC_API_URL || ""
    }/api/placements/${id}/attachments/${attachmentId}`;

    const response = await fetch(url, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(
        `Failed to delete placement attachment: ${response.statusText}`
      );
    }

    return await response.json();
  },
});

export const getCustomFieldsTool = tool({
  name: "Get Custom Fields",
  description: "Get all custom fields for placements",
  parameters: z.object({}),
  execute: async () => {
    const url = `${
      process.env.NEXT_PUBLIC_API_URL || ""
    }/api/placements/fields/custom`;

    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch custom fields: ${response.statusText}`);
    }

    return await response.json();
  },
});

export const getCustomFieldTool = tool({
  name: "Get Custom Field",
  description: "Get a specific custom field by its ID",
  parameters: z.object({
    fieldId: z.string().describe("The custom field ID"),
  }),
  execute: async ({ fieldId }) => {
    const url = `${
      process.env.NEXT_PUBLIC_API_URL || ""
    }/api/placements/fields/custom/${fieldId}`;

    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch custom field: ${response.statusText}`);
    }

    return await response.json();
  },
});

export const getAttachmentCategoriesListTool = tool({
  name: "Get Attachment Categories List",
  description: "Get list of all attachment categories for placements",
  parameters: z.object({}),
  execute: async () => {
    const url = `${
      process.env.NEXT_PUBLIC_API_URL || ""
    }/api/placements/lists/attachmentcategory`;

    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(
        `Failed to fetch attachment categories: ${response.statusText}`
      );
    }

    return await response.json();
  },
});
