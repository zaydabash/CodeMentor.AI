import axios from 'axios'

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:8000'

const api = axios.create({
  baseURL: API_BASE,
})

export async function uploadZip(file: File): Promise<number> {
  const formData = new FormData()
  formData.append('file', file)
  const response = await api.post('/repos/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  return response.data.repo_id
}

export async function importGitUrl(gitUrl: string): Promise<number> {
  const response = await api.post('/repos/import', { git_url: gitUrl })
  return response.data.repo_id
}

export async function createJob(repoId: number, options?: any): Promise<{ job_id: number }> {
  const response = await api.post('/jobs', { repo_id: repoId, options })
  return response.data
}

export async function getJob(jobId: number): Promise<any> {
  const response = await api.get(`/jobs/${jobId}`)
  return response.data
}

export async function getJobIssues(jobId: number): Promise<any[]> {
  const response = await api.get(`/jobs/${jobId}/issues`)
  return response.data
}

export async function proposeFixes(jobId: number, issueIds: number[]): Promise<{ pr_id: number }> {
  const response = await api.post(`/jobs/${jobId}/propose`, { issue_ids: issueIds })
  return response.data
}

export async function getPR(prId: number): Promise<any> {
  const response = await api.get(`/prs/${prId}`)
  return response.data
}

