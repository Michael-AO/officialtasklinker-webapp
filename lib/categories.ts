/**
 * Shared task categories for browse filters and create-task form.
 * Keeps create and browse in sync for the presentation happy path.
 */
export const TASK_CATEGORIES = [
  "Web Development",
  "Mobile Development",
  "Design",
  "Writing",
  "Programming",
  "Marketing",
  "Data Science",
  "DevOps",
  "AI/ML",
  "Medicine and Health",
  "UI/UX Design",
  "Content Writing",
  "Digital Marketing",
  "Graphic Design",
  "Video Editing",
  "Translation",
  "Virtual Assistant",
  "Other",
] as const

export type TaskCategory = (typeof TASK_CATEGORIES)[number]
