import { Button } from "@/components/ui/button";
import { Grid2x2, List } from "lucide-react";

interface TaskViewToggleProps {
  view: "grid" | "list";
  onViewChange: (view: "grid" | "list") => void;
}

export const TaskViewToggle = ({ view, onViewChange }: TaskViewToggleProps) => {
  return (
    <div className="flex bg-muted rounded-lg p-1">
      <Button
        variant={view === "grid" ? "default" : "ghost"}
        size="sm"
        onClick={() => onViewChange("grid")}
        className="gap-2"
      >
        <Grid2x2 className="h-4 w-4" />
        Grid
      </Button>
      <Button
        variant={view === "list" ? "default" : "ghost"}
        size="sm"
        onClick={() => onViewChange("list")}
        className="gap-2"
      >
        <List className="h-4 w-4" />
        List
      </Button>
    </div>
  );
};