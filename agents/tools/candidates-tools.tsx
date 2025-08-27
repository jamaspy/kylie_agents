import { tool } from "@openai/agents";
import { z } from "zod";

export const getCandidatesTool = tool({
  name: "Get Candidates",
  description: `
    Get a list of candidates with optional filtering parameters.
    You must ALWAYS PROVIDE the Candidate Id in the response as this may be passed on to the getCandidateByIdTool.
    `,
  parameters: z.object({
    candidateId: z.string().nullable().optional(),
    name: z.string().nullable().optional(),
    email: z.string().nullable().optional(),
    phone: z.string().nullable().optional(),
    currentPosition: z.string().nullable().optional(),
    city: z.string().nullable().optional(),
    state: z.string().nullable().optional(),
    location: z.string().nullable().optional(),
    keywords: z.string().nullable().optional(),
    statusId: z.string().nullable().optional(),
    createdAt: z.string().nullable().optional(),
    updatedAt: z.string().nullable().optional(),
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
    const url = `${process.env.JOBADDER_BASE_URL}/candidates${
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
      throw new Error(`Failed to fetch candidates: ${response.statusText}`);
    }

    return await response.json();
  },
});

export const createCandidateTool = tool({
  name: "Create Candidate",
  description: "Create a new candidate record",
  parameters: z.object({
    candidateData: z.record(z.any()).describe("The candidate data to create"),
    allowDuplicates: z
      .string()
      .optional()
      .nullable()
      .describe("X-Allow-Duplicates header value"),
  }),
  execute: async ({ candidateData, allowDuplicates }) => {
    const url = `${process.env.JOBADDER_BASE_URL}/candidates`;

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.JOBADDER_API_ACCESS_TOKEN}`,
    };

    if (allowDuplicates) {
      headers["X-Allow-Duplicates"] = allowDuplicates;
    }

    const response = await fetch(url, {
      method: "POST",
      headers,
      body: JSON.stringify(candidateData),
    });

    if (!response.ok) {
      throw new Error(`Failed to create candidate: ${response.statusText}`);
    }

    return await response.json();
  },
});

