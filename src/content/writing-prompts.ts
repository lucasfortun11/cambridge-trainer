export type WritingPrompt = {
  slug: string;
  type: "ESSAY" | "PROPOSAL" | "REPORT" | "REVIEW" | "EMAIL_LETTER";
  title: string;
  brief: string;
  notes?: string[];
  minWords: number;
  maxWords: number;
};

export const WRITING_PROMPTS: WritingPrompt[] = [
  {
    slug: "essay-technology-jobs",
    type: "ESSAY",
    title: "Technology and the future of work",
    brief:
      "Your class has been discussing the impact of technology on employment. Your teacher has asked you to write an essay giving your opinion, using the notes below.\n\n\"Technology will destroy more jobs than it creates.\" Do you agree?",
    notes: ["Automation and job losses", "New industries and roles created", "Retraining and education"],
    minWords: 220,
    maxWords: 260,
  },
  {
    slug: "essay-city-vs-countryside",
    type: "ESSAY",
    title: "City life vs. countryside life",
    brief:
      "Your class has been discussing where people should live. Your teacher has asked you to write an essay giving your opinion, using the notes below.\n\n\"Young people are better off living in a big city than in the countryside.\" Do you agree?",
    notes: ["Career opportunities", "Cost of living", "Quality of life"],
    minWords: 220,
    maxWords: 260,
  },
  {
    slug: "proposal-community-centre",
    type: "PROPOSAL",
    title: "Improving the local community centre",
    brief:
      "Your local council has asked residents to submit proposals for improving the community centre. Write a proposal outlining problems with the current facilities, suggesting improvements, and explaining the benefits for the community.",
    minWords: 220,
    maxWords: 260,
  },
  {
    slug: "proposal-staff-wellbeing",
    type: "PROPOSAL",
    title: "A staff wellbeing programme",
    brief:
      "Your manager has asked you to propose a new wellbeing programme for staff. Write a proposal describing current problems, suggesting specific initiatives, and outlining expected benefits and costs.",
    minWords: 220,
    maxWords: 260,
  },
  {
    slug: "report-language-course",
    type: "REPORT",
    title: "A report on a language course",
    brief:
      "You recently completed an intensive English course. Your college has asked you to write a report evaluating the course, covering strengths, weaknesses, and recommendations for future improvement.",
    minWords: 220,
    maxWords: 260,
  },
  {
    slug: "report-office-facilities",
    type: "REPORT",
    title: "A report on office facilities",
    brief:
      "Your company is considering renovating the office. Write a report describing the current facilities, identifying problems, and recommending specific changes.",
    minWords: 220,
    maxWords: 260,
  },
  {
    slug: "review-streaming-series",
    type: "REVIEW",
    title: "A review of a streaming series",
    brief:
      "An online magazine has asked readers to submit reviews of a TV series they have watched recently. Write a review describing the plot briefly, evaluating the acting and production, and recommending it (or not) to other viewers.",
    minWords: 220,
    maxWords: 260,
  },
  {
    slug: "review-restaurant",
    type: "REVIEW",
    title: "A review of a restaurant",
    brief:
      "A local website has asked for reviews of restaurants in your area. Write a review describing the food, service and atmosphere, and give your overall recommendation.",
    minWords: 220,
    maxWords: 260,
  },
  {
    slug: "email-complaint-course",
    type: "EMAIL_LETTER",
    title: "A formal email of complaint",
    brief:
      "You booked a place on an online course that was cancelled at the last minute without proper notice. Write a formal email to the course provider explaining what happened, the inconvenience caused, and what you expect them to do about it.",
    minWords: 180,
    maxWords: 220,
  },
  {
    slug: "email-job-application",
    type: "EMAIL_LETTER",
    title: "A formal email applying for a position",
    brief:
      "You have seen an advertisement for a summer internship at an international company. Write a formal email applying for the position, explaining your relevant skills and experience and why you are interested.",
    minWords: 180,
    maxWords: 220,
  },
];
