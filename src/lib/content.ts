export const profile = {
  name: "Sriram Parthiban",
  first: "Sriram",
  last: "Parthiban",
  role: "AI Automation Engineer",
  location: "Chennai, Tamil Nadu, India",
  email: "sriramparthiban1970@gmail.com",
  phone: "+91 9345973779",
  linkedin: "https://linkedin.com/in/sriram-parthiban",
  github: "https://github.com/sriramparthiban",
  available: true,
};

export const intro = {
  lead: "I build automation that removes work,",
  leadAccent: "not just software.",
  body: [
    "I design and ship end-to-end automation systems — the kind that quietly delete hours of manual process every week and keep doing it after I leave.",
    "My background sits at the intersection of AI/ML and operations: a B.Tech in Artificial Intelligence and Data Science, two years building production workflows for clients across industries, and a habit of measuring everything I ship.",
  ],
};

export type Metric = {
  value: number;
  suffix: string;
  label: string;
  detail: string;
};

export const metrics: Metric[] = [
  {
    value: 70,
    suffix: "%",
    label: "Manual time removed",
    detail: "Across 15+ deployed n8n workflows",
  },
  {
    value: 40,
    suffix: "%",
    label: "Campaign performance lift",
    detail: "Via ML and statistical optimization",
  },
  {
    value: 80,
    suffix: "%",
    label: "Faster data processing",
    detail: "BigQuery query optimization",
  },
  {
    value: 99,
    suffix: "%",
    label: "Data accuracy",
    detail: "Real-time multi-platform sync",
  },
];

export type Capability = {
  title: string;
  blurb: string;
  stack: string[];
};

export const capabilities: Capability[] = [
  {
    title: "Automation & Integration",
    blurb:
      "Workflow architecture that connects systems which were never designed to talk to each other.",
    stack: ["n8n", "Zapier", "Make.com", "REST APIs", "Webhooks", "Workflow Design"],
  },
  {
    title: "Data & Analytics",
    blurb:
      "Pipelines and dashboards that turn raw operational exhaust into decisions people actually make.",
    stack: [
      "Python",
      "SQL",
      "Power BI",
      "Looker Studio",
      "BigQuery",
      "Statistical Analysis",
    ],
  },
  {
    title: "AI & Machine Learning",
    blurb:
      "Applied ML for routing, prediction and content generation — scoped to problems where it earns its cost.",
    stack: ["TensorFlow", "OpenAI", "Deep Learning", "Feature Engineering", "Retell"],
  },
  {
    title: "Operations & Delivery",
    blurb:
      "Requirements to running system, including the handover that makes teams keep using it.",
    stack: [
      "Supply Chain Ops",
      "Process Optimization",
      "Client Communication",
      "Jira",
      "Notion",
    ],
  },
];

export type Role = {
  company: string;
  title: string;
  place: string;
  period: string;
  current: boolean;
  points: string[];
};

export const experience: Role[] = [
  {
    company: "Aspire Media Marketing",
    title: "AI Automation Engineer",
    place: "Remote / Canada",
    period: "Jun 2024 — Present",
    current: true,
    points: [
      "Designed and deployed 15+ end-to-end automation workflows in n8n, cutting manual processing time by 70% for clients across multiple industries.",
      "Built API integrations linking CRM systems, marketing platforms and data sources into seamless flows, enabling real-time decisions for stakeholders.",
      "Translated business requirements into technical specifications with cross-functional teams, delivering scalable solutions that exceeded satisfaction targets.",
      "Applied machine learning and statistical analysis to optimize automation strategy, producing a 40% improvement in campaign performance and reliability.",
      "Ran knowledge-transfer sessions with client teams, sustaining 95%+ user satisfaction on adopted systems.",
    ],
  },
  {
    company: "Wonkrew",
    title: "Data Analyst Intern",
    place: "Chennai",
    period: "Aug 2023 — Jan 2024",
    current: false,
    points: [
      "Analyzed large-scale datasets in Python and SQL, lifting predictive model accuracy by 25% through preprocessing and feature engineering.",
      "Processed real-time datasets in Google BigQuery, optimizing queries to cut processing time by 80%.",
      "Built interactive Power BI and Looker Studio dashboards that helped stakeholders decide 50% faster.",
      "Documented analytical methods and solution architecture, establishing practices the team reused.",
    ],
  },
];

export type Project = {
  index: string;
  title: string;
  summary: string;
  results: { value: string; label: string }[];
  stack: string[];
};

export const projects: Project[] = [
  {
    index: "01",
    title: "End-to-End Business Process Automation Suite",
    summary:
      "A comprehensive automation framework tying AI voice agents, chat systems and CRM workflows into one architecture — scaled to over 1,000 daily interactions at sub-second response times.",
    results: [
      { value: "70%", label: "Support workload removed" },
      { value: "1000+", label: "Daily interactions handled" },
      { value: "99%", label: "Data accuracy" },
    ],
    stack: ["n8n", "OpenAI", "Retell", "GoHighLevel", "REST APIs", "Webhooks"],
  },
  {
    index: "02",
    title: "Cost-Optimized AI Content Generation Pipeline",
    summary:
      "An automated pipeline producing high-quality AI video at $6 per unit by orchestrating Fal AI and Google Veo 3 — a 90% cost reduction against traditional production, with retry logic that holds up when APIs wobble.",
    results: [
      { value: "90%", label: "Cost reduction" },
      { value: "75%", label: "Less production time" },
      { value: "98%", label: "Workflow success rate" },
    ],
    stack: ["n8n", "Fal AI", "Veo 3", "OpenAI", "Cloud Storage APIs"],
  },
  {
    index: "03",
    title: "Intelligent Data Processing & Integration System",
    summary:
      "An email parsing system that extracts structured data and syncs it across Google Sheets and Slack in real time, with validation and alerting that catch anomalies before anyone downstream feels them.",
    results: [
      { value: "80%", label: "Fewer data entry errors" },
      { value: "60%", label: "Faster incident response" },
      { value: "0", label: "Manual entry steps" },
    ],
    stack: ["n8n", "Gmail API", "Google Sheets API", "Slack API", "Python"],
  },
];

export const education = {
  degree: "B.Tech, Artificial Intelligence and Data Science",
  school: "St. Joseph's Institute of Technology",
  period: "Oct 2021 — May 2025",
  detail: "CGPA 7.56",
  coursework: [
    "Machine Learning",
    "Artificial Intelligence",
    "Data Science",
    "Deep Learning",
    "Statistical Analysis",
  ],
};

export const certifications = [
  { name: "Supply Chain Operations", issuer: "Udemy" },
  { name: "SQL for Data Science", issuer: "UC Davis · Coursera" },
  { name: "Data Analytics", issuer: "PrepInsta" },
  { name: "Power BI and Business Intelligence", issuer: "PrepInsta" },
  { name: "Preparing Data for Analysis with Excel", issuer: "PrepInsta" },
  { name: "TensorFlow", issuer: "Udemy" },
  { name: "E-Business", issuer: "NPTEL" },
];

export const marqueeWords = [
  "n8n",
  "Python",
  "SQL",
  "BigQuery",
  "OpenAI",
  "Power BI",
  "Webhooks",
  "TensorFlow",
  "Looker Studio",
  "REST APIs",
  "Make.com",
  "Zapier",
];

export const navLinks = [
  { label: "About", href: "#about" },
  { label: "Capabilities", href: "#capabilities" },
  { label: "Work", href: "#work" },
  { label: "Projects", href: "#projects" },
  { label: "Contact", href: "#contact" },
];
