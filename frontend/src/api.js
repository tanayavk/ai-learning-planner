// If deployed separately (e.g. Vercel + Render), VITE_API_BASE_URL can be set.
// Defaults to '/api' for unified single-server deployment.
const API_BASE = import.meta.env.VITE_API_BASE_URL || '/api';

export async function fetchStatus() {
  const res = await fetch(`${API_BASE}/status`);
  if (!res.ok) throw new Error('Failed to fetch system status');
  return res.json();
}

export async function fetchProfile() {
  const res = await fetch(`${API_BASE}/profile`);
  if (!res.ok) throw new Error('Failed to load profile');
  return res.json();
}

export async function updateProfile(data) {
  const res = await fetch(`${API_BASE}/profile`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed to update profile');
  return res.json();
}

export async function resetProfile() {
  const res = await fetch(`${API_BASE}/profile/reset`, {
    method: 'POST',
  });
  if (!res.ok) throw new Error('Failed to reset profile');
  return res.json();
}

export async function fetchPlan() {
  const res = await fetch(`${API_BASE}/plan`);
  if (!res.ok) throw new Error('Failed to load plan');
  return res.json();
}

export async function generatePlan(goal, days, level, hoursPerDay) {
  const res = await fetch(`${API_BASE}/plan/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      goal,
      days,
      level,
      hours_per_day: hoursPerDay,
    }),
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.detail || 'Failed to generate plan');
  }
  return res.json();
}

export async function clearPlan() {
  const res = await fetch(`${API_BASE}/plan`, {
    method: 'DELETE',
  });
  if (!res.ok) throw new Error('Failed to clear plan');
  return res.json();
}

export async function updateTask(taskId, completed) {
  const res = await fetch(`${API_BASE}/tasks/${taskId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ completed }),
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.detail || 'Failed to update task');
  }
  return res.json();
}

export async function generateNotes(topic, level) {
  const res = await fetch(`${API_BASE}/notes/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ topic, level }),
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.detail || 'Failed to generate study notes');
  }
  return res.json();
}

export async function generateQuiz(topic, level, numQuestions) {
  const res = await fetch(`${API_BASE}/quiz/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      topic,
      level,
      num_questions: numQuestions,
    }),
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.detail || 'Failed to generate quiz');
  }
  return res.json();
}

export async function submitQuiz(topic, answers, questions) {
  const res = await fetch(`${API_BASE}/quiz/submit`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ topic, answers, questions }),
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.detail || 'Failed to submit quiz');
  }
  return res.json();
}
