import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useNavigate } from "react-router-dom";
import { TrendingUp, Users, CheckCircle, Clock, Plus } from "lucide-react";

interface DashboardProps {
  onLogout: () => void;
}

export const Dashboard = ({ onLogout }: DashboardProps) => {
  const navigate = useNavigate();

  const statusCounts = {
    total: 24,
    pending: 6,
    processing: 4,
    completed: 14
  };

  const recentTasks = [
    { 
      id: "1",
      title: "Update user interface", 
      status: "completed" as const, 
      priority: "high" as const,
      assignee: "John Doe",
      dueDate: "2024-01-20"
    },
    { 
      id: "2",
      title: "Fix login authentication", 
      status: "processing" as const, 
      priority: "medium" as const,
      assignee: "Jane Smith",
      dueDate: "2024-01-22"
    },
    { 
      id: "3",
      title: "Add email notifications", 
      status: "pending" as const, 
      priority: "low" as const,
      assignee: "Mike Johnson",
      dueDate: "2024-01-25"
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed": return "bg-success text-success-foreground";
      case "processing": return "bg-warning text-warning-foreground";
      case "pending": return "bg-muted text-muted-foreground";
      default: return "bg-muted text-muted-foreground";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high": return "bg-destructive text-destructive-foreground";
      case "medium": return "bg-warning text-warning-foreground";
      case "low": return "bg-success text-success-foreground";
      default: return "bg-muted text-muted-foreground";
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold">Welcome to TaskFlow</h1>
            <p className="text-muted-foreground">
              Manage your tasks and team efficiently
            </p>
          </div>
          
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              onClick={() => navigate("/dashboard/users")}
              className="gap-2"
            >
              <Users className="h-4 w-4" />
              Manage Users
            </Button>
            <Button 
              variant="gradient" 
              onClick={() => navigate("/dashboard/tasks")}
              className="gap-2"
            >
              <Plus className="h-4 w-4" />
              Create Task
            </Button>
          </div>
        </div>

        {/* Status Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => navigate("/dashboard/tasks")}>
            <CardHeader className="pb-2">
              <CardDescription className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                Total Tasks
              </CardDescription>
              <CardTitle className="text-3xl text-primary">{statusCounts.total}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">
                +2 from last week
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardHeader className="pb-2">
              <CardDescription className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-success" />
                Completed
              </CardDescription>
              <CardTitle className="text-3xl text-success">{statusCounts.completed}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">
                  {Math.round((statusCounts.completed / statusCounts.total) * 100)}% completion rate
                </p>
                <Progress value={(statusCounts.completed / statusCounts.total) * 100} className="h-1" />
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardHeader className="pb-2">
              <CardDescription className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-warning" />
                In Progress
              </CardDescription>
              <CardTitle className="text-3xl text-warning">{statusCounts.processing}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">
                Currently active
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardHeader className="pb-2">
              <CardDescription className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                Pending Tasks
              </CardDescription>
              <CardTitle className="text-3xl text-muted-foreground">{statusCounts.pending}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">
                Awaiting assignment
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Recent Tasks</CardTitle>
                <CardDescription>
                  Your latest task activities
                </CardDescription>
              </div>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => navigate("/dashboard/tasks")}
              >
                View All
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentTasks.map((task) => (
                  <div 
                    key={task.id} 
                    className="flex items-center justify-between border-b pb-3 last:border-b-0 hover:bg-accent/50 -mx-2 px-2 py-2 rounded-md cursor-pointer transition-colors"
                    onClick={() => navigate(`/dashboard/tasks/${task.id}`)}
                  >
                    <div className="space-y-1">
                      <p className="font-medium leading-tight">{task.title}</p>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">
                          {task.assignee}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          Due: {new Date(task.dueDate).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <Badge className={getStatusColor(task.status)} variant="secondary">
                        {task.status}
                      </Badge>
                      <Badge className={getPriorityColor(task.priority)} variant="outline">
                        {task.priority}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>
                Common tasks and operations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div 
                  className="p-4 border rounded-lg hover:bg-accent/50 cursor-pointer transition-colors group"
                  onClick={() => navigate("/dashboard/tasks")}
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-md group-hover:bg-primary/20 transition-colors">
                      <Plus className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-medium">Create New Task</h3>
                      <p className="text-sm text-muted-foreground">Add a new task to your project</p>
                    </div>
                  </div>
                </div>
                
                <div 
                  className="p-4 border rounded-lg hover:bg-accent/50 cursor-pointer transition-colors group"
                  onClick={() => navigate("/dashboard/users")}
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-md group-hover:bg-primary/20 transition-colors">
                      <Users className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-medium">Manage Users</h3>
                      <p className="text-sm text-muted-foreground">Add or edit team members</p>
                    </div>
                  </div>
                </div>
                
                <div className="p-4 border rounded-lg hover:bg-accent/50 cursor-pointer transition-colors group">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-md group-hover:bg-primary/20 transition-colors">
                      <TrendingUp className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-medium">Generate Report</h3>
                      <p className="text-sm text-muted-foreground">Export task statistics</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};