import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import * as api from "@/lib/api";
import { Plus, Edit, Trash, Image, List, Grid2x2, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { TaskViewToggle } from "@/components/tasks/TaskViewToggle";
import { TaskFormModal } from "@/components/tasks/TaskFormModal";
import { useToast } from "@/hooks/use-toast";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useEffect as useSocketEffect } from "react";
import { getSocket } from "@/lib/socket";

interface Document {
  id: string;
  original_url: string;
  status: "PENDING" | "PROCESSED";
  base64_data?: string;
}

interface Task {
  id: string;
  title: string;
  description: string;
  status: "pending" | "processing" | "completed";
  priority: "low" | "medium" | "high";
  createdAt: string;
  Documents?: Document[];
}

export const TaskList = () => {
  const navigate = useNavigate();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    (async () => {
      try {
        const data = await api.getTasks();
        setTasks(data);
      } catch (err) {
        toast({
          title: "Error",
          description: "Failed to load tasks",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // Real-time task and document updates via socket.io
  useSocketEffect(() => {
    const socket = getSocket();
    // When a new task is created
    socket.on('task-created', (task) => {
      setTasks(prev => [task, ...prev]);
    });
    // When a task is updated (e.g. document status changes)
    socket.on('task-updated', (updatedTask) => {
      setTasks(prev => prev.map(t => t.id === updatedTask.id ? updatedTask : t));
    });
    // When a document is updated (fallback for granular updates)
    socket.on('document-updated', (doc) => {
      setTasks(prev => prev.map(task => {
        if (!task.Documents) return task;
        if (!task.Documents.some(d => d.id === doc.id)) return task;
        return {
          ...task,
          Documents: task.Documents.map(d => d.id === doc.id ? doc : d)
        };
      }));
    });
    return () => {
      socket.off('task-created');
      socket.off('task-updated');
      socket.off('document-updated');
    };
  }, []);
   
  const [view, setView] = useState<"grid" | "list">("grid");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | undefined>();
  const { toast } = useToast();

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-destructive text-destructive-foreground";
      case "medium":
        return "bg-warning text-warning-foreground";
      case "low":
        return "bg-success text-success-foreground";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-success text-success-foreground";
      case "processing":
        return "bg-warning text-warning-foreground";
      case "pending":
        return "bg-muted text-muted-foreground";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const handleEdit = (task: Task) => {
    // Map Documents to images array for modal
    console.log(task);
    const images = Array.isArray(task.Documents)
      ? task.Documents.map(doc => doc.base64_data || doc.original_url).filter(Boolean)
      : [];
    setEditingTask({ ...task, images });
  };


  const handleDelete = async (taskId: string) => {
    try {
      await api.deleteTask(taskId);
      setTasks((prev) => prev.filter((t) => t.id !== taskId));
      toast({
        title: "Task Deleted",
        description: "Task has been successfully deleted.",
        variant: "destructive",
      });
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to delete task",
        variant: "destructive",
      });
    }
  };

  const handleSaveTask = async (taskData: Partial<Task>) => {
    try {
      if (editingTask) {
        const updated = await api.updateTask(editingTask.id, taskData);
        setTasks((prev) =>
          prev.map((t) => (t.id === editingTask.id ? updated : t))
        );
        toast({
          title: "Task Updated",
          description: "Task updated successfully.",
        });
      } else {
        // Ensure priority is uppercase for backend
        if (taskData.priority)
          taskData.priority = (taskData.priority as string).toUpperCase();
        // Always send as JSON with images as base64 array
        const created = await api.createTask(taskData as any);
        setTasks((prev) => [created, ...prev]);
        toast({
          title: "Task Created",
          description: "Task created successfully.",
        });
      }
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to save task",
        variant: "destructive",
      });
    }
    setEditingTask(undefined);
  };

  const handleViewDetails = (taskId: string) => {
    navigate(`/dashboard/tasks/${taskId}`);
  };

  if (loading) return <div className="p-8 text-center">Loading tasks...</div>;
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold">Tasks</h1>
            <p className="text-muted-foreground">
              Manage and track your tasks ({tasks.length} total)
            </p>
          </div>

          <div className="flex items-center gap-3">
            <TaskViewToggle view={view} onViewChange={setView} />
            <Button
              variant="gradient"
              className="gap-2"
              onClick={() => setIsCreateModalOpen(true)}
            >
              <Plus className="h-4 w-4" />
              Create Task
            </Button>
          </div>
        </div>

        {view === "grid" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tasks.map((task) => (
              <Card
                key={task.id}
                className="hover:shadow-lg transition-shadow duration-300 group"
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1 flex-1">
                      <CardTitle
                        className="text-lg leading-tight hover:text-primary cursor-pointer"
                        onClick={() => handleViewDetails(task.id)}
                      >
                        {task.title}
                      </CardTitle>
                      <CardDescription className="text-sm line-clamp-2">
                        {task.description}
                      </CardDescription>
                    </div>
                    <div className="flex gap-1 ml-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => handleViewDetails(task.id)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => handleEdit(task)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        className="h-8 w-8 text-destructive"
                        onClick={() => handleDelete(task.id)}
                      >
                        <Trash className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  <div className="flex flex-wrap gap-2">
                    <Badge className={getStatusColor(task.status)}>
                      {task.status}
                    </Badge>
                    <Badge className={getPriorityColor(task.priority)}>
                      {task.priority}
                    </Badge>
                  </div>

                  {Array.isArray(task.Documents) &&
                    task.Documents.length > 0 && (
                      <div className="space-y-2">
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <Image className="h-4 w-4" />
                          <span>{task.Documents.length} image(s)</span>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          {task.Documents.slice(0, 2).map((doc, index) => {
                            const imgSrc = doc.base64_data
                              ? doc.base64_data
                              : doc.original_url;
                            return (
                              <div
                                key={doc.id}
                                className="aspect-video bg-muted rounded-md overflow-hidden cursor-pointer hover:opacity-80 transition-opacity relative"
                                onClick={() => handleViewDetails(task.id)}
                              >
                                <img
                                  src={imgSrc}
                                  alt={`Task ${task.id} - Image ${index + 1}`}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                            );
                          })}
                          {task.Documents.length > 2 && (
                            <div
                              className="aspect-video bg-muted rounded-md flex items-center justify-center cursor-pointer hover:bg-muted/80 transition-colors"
                              onClick={() => handleViewDetails(task.id)}
                            >
                              <span className="text-sm text-muted-foreground">
                                +{task.Documents.length - 2} more
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                  <div className="text-xs text-muted-foreground">
                    Created: {new Date(task.createdAt).toLocaleDateString()}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Task</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Images</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tasks.map((task) => (
                  <TableRow key={task.id} className="hover:bg-muted/50">
                    <TableCell>
                      <div className="space-y-1">
                        <div
                          className="font-medium hover:text-primary cursor-pointer"
                          onClick={() => handleViewDetails(task.id)}
                        >
                          {task.title}
                        </div>
                        <div className="text-sm text-muted-foreground line-clamp-1">
                          {task.description}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(task.status)}>
                        {task.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={getPriorityColor(task.priority)}>
                        {task.priority}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {task.Documents?.length > 0 && (
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <Image className="h-4 w-4" />
                          <span>{task.Documents?.length}</span>
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {new Date(task.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button
                          className="h-8 w-8"
                          onClick={() => handleViewDetails(task.id)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          className="h-8 w-8"
                          onClick={() => handleEdit(task)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          className="h-8 w-8 text-destructive"
                          onClick={() => handleDelete(task.id)}
                        >
                          <Trash className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        )}

        {tasks.length === 0 && (
          <div className="text-center py-12">
            <div className="w-24 h-24 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
              <List className="h-12 w-12 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-2">No tasks yet</h3>
            <p className="text-muted-foreground mb-4">
              Create your first task to get started
            </p>
            <Button
              className="gap-2"
              onClick={() => setIsCreateModalOpen(true)}
            >
              <Plus className="h-4 w-4" />
              Create Your First Task
            </Button>
          </div>
        )}

        <TaskFormModal
          open={isCreateModalOpen || !!editingTask}
          onOpenChange={(open) => {
            if (!open) {
              setIsCreateModalOpen(false);
              setEditingTask(undefined);
            }
          }}
          task={editingTask}
          onSave={handleSaveTask}
        />
      </div>
    </DashboardLayout>
  );
};
