import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import * as api from "@/lib/api";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { TaskFormModal } from "@/components/tasks/TaskFormModal";
import { useToast } from "@/hooks/use-toast";
import { ArrowDown, Edit, Image as ImageIcon, FileText } from "lucide-react";

interface Task {
  id: string;
  title: string;
  description: string;
  status: "pending" | "processing" | "completed";
  priority: "low" | "medium" | "high";
  createdAt: string;
  updatedAt: string;
  assignee: string;
  estimatedHours: number;
  actualHours: number;
  tags?: string[];
  Documents?: Array<{ id: string; base64_data: string; original_url: string; status: string }>;
}

export const TaskDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [task, setTask] = useState<Task | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  console.log(task);

  useEffect(() => {
    (async () => {
      if (!id) return;
      try {
        const data = await api.getTask(id);
        setTask(data);
      } catch (err) {
        toast({ title: "Error", description: "Failed to load task", variant: "destructive" });
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high": return "bg-destructive text-destructive-foreground";
      case "medium": return "bg-warning text-warning-foreground";
      case "low": return "bg-success text-success-foreground";
      default: return "bg-muted text-muted-foreground";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed": return "bg-success text-success-foreground";
      case "processing": return "bg-warning text-warning-foreground";
      case "pending": return "bg-muted text-muted-foreground";
      default: return "bg-muted text-muted-foreground";
    }
  };

  const handleSaveTask = async (taskData: Partial<Task>) => {
    if (!task) return;
    try {
      const updated = await api.updateTask(task.id, taskData);
      setTask(updated);
      toast({
        title: "Task Updated",
        description: "Task has been updated successfully.",
      });
    } catch (err) {
      toast({ title: "Error", description: "Failed to update task", variant: "destructive" });
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long", 
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  if (loading) return <div className="p-8 text-center">Loading task details...</div>;
  if (!task) return <div className="p-8 text-center text-red-500">Task not found.</div>;
  return (
    <>
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <Button
              variant="ghost"
              onClick={() => navigate("/dashboard/tasks")}
              className="mb-2"
            >
              <ArrowDown className="h-4 w-4 mr-2 rotate-90" />
              Back to Tasks
            </Button>
            <h1 className="text-3xl font-bold">{task.title}</h1>
            <p className="text-muted-foreground">Task #{task.id}</p>
          </div>
          
          <Button onClick={() => setIsEditModalOpen(true)} className="gap-2">
            <Edit className="h-4 w-4" />
            Edit Task
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Task Info */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Task Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-2">Description</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {task.description}
                  </p>
                </div>

                <Separator />

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium mb-1">Status</h4>
                    <Badge className={getStatusColor(task.status)}>{task.status}</Badge>
                  </div>
                  <div>
                    <h4 className="font-medium mb-1">Priority</h4>
                    <Badge className={getPriorityColor(task.priority)}>{task.priority}</Badge>
                  </div>
                </div>

                {/* <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium mb-1">Estimated Hours</h4>
                    <p className="text-muted-foreground">{task.estimatedHours}h</p>
                  </div>
                  <div>
                    <h4 className="font-medium mb-1">Actual Hours</h4>
                    <p className="text-muted-foreground">{task.actualHours}h</p>
                  </div>
                </div> */}

                {/* <div>
                  <h4 className="font-medium mb-2">Tags</h4>
                  <div className="flex flex-wrap gap-2">
                    {task.tags?.map((tag, index) => (
                      <Badge key={index}>{tag}</Badge>
                    ))}
                  </div>
                </div> */}
              </CardContent>
            </Card>
            

            {/* Images */}
            {(Array.isArray(task.Documents) && task.Documents.length > 0) && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <ImageIcon className="h-5 w-5" />
                    Images ({task.Documents.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    {task.Documents.map((image, index) => (
                       <div
                        key={index}
                        className="aspect-video bg-muted rounded-lg overflow-hidden cursor-pointer hover:opacity-80 transition-opacity"
                        onClick={() => setSelectedImage(image.base64_data)}
                      >
                        <img
                          src={image.base64_data}
                          alt={`Task ${task.id} - Image ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Task Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-medium mb-1">Assignee</h4>
                  <p className="text-muted-foreground">{task.assignee}</p>
                </div>
                
                <Separator />
                
                <div>
                  <h4 className="font-medium mb-1">Created</h4>
                  <p className="text-muted-foreground">{formatDate(task.createdAt)}</p>
                </div>
                
                <div>
                  <h4 className="font-medium mb-1">Last Updated</h4>
                  <p className="text-muted-foreground">{formatDate(task.updatedAt)}</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Progress</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Completion</span>
                    <span>75%</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div className="bg-primary h-2 rounded-full" style={{ width: "75%" }}></div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Image Modal */}
        {selectedImage && (
          <div
            className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
            onClick={() => setSelectedImage(null)}
          >
            <div className="max-w-4xl max-h-full">
              <img
                src={selectedImage}
                alt="Task image"
                className="max-w-full max-h-full object-contain"
              />
            </div>
          </div>
        )}

        <TaskFormModal
          open={isEditModalOpen}
          onOpenChange={setIsEditModalOpen}
          task={task}
          onSave={handleSaveTask}
        />
      </div>
    </DashboardLayout>
    </>
  );
};