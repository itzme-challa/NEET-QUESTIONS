import { Question } from "../../type";
import biology from "../../data/biology.json";
import chemistry from "../../data/chemistry.json";
import physics from "../../data/physics.json";

const getChapters = ({
  subject,
}: {
  subject: "biology" | "physics" | "chemistry";
}) => {
  const data =
    subject === "biology"
      ? (biology as Question[])
      : subject === "chemistry"
      ? (chemistry as Question[])
      : (physics as Question[]);

  const onlyMcq = data.filter((qn) => qn.quiz_type === "mcq");
  const chaptersMap = new Map<string, { total: number; ids: string[] }>();

  for (const qn of onlyMcq) {
    const slices = qn.topic_name.split(">>");
    const name = slices[0].trim();
    const currentIds = chaptersMap.get(name)?.ids || [];
    chaptersMap.set(name, {
      total: (chaptersMap.get(name)?.total || 0) + 1,
      ids: [...currentIds, qn.unique_id],
    });
  }

  return [...chaptersMap].map(([name, value]) => {
    return { name, total: value.total, ids: value.ids };
  });
};

export default getChapters;
