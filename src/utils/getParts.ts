import { Question } from "../../type";
import biology from "../../data/biology.json";
import chemistry from "../../data/chemistry.json";
import physics from "../../data/physics.json";

const getParts = ({
  subject,
  chapter,
  topic,
}: {
  subject: "biology" | "physics" | "chemistry";
  chapter: string;
  topic: string;
}) => {
  const data =
    subject === "biology"
      ? (biology as Question[])
      : subject === "chemistry"
      ? (chemistry as Question[])
      : (physics as Question[]);
  const onlyMcq = data.filter((qn) => qn.quiz_type === "mcq");

  const partsMap = new Map<string, { total: number; ids: string[] }>();

  for (const qn of onlyMcq) {
    const slices = qn.topic_name.split(">>");

    if (
      slices[0].trim().toLowerCase() === decodeURIComponent(chapter) &&
      slices[1].trim().toLowerCase() === decodeURIComponent(topic)
    ) {
      const name = slices[2].trim().toLowerCase();
      const currentIds = partsMap.get(name)?.ids || [];
      partsMap.set(name, {
        total: (partsMap.get(name)?.total || 0) + 1,
        ids: [...currentIds, qn.unique_id],
      });
    }
  }

  return [...partsMap].map(([name, value]) => {
    return { name, total: value.total, ids: value.ids };
  });
};

export default getParts;
