import type { LucideIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export interface ServiceCardData {
  title: string;
  description: string;
  icon: LucideIcon;
}

export function ServiceCard({
  title,
  description,
  icon: Icon,
}: ServiceCardData) {
  return (
    <Card className="flex h-full flex-col">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Icon className="h-5 w-5 text-primary" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 text-sm text-muted-foreground">
        {description}
      </CardContent>
      <CardFooter className="mt-auto">
        <Button className="w-full">Book Now</Button>
      </CardFooter>
    </Card>
  );
}
