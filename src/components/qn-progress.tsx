"use client";
import { cn } from "@/lib/utils";
import useLocalStorage from "use-local-storage";

export function QnProgress({ questionIds, className }: { questionIds: string[], className?: string }) {
  const [completedQns, setCompletedQns] = useLocalStorage<{
    [kek: string]: boolean;
  }>("completedQn", {});
  const total = questionIds.length;
  let right = 0;
  let wrong = 0;
  let completed = 0;
  for (let index = 0; index < questionIds.length; index++) {
    if (completedQns[questionIds[index]] === true) right++;
    if (completedQns[questionIds[index]] === false) wrong++;
  }
  completed = right + wrong;

  return (
    <div className={cn("w-full flex justify-between gap-2", className)}>
      <div>
        
          Total: {completed}/{total}
        
      </div>
      <div className="flex gap-3">
        <div className="flex items-center gap-1">
          <div className="w-4 h-4 rounded-full bg-red-500"></div>
          <p>{wrong}</p>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-4 h-4 rounded-full bg-green-500"></div>
          <p>{right}</p>
        </div>
      </div>
    </div>
  );
}
