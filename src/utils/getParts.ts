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

  const partsMap = new Map<string, number>();

  for (const qn of onlyMcq) {
    const slices = qn.topic_name.split(">>");

    if (
      slices[0].trim() === decodeURI(chapter) &&
      slices[1].trim() === decodeURI(topic)
    ) {
      const name = slices[2].trim();
      partsMap.set(name, (partsMap.get(name) || 0) + 1);
    }
  }

  return [...partsMap].map(([name, total]) => {
    return { name, total };
  });
};

export default getParts;
