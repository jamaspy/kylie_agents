export async function jobadderFetch(path: string, options: RequestInit = {}) {
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
    throw new Error(
      `JobAdder API error: ${response.status} ${response.statusText}`
    );
  }

  return response.json();
}

export async function jobadderFetchRaw(
  path: string,
  options: RequestInit = {}
) {
  const response = await fetch(`${process.env.JOBADDER_BASE_URL}/${path}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${process.env.JOBADDER_API_ACCESS_TOKEN}`,
      "Content-Type": "application/json",
      ...options.headers,
    },
    ...options,
  });

  return response;
}
