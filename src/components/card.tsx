"use client";

import React, { useMemo } from "react";
import { QnProgress } from "./qn-progress";
import { Progress } from "@/components/ui/progress";
import useLocalStorage from "use-local-storage";
import { Button } from "@/components/ui/button";
import { History } from "lucide-react";
import Link from "next/link";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "./ui/alert-dialog";

type CardData = {
  name: string;
  total?: number;
  ids: string[];
};

export function Card({ data, href }: { data: CardData; href: string }) {
  const [completedQns, setCompletedQns] = useLocalStorage<{
    [kek: string]: boolean;
  }>("completedQn", {});
  const [isOpen, setIsOpen] = React.useState<boolean>(false);
  const completed = useMemo(() => {
    let completed = 0;
    for (let index = 0; index < data.ids.length; index++) {
      if (completedQns[data.ids[index]] !== undefined) completed++;
    }
    return completed;
  }, [completedQns, data]);

  return (
    <div className="relative">
      <Link href={href}>
        <div className="w-full space-y-2 p-4 rounded capitalize bg-accent hover:outline hover:outline-slate-400 ">
          <div className="grid grid-cols-[1fr_auto] gap-2">
            <p className="text-lg">{data.name}</p>
            <div className="w-8 h-8"></div>
          </div>
          <QnProgress questionIds={data.ids} />
          <Progress
            value={(completed / data.ids.length) * 100}
            className="border border-slate-200 dark:border-slate-700"
          />
        </div>
      </Link>
      <Button
        className="z-10 absolute top-2 right-2 hover:outline hover:outline-slate-400"
        onClick={(event) => {
          setIsOpen(true);
        }}
        variant="outline"
        size="icon"
      >
        <History className="h-[1.2rem] w-[1.2rem]" />
      </Button>
      <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Do you want to undo all questions?
            </AlertDialogTitle>
            <AlertDialogDescription>
              This will set all questions of this section at it&apos;s initial
              state.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                data.ids.forEach((qnId) => {
                  if (completedQns[qnId] !== undefined) {
                    console.log("inside");
                    delete completedQns[qnId];
                  }
                });
                setCompletedQns({ ...completedQns });
              }}
            >
              Continue
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
