import { Question } from "../../type";
import biology from "../../data/biology.json";
import chemistry from "../../data/chemistry.json";
import physics from "../../data/physics.json";

const getTopics = ({
  subject,
  chapter,
}: {
  subject: "biology" | "physics" | "chemistry";
  chapter: string;
}) => {
  const data =
    subject === "biology"
      ? (biology as Question[])
      : subject === "chemistry"
      ? (chemistry as Question[])
      : (physics as Question[]);
  const onlyMcq = data.filter((qn) => qn.quiz_type === "mcq");

  const topicsMap = new Map<string, number>();

  for (const qn of onlyMcq) {
    const slices = qn.topic_name.split(">>");

    if (slices[0].trim() === decodeURI(chapter)) {
      const name = slices[1].trim();
      topicsMap.set(name, (topicsMap.get(name) || 0) + 1);
    }
  }

  return [...topicsMap].map(([name, total]) => {
    return { name, total };
  });
};

export default getTopics;
