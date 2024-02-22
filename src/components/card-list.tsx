"use client"

import { useRef } from 'react';
import { ViewportList } from 'react-viewport-list';
import { Card } from "./card";

type ListItem = {
  name: string;
  total: number;
  ids: string[];
  href: string;
};

export default async function CardList({ lists }: { lists: ListItem[] }) {
  const ref = useRef<HTMLDivElement | null>(
    null,
  );

  return (
      <div className="grid gap-3" ref={ref}>
      <ViewportList
        viewportRef={ref}
        items={lists}
      >
        {list => (
            <Card
              key={list.name}
              href={list.href}
              data={list}
            />
          )}

        </ViewportList>
      </div>
  );
}
