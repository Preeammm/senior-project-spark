import { useQuery } from "@tanstack/react-query";
import { getRelevanceInfo, getRelevanceScores } from "../services/courses.api";
import type { Course } from "../types";

export function useCourses(careerFocus?: string) {
  return useQuery({
    queryKey: ["courses", careerFocus],
    queryFn: async () => {
      if (!careerFocus) {
        return [];
      }

      const [relevanceInfoData, relevanceScoresData] = await Promise.all([
        getRelevanceInfo(careerFocus),
        getRelevanceScores(careerFocus),
      ]);

      if (!Array.isArray(relevanceInfoData) || relevanceInfoData.length === 0) {
        return [];
      }

      if (!Array.isArray(relevanceScoresData) || relevanceScoresData.length === 0) {
        return [];
      }

      const infoByCourseCode = new Map<string, { courseName: string; skills: string[] }>();

      relevanceInfoData.forEach((infoRow: any) => {
        const courseCode = infoRow?.course_code;
        const courseName = infoRow?.course_name;
        const skillTitle = infoRow?.skill_title;

        if (!courseCode || !courseName || !skillTitle) {
          return;
        }

        const existing = infoByCourseCode.get(courseCode);
        if (existing) {
          if (existing.courseName !== courseName) {
            return;
          }
          if (!existing.skills.includes(skillTitle)) {
            existing.skills.push(skillTitle);
          }
        } else {
          infoByCourseCode.set(courseCode, {
            courseName,
            skills: [skillTitle],
          });
        }
      });

      const coursesFromApi: Course[] = relevanceScoresData
        .map((scoreRow: any) => {
          const courseCode = scoreRow?.course_code;
          const courseName = scoreRow?.course_name;
          if (!courseCode || !courseName) {
            return null;
          }

          const info = infoByCourseCode.get(courseCode);
          if (!info || info.courseName !== courseName) {
            return null;
          }

          const score = typeof scoreRow.score === "number" ? scoreRow.score : parseFloat(scoreRow.score || "0");
          const index = typeof scoreRow.index === "number" ? scoreRow.index : parseFloat(scoreRow.index || "0");

          return {
            id: courseCode,
            courseCode,
            courseName,
            competencyTags: info.skills,
            relevancePercent: 0,
            grade: "",
            skills: info.skills,
            score,
            index,
          } as Course;
        })
        .filter((course): course is Course => course !== null)
        .sort((a, b) => (b.index || 0) - (a.index || 0));

      return coursesFromApi;
    },
  });
}
