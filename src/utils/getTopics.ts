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

  const topicsMap = new Map<string, { total: number; ids: string[] }>();

  for (const qn of onlyMcq) {
    const slices = qn.topic_name.split(">>");

    if (slices[0].trim() === decodeURIComponent(chapter)) {
      const name = slices[1].trim();
      const currentIds = topicsMap.get(name)?.ids || [];
      topicsMap.set(name, {
        total: (topicsMap.get(name)?.total || 0) + 1,
        ids: [...currentIds, qn.unique_id],
      });
    }
  }

  return [...topicsMap].map(([name, value]) => {
    return { name, total: value.total, ids: value.ids };
  });
};

export default getTopics;
