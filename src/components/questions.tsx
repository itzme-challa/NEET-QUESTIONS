"use client";

import * as React from "react";

import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from "@/components/ui/carousel";

import { Card, CardContent } from "@/components/ui/card";
import { Question } from "../../type";
import { Mcq } from "./mcq";

export function Questions({ questions }: { questions: Question[] }) {
  const [api, setApi] = React.useState<CarouselApi>();
  const [current, setCurrent] = React.useState(0);
  const [count, setCount] = React.useState(0);

  React.useEffect(() => {
    if (!api) {
      return;
    }

    setCount(api.scrollSnapList().length);
    setCurrent(api.selectedScrollSnap() + 1);

    api.on("select", () => {
      setCurrent(api.selectedScrollSnap() + 1);
    });
  }, [api]);

  return (
    <div className="mx-auto w-full max-w-2xl p-4">
      <div>
        <div className="">{}</div>
      </div>

      <Carousel  setApi={setApi} className="w-auto mx-[-1rem] overflow-hidden md:mx-4 md:overflow-visible">
        <CarouselContent>
          {questions.map((qn, index) => (
            <CarouselItem key={qn.unique_id}>
              <div className="p-1">
                <Card>
                  <CardContent className="flex p-6">
                    {qn.quiz_type === "mcq" ? <Mcq question={qn} index={index} /> : null}
                  </CardContent>
                </Card>
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious />
        <CarouselNext />
      </Carousel>
    </div>
  );
}
