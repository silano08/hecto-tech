const GITHUB_API = 'https://api.github.com'

function headers(token: string) {
  return {
    Authorization: `Bearer ${token}`,
    Accept: 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28',
  }
}

export async function getDefaultBranchSha(
  token: string, owner: string, repo: string, branch: string
): Promise<string> {
  const res = await fetch(
    `${GITHUB_API}/repos/${owner}/${repo}/git/ref/heads/${branch}`,
    { headers: headers(token) }
  )
  if (!res.ok) throw new Error(`Failed to get branch SHA: ${res.status}`)
  const data = await res.json()
  return data.object.sha
}

export async function createBranch(
  token: string, owner: string, repo: string,
  branchName: string, sha: string
): Promise<void> {
  const res = await fetch(
    `${GITHUB_API}/repos/${owner}/${repo}/git/refs`,
    {
      method: 'POST',
      headers: headers(token),
      body: JSON.stringify({ ref: `refs/heads/${branchName}`, sha }),
    }
  )
  if (!res.ok) throw new Error(`Failed to create branch: ${res.status}`)
}

export async function commitFile(
  token: string, owner: string, repo: string,
  branch: string, path: string, content: string, message: string
): Promise<void> {
  const res = await fetch(
    `${GITHUB_API}/repos/${owner}/${repo}/contents/${path}`,
    {
      method: 'PUT',
      headers: headers(token),
      body: JSON.stringify({
        message,
        content: Buffer.from(content).toString('base64'),
        branch,
      }),
    }
  )
  if (!res.ok) throw new Error(`Failed to commit file: ${res.status}`)
}

export async function fileExists(
  token: string, owner: string, repo: string, path: string, branch: string
): Promise<boolean> {
  const res = await fetch(
    `${GITHUB_API}/repos/${owner}/${repo}/contents/${path}?ref=${branch}`,
    { headers: headers(token) }
  )
  return res.ok
}

export async function createPullRequest(
  token: string, owner: string, repo: string,
  params: { title: string; body: string; head: string; base: string }
): Promise<{ html_url: string }> {
  const res = await fetch(
    `${GITHUB_API}/repos/${owner}/${repo}/pulls`,
    {
      method: 'POST',
      headers: headers(token),
      body: JSON.stringify(params),
    }
  )
  if (!res.ok) throw new Error(`Failed to create PR: ${res.status}`)
  return res.json()
}
