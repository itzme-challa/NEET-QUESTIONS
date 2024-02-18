export interface Question {
    unique_id: string;
    question: string;
    answer: string;
    explanation: string;
    topic_name: string;
    difficulty_level: string;
    option_a: string;
    option_b: string;
    option_c: string;
    option_d: string;
    quiz_type: string;
    "Syllabus update"?: string;
    "Syllabus Update"?: string;
    "Chapter Name"?: string;
    ncert22_page: string;
    ncert23_page: string;
  }