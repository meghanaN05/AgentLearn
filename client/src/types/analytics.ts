export interface TopicPerformance {
  topic: string;
  score: number;
}

export interface WeeklyProgress {
  week: string;
  score: number;
}

export interface Analytics {
  totalPDFs: number;
  totalChats: number;
  totalTests: number;
  averageScore: number;
  studyHours: number;

  topicPerformance: TopicPerformance[];

  weeklyProgress: WeeklyProgress[];
}