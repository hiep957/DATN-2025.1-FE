"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerTrigger } from "@/components/ui/drawer";
import { SizeGuideContent } from "./size-guide-content";
import { useIsMobile } from "@/hooks/use-mobile";




export function SizeGuidePopup() {
  // md trở lên dùng Dialog, dưới md dùng Drawer
  const isMobile = useIsMobile();

  if (isMobile) {
    // ✅ Mobile bottom sheet
    return (
      <Drawer>
        <DrawerTrigger asChild>
          <Button variant="outline">Bảng kích thước</Button>
        </DrawerTrigger>

        <DrawerContent className="max-h-[90vh]">
          <DrawerHeader className="pb-2">
            <DrawerTitle>Bảng kích thước</DrawerTitle>
            <p className="text-sm text-muted-foreground">
              Đổi, trả miễn phí tại nhà nếu không hài lòng
            </p>
          </DrawerHeader>

          <div className="px-4 pb-4">
            <SizeGuideContent />
          </div>
        </DrawerContent>
      </Drawer>
    );
  }

  // ✅ Desktop modal
  return (
    <Dialog>
      <DialogTrigger asChild className="flex w-1/4">
        <Button variant="outline">Bảng kích thước</Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-2xl max-h-[85vh] overflow-hidden">
        <DialogHeader className="pb-2">
          <DialogTitle>Bảng kích thước</DialogTitle>
          <p className="text-sm text-muted-foreground">
            Đổi, trả miễn phí tại nhà nếu không hài lòng
          </p>
        </DialogHeader>

        <SizeGuideContent />
      </DialogContent>
    </Dialog>
  );
}
