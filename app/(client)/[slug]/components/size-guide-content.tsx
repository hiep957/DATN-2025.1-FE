"use client";

import Image from "next/image";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";

type TabKey = "men" | "women" | "kids" | "accessories";

const SIZE_GUIDE: Record<TabKey, { label: string; imgSrc: string; imgAlt: string }> = {
  men: { label: "Nam", imgSrc: "/size-guide/nam.png", imgAlt: "Bảng size Nam" },
  women: { label: "Nữ", imgSrc: "/size-guide/nu.png", imgAlt: "Bảng size Nữ" },
  kids: { label: "Trẻ em", imgSrc: "/size-guide/tre-em.png", imgAlt: "Bảng size Trẻ em" },
  accessories: { label: "Phụ kiện", imgSrc: "/size-guide/phu-kien.png", imgAlt: "Bảng size Phụ kiện" },
};

export function SizeGuideContent() {
  return (
    <Tabs defaultValue="men" className="w-full">
      <div className="pb-3">
        <TabsList className="w-full">
          {(Object.keys(SIZE_GUIDE) as TabKey[]).map((key) => (
            <TabsTrigger key={key} value={key} className="flex-1">
              {SIZE_GUIDE[key].label}
            </TabsTrigger>
          ))}
        </TabsList>
      </div>

      {(Object.keys(SIZE_GUIDE) as TabKey[]).map((key) => (
        <TabsContent key={key} value={key} className="m-0">
          {/* sheet/dialog đều dùng được: h calc theo viewport */}
          <ScrollArea className="h-[65vh] rounded-md border">
            <div className="p-3">
              <Image
                src={SIZE_GUIDE[key].imgSrc}
                alt={SIZE_GUIDE[key].imgAlt}
                width={1200}
                height={2400}
                className="h-auto w-full rounded"
                priority={key === "men"}
              />
            </div>
          </ScrollArea>
        </TabsContent>
      ))}
    </Tabs>
  );
}