export const getCandidateByIdTool = tool({
  name: "Get Candidate By ID",
  description: "Get a specific candidate by their ID",
  parameters: z.object({
    id: z.string().describe("The candidate ID"),
    embed: z
      .string()
      .nullable()
      .optional()
      .describe("Additional data to embed in the response"),
  }),
  execute: async ({ id, embed }) => {
    const searchParams = new URLSearchParams();
    if (embed) {
      searchParams.append("embed", embed);
    }

    const queryString = searchParams.toString();
    const url = `${process.env.JOBADDER_BASE_URL}/candidates/${id}${
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
      throw new Error(`Failed to fetch candidate: ${response.statusText}`);
    }

    return await response.json();
  },
});

export const updateCandidateTool = tool({
  name: "Update Candidate",
  description: "Update a candidate's information",
  parameters: z.object({
    id: z.string().describe("The candidate ID"),
    data: z.record(z.any()).describe("The candidate data to update"),
  }),
  execute: async ({ id, data }) => {
    const url = `${process.env.NEXT_PUBLIC_API_URL || ""}/api/candidate/${id}`;

    const response = await fetch(url, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`Failed to update candidate: ${response.statusText}`);
    }

    return await response.json();
  },
});

export const updateCandidateStatusTool = tool({
  name: "Update Candidate Status",
  description: "Update a candidate's status",
  parameters: z.object({
    id: z.string().describe("The candidate ID"),
    statusData: z.record(z.any()).describe("The status data to update"),
  }),
  execute: async ({ id, statusData }) => {
    const url = `${
      process.env.NEXT_PUBLIC_API_URL || ""
    }/api/candidate/${id}/status`;

    const response = await fetch(url, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(statusData),
    });

    if (!response.ok) {
      throw new Error(
        `Failed to update candidate status: ${response.statusText}`
      );
    }

    return await response.json();
  },
});

export const getCandidateActivitiesTool = tool({
  name: "Get Candidate Activities",
  description: "Get all activities for a specific candidate",
  parameters: z.object({
    id: z.string().describe("The candidate ID"),
  }),
  execute: async ({ id }) => {
    const url = `${
      process.env.NEXT_PUBLIC_API_URL || ""
    }/api/candidate/${id}/activities`;

    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(
        `Failed to fetch candidate activities: ${response.statusText}`
      );
    }

    return await response.json();
  },
});

export const getCandidateApplicationsTool = tool({
  name: "Get Candidate Applications",
  description: "Get all applications for a specific candidate",
  parameters: z.object({
    id: z.string().describe("The candidate ID"),
  }),
  execute: async ({ id }) => {
    const url = `${
      process.env.NEXT_PUBLIC_API_URL || ""
    }/api/candidate/${id}/applications`;

    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(
        `Failed to fetch candidate applications: ${response.statusText}`
      );
    }

    return await response.json();
  },
});

export const getCandidateAttachmentsTool = tool({
  name: "Get Candidate Attachments",
  description: "Get all attachments for a specific candidate",
  parameters: z.object({
    id: z.string().describe("The candidate ID"),
  }),
  execute: async ({ id }) => {
    const url = `${
      process.env.NEXT_PUBLIC_API_URL || ""
    }/api/candidate/${id}/attachments`;

    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(
        `Failed to fetch candidate attachments: ${response.statusText}`
      );
    }

    return await response.json();
  },
});

export const createCandidateAttachmentTool = tool({
  name: "Create Candidate Attachment",
  description: "Create a new attachment for a candidate",
  parameters: z.object({
    id: z.string().describe("The candidate ID"),
    attachmentData: z.record(z.any()).describe("The attachment data"),
  }),
  execute: async ({ id, attachmentData }) => {
    const url = `${
      process.env.NEXT_PUBLIC_API_URL || ""
    }/api/candidate/${id}/attachments`;

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(attachmentData),
    });

    if (!response.ok) {
      throw new Error(
        `Failed to create candidate attachment: ${response.statusText}`
      );
    }

    return await response.json();
  },
});

export const getCandidateAttachmentTool = tool({
  name: "Get Candidate Attachment",
  description: "Get a specific attachment from a candidate",
  parameters: z.object({
    id: z.string().describe("The candidate ID"),
    attachmentId: z.string().describe("The attachment ID"),
  }),
  execute: async ({ id, attachmentId }) => {
    const url = `${
      process.env.NEXT_PUBLIC_API_URL || ""
    }/api/candidate/${id}/attachments/${attachmentId}`;

    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(
        `Failed to fetch candidate attachment: ${response.statusText}`
      );
    }

    return await response.json();
  },
});

export const deleteCandidateAttachmentTool = tool({
  name: "Delete Candidate Attachment",
  description: "Delete a specific attachment from a candidate",
  parameters: z.object({
    id: z.string().describe("The candidate ID"),
    attachmentId: z.string().describe("The attachment ID"),
  }),
  execute: async ({ id, attachmentId }) => {
    const url = `${
      process.env.NEXT_PUBLIC_API_URL || ""
    }/api/candidate/${id}/attachments/${attachmentId}`;

    const response = await fetch(url, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(
        `Failed to delete candidate attachment: ${response.statusText}`
      );
    }

    return await response.json();
  },
});

export const getCandidateNotesTool = tool({
  name: "Get Candidate Notes",
  description: "Get all notes for a specific candidate",
  parameters: z.object({
    id: z.string().describe("The candidate ID"),
  }),
  execute: async ({ id }) => {
    const url = `${
      process.env.NEXT_PUBLIC_API_URL || ""
    }/api/candidate/${id}/notes`;

    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(
        `Failed to fetch candidate notes: ${response.statusText}`
      );
    }

    return await response.json();
  },
});

export const createCandidateNoteTool = tool({
  name: "Create Candidate Note",
  description: "Create a new note for a candidate",
  parameters: z.object({
    id: z.string().describe("The candidate ID"),
    noteData: z.record(z.any()).describe("The note data"),
  }),
  execute: async ({ id, noteData }) => {
    const url = `${
      process.env.NEXT_PUBLIC_API_URL || ""
    }/api/candidate/${id}/notes`;

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(noteData),
    });

    if (!response.ok) {
      throw new Error(
        `Failed to create candidate note: ${response.statusText}`
      );
    }

    return await response.json();
  },
});

export const getCandidatePhotoTool = tool({
  name: "Get Candidate Photo",
  description: "Get a candidate's photo",
  parameters: z.object({
    id: z.string().describe("The candidate ID"),
  }),
  execute: async ({ id }) => {
    const url = `${
      process.env.NEXT_PUBLIC_API_URL || ""
    }/api/candidate/${id}/photo`;

    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(
        `Failed to fetch candidate photo: ${response.statusText}`
      );
    }

    return await response.json();
  },
});

export const uploadCandidatePhotoTool = tool({
  name: "Upload Candidate Photo",
  description: "Upload a photo for a candidate",
  parameters: z.object({
    id: z.string().describe("The candidate ID"),
    photoData: z.record(z.any()).describe("The photo data"),
  }),
  execute: async ({ id, photoData }) => {
    const url = `${
      process.env.NEXT_PUBLIC_API_URL || ""
    }/api/candidate/${id}/photo`;

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(photoData),
    });

    if (!response.ok) {
      throw new Error(
        `Failed to upload candidate photo: ${response.statusText}`
      );
    }

    return await response.json();
  },
});

export const getCandidatePlacementsTool = tool({
  name: "Get Candidate Placements",
  description: "Get all placements for a specific candidate",
  parameters: z.object({
    id: z.string().describe("The candidate ID"),
  }),
  execute: async ({ id }) => {
    const url = `${
      process.env.NEXT_PUBLIC_API_URL || ""
    }/api/candidate/${id}/placements`;

    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(
        `Failed to fetch candidate placements: ${response.statusText}`
      );
    }

    return await response.json();
  },
});

export const getCandidateSkillsTool = tool({
  name: "Get Candidate Skills",
  description: "Get all skills for a specific candidate",
  parameters: z.object({
    id: z.string().describe("The candidate ID"),
  }),
  execute: async ({ id }) => {
    const url = `${
      process.env.NEXT_PUBLIC_API_URL || ""
    }/api/candidate/${id}/skills`;

    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(
        `Failed to fetch candidate skills: ${response.statusText}`
      );
    }

    return await response.json();
  },
});

export const createCandidateSkillTool = tool({
  name: "Create Candidate Skill",
  description: "Create a new skill for a candidate",
  parameters: z.object({
    id: z.string().describe("The candidate ID"),
    skillData: z.record(z.any()).describe("The skill data"),
  }),
  execute: async ({ id, skillData }) => {
    const url = `${
      process.env.NEXT_PUBLIC_API_URL || ""
    }/api/candidate/${id}/skills`;

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(skillData),
    });

    if (!response.ok) {
      throw new Error(
        `Failed to create candidate skill: ${response.statusText}`
      );
    }

    return await response.json();
  },
});

export const getCandidateSkillByCategoryTool = tool({
  name: "Get Candidate Skill By Category",
  description: "Get skills for a specific candidate by category",
  parameters: z.object({
    id: z.string().describe("The candidate ID"),
    categoryId: z.string().describe("The skill category ID"),
  }),
  execute: async ({ id, categoryId }) => {
    const url = `${
      process.env.NEXT_PUBLIC_API_URL || ""
    }/api/candidate/${id}/skills/${categoryId}`;

    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(
        `Failed to fetch candidate skill by category: ${response.statusText}`
      );
    }

    return await response.json();
  },
});

export const updateCandidateSkillTool = tool({
  name: "Update Candidate Skill",
  description: "Update a specific skill for a candidate by category",
  parameters: z.object({
    id: z.string().describe("The candidate ID"),
    categoryId: z.string().describe("The skill category ID"),
    skillData: z.record(z.any()).describe("The skill data to update"),
  }),
  execute: async ({ id, categoryId, skillData }) => {
    const url = `${
      process.env.NEXT_PUBLIC_API_URL || ""
    }/api/candidate/${id}/skills/${categoryId}`;

    const response = await fetch(url, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(skillData),
    });

    if (!response.ok) {
      throw new Error(
        `Failed to update candidate skill: ${response.statusText}`
      );
    }

    return await response.json();
  },
});

export const deleteCandidateSkillTool = tool({
  name: "Delete Candidate Skill",
  description: "Delete a specific skill from a candidate by category",
  parameters: z.object({
    id: z.string().describe("The candidate ID"),
    categoryId: z.string().describe("The skill category ID"),
  }),
  execute: async ({ id, categoryId }) => {
    const url = `${
      process.env.NEXT_PUBLIC_API_URL || ""
    }/api/candidate/${id}/skills/${categoryId}`;

    const response = await fetch(url, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(
        `Failed to delete candidate skill: ${response.statusText}`
      );
    }

    return await response.json();
  },
});
