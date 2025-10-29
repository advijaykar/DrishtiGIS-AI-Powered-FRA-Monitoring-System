import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ArrowLeft, Shield, Users, FileCheck, AlertTriangle, Search, UserPlus, Eye, Trash2, CheckCircle, XCircle, Settings, Bell, Activity, Database } from "lucide-react";
import { Link } from "react-router-dom";
import LanguageSelector from "@/components/LanguageSelector";

// Mock data for admin
const mockUsers = [
  {
    id: 1,
    name: "Ramesh Kumar",
    phone: "+91 98765 43210",
    role: "Patta Holder",
    village: "Patalkot",
    status: "Active",
    lastLogin: "2025-01-06T10:30:00Z",
    joinDate: "2024-12-15"
  },
  {
    id: 2,
    name: "Sita Devi",
    phone: "+91 87654 32109",
    role: "Patta Holder", 
    village: "Similiguda",
    status: "Active",
    lastLogin: "2025-01-05T16:45:00Z",
    joinDate: "2024-11-20"
  },
  {
    id: 3,
    name: "Dr. Arjun Singh",
    phone: "+91 76543 21098",
    role: "Forest Officer",
    village: "Multiple",
    status: "Active",
    lastLogin: "2025-01-06T09:15:00Z",
    joinDate: "2024-10-10"
  }
];

const mockFeedback = [
  {
    id: 1,
    submitter: "Ramesh Kumar",
    village: "Patalkot",
    category: "Pond Issue",
    description: "Community pond needs cleaning and repair for monsoon season",
    status: "Under Review",
    priority: "Medium",
    submittedAt: "2025-01-06T08:00:00Z",
    coordinates: { lat: 22.0697, lng: 78.9629 }
  },
  {
    id: 2,
    submitter: "Sita Devi",
    village: "Similiguda",
    category: "Boundary Dispute",
    description: "Unclear boundaries between individual and community forest rights",
    status: "Pending",
    priority: "High",
    submittedAt: "2025-01-05T14:30:00Z",
    coordinates: { lat: 18.6298, lng: 82.8077 }
  },
  {
    id: 3,
    submitter: "Ganga Ram",
    village: "Eturnagaram",
    category: "Borewell Request",
    description: "Request for new borewell installation for drinking water access",
    status: "Approved",
    priority: "High",
    submittedAt: "2025-01-04T11:15:00Z",
    coordinates: { lat: 18.3222, lng: 80.1636 }
  }
];

const mockSystemStats = {
  totalUsers: 1247,
  activeUsers: 892,
  pendingApprovals: 34,
  systemUptime: 99.7,
  dataIntegrity: 98.9,
  lastBackup: "2025-01-06T02:00:00Z"
};

const Admin = () => {
  const { t } = useTranslation();
  const [selectedTab, setSelectedTab] = useState("overview");
  const [searchUser, setSearchUser] = useState("");
  const [searchFeedback, setSearchFeedback] = useState("");
  const [selectedFeedback, setSelectedFeedback] = useState(null);

  const filteredUsers = mockUsers.filter(user => 
    user.name.toLowerCase().includes(searchUser.toLowerCase()) ||
    user.village.toLowerCase().includes(searchUser.toLowerCase())
  );

  const filteredFeedback = mockFeedback.filter(feedback =>
    feedback.submitter.toLowerCase().includes(searchFeedback.toLowerCase()) ||
    feedback.village.toLowerCase().includes(searchFeedback.toLowerCase()) ||
    feedback.category.toLowerCase().includes(searchFeedback.toLowerCase())
  );

  const handleFeedbackAction = (id: number, action: 'approve' | 'reject') => {
    alert(`Feedback ${action}d successfully!`);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b shadow-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" asChild>
                <Link to="/">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  {t('common.backToHome')}
                </Link>
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-foreground">{t('admin.title')}</h1>
                <p className="text-sm text-muted-foreground">{t('admin.subtitle')}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <LanguageSelector variant="compact" />
              <Badge variant="secondary" className="bg-primary/10 text-primary">
                <Shield className="w-3 h-3 mr-1" />
                {t('admin.adminAccess')}
              </Badge>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <Activity className="w-4 h-4" />
              {t('admin.overview')}
            </TabsTrigger>
            <TabsTrigger value="users" className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              {t('admin.users')}
            </TabsTrigger>
            <TabsTrigger value="feedback" className="flex items-center gap-2">
              <FileCheck className="w-4 h-4" />
              {t('admin.feedback')}
            </TabsTrigger>
            <TabsTrigger value="system" className="flex items-center gap-2">
              <Settings className="w-4 h-4" />
              {t('admin.system')}
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="mt-6">
            <div className="grid md:grid-cols-4 gap-6 mb-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">{t('admin.totalUsers')}</p>
                        <p className="text-2xl font-bold text-primary">{mockSystemStats.totalUsers}</p>
                      </div>
                      <Users className="w-8 h-8 text-primary" />
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">{t('admin.activeUsers')}</p>
                        <p className="text-2xl font-bold text-success">{mockSystemStats.activeUsers}</p>
                      </div>
                      <Activity className="w-8 h-8 text-success" />
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">{t('admin.pendingApprovals')}</p>
                        <p className="text-2xl font-bold text-warning">{mockSystemStats.pendingApprovals}</p>
                      </div>
                      <AlertTriangle className="w-8 h-8 text-warning" />
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">{t('admin.systemUptime')}</p>
                        <p className="text-2xl font-bold text-success">{mockSystemStats.systemUptime}%</p>
                      </div>
                      <CheckCircle className="w-8 h-8 text-success" />
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </div>

            {/* Recent Activity */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Bell className="w-5 h-5" />
                    {t('admin.recentActivity')}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-success/10 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 bg-success rounded-full"></div>
                        <span className="text-sm">New user registration: Ramesh Kumar (Patalkot)</span>
                      </div>
                      <Badge variant="outline" className="text-xs">5 min ago</Badge>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-warning/10 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 bg-warning rounded-full"></div>
                        <span className="text-sm">Feedback requires approval: Boundary dispute in Similiguda</span>
                      </div>
                      <Badge variant="outline" className="text-xs">12 min ago</Badge>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-primary/10 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 bg-primary rounded-full"></div>
                        <span className="text-sm">System backup completed successfully</span>
                      </div>
                      <Badge variant="outline" className="text-xs">2 hours ago</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>

          {/* Users Tab */}
          <TabsContent value="users" className="mt-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder={t('admin.searchUsers')}
                    value={searchUser}
                    onChange={(e) => setSearchUser(e.target.value)}
                    className="pl-10 w-80"
                  />
                </div>
              </div>
              <Button className="bg-primary hover:bg-primary-hover">
                <UserPlus className="w-4 h-4 mr-2" />
                {t('admin.addUser')}
              </Button>
            </div>

            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t('admin.name')}</TableHead>
                      <TableHead>{t('admin.contact')}</TableHead>
                      <TableHead>{t('admin.role')}</TableHead>
                      <TableHead>{t('admin.village')}</TableHead>
                      <TableHead>{t('admin.status')}</TableHead>
                      <TableHead>{t('admin.lastLogin')}</TableHead>
                      <TableHead>{t('admin.actions')}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredUsers.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell className="font-medium">{user.name}</TableCell>
                        <TableCell>{user.phone}</TableCell>
                        <TableCell>
                          <Badge variant={user.role === "Forest Officer" ? "default" : "outline"}>
                            {user.role}
                          </Badge>
                        </TableCell>
                        <TableCell>{user.village}</TableCell>
                        <TableCell>
                          <Badge variant={user.status === "Active" ? "secondary" : "destructive"}>
                            {user.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {new Date(user.lastLogin).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button size="sm" variant="outline">
                              <Eye className="w-3 h-3" />
                            </Button>
                            <Button size="sm" variant="outline" className="text-destructive">
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Feedback Tab */}
          <TabsContent value="feedback" className="mt-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder={t('admin.searchFeedback')}
                    value={searchFeedback}
                    onChange={(e) => setSearchFeedback(e.target.value)}
                    className="pl-10 w-80"
                  />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline">{filteredFeedback.length} {t('admin.items')}</Badge>
              </div>
            </div>

            <div className="space-y-4">
              {filteredFeedback.map((feedback) => (
                <motion.div
                  key={feedback.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <Card className="hover:shadow-lg transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h4 className="font-semibold">{feedback.category}</h4>
                            <Badge variant={feedback.priority === "High" ? "destructive" : feedback.priority === "Medium" ? "secondary" : "outline"}>
                              {feedback.priority}
                            </Badge>
                            <Badge variant={feedback.status === "Approved" ? "secondary" : feedback.status === "Under Review" ? "outline" : "destructive"}>
                              {feedback.status}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">
                            {t('admin.submittedBy')}: {feedback.submitter} • {feedback.village}
                          </p>
                          <p className="text-sm mb-3">{feedback.description}</p>
                          <p className="text-xs text-muted-foreground">
                            {t('admin.submitted')}: {new Date(feedback.submittedAt).toLocaleString()}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button size="sm" variant="outline">
                              <Eye className="w-3 h-3 mr-2" />
                              {t('admin.viewDetails')}
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-2xl">
                            <DialogHeader>
                              <DialogTitle>{feedback.category} - {feedback.village}</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <p className="text-sm font-medium">{t('admin.submitter')}</p>
                                  <p className="text-sm text-muted-foreground">{feedback.submitter}</p>
                                </div>
                                <div>
                                  <p className="text-sm font-medium">{t('admin.priority')}</p>
                                  <Badge variant={feedback.priority === "High" ? "destructive" : "outline"}>
                                    {feedback.priority}
                                  </Badge>
                                </div>
                              </div>
                              <div>
                                <p className="text-sm font-medium mb-2">{t('admin.description')}</p>
                                <p className="text-sm text-muted-foreground p-3 bg-muted/30 rounded-lg">
                                  {feedback.description}
                                </p>
                              </div>
                              <div>
                                <p className="text-sm font-medium mb-2">{t('admin.location')}</p>
                                <p className="text-sm text-muted-foreground">
                                  {feedback.coordinates.lat.toFixed(6)}, {feedback.coordinates.lng.toFixed(6)}
                                </p>
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>

                        {feedback.status === "Pending" && (
                          <>
                            <Button
                              size="sm"
                              className="bg-success hover:bg-success/90"
                              onClick={() => handleFeedbackAction(feedback.id, 'approve')}
                            >
                              <CheckCircle className="w-3 h-3 mr-2" />
                              {t('admin.approve')}
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleFeedbackAction(feedback.id, 'reject')}
                            >
                              <XCircle className="w-3 h-3 mr-2" />
                              {t('admin.reject')}
                            </Button>
                          </>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </TabsContent>

          {/* System Tab */}
          <TabsContent value="system" className="mt-6">
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Database className="w-5 h-5" />
                    {t('admin.databaseStatus')}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">{t('admin.dataIntegrity')}</span>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-success rounded-full"></div>
                        <span className="text-sm text-success">{mockSystemStats.dataIntegrity}%</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">{t('admin.lastBackup')}</span>
                      <span className="text-sm text-muted-foreground">
                        {new Date(mockSystemStats.lastBackup).toLocaleString()}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">{t('admin.systemUptime')}</span>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-success rounded-full"></div>
                        <span className="text-sm text-success">{mockSystemStats.systemUptime}%</span>
                      </div>
                    </div>
                  </div>
                  <Button className="w-full mt-4" variant="outline">
                    {t('admin.runBackup')}
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="w-5 h-5" />
                    {t('admin.systemSettings')}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">{t('admin.autoApproval')}</span>
                      <Badge variant="outline">{t('admin.disabled')}</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">{t('admin.emailNotifications')}</span>
                      <Badge className="bg-success">{t('admin.enabled')}</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">{t('admin.smsAlerts')}</span>
                      <Badge className="bg-success">{t('admin.enabled')}</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">{t('admin.maintenanceMode')}</span>
                      <Badge variant="outline">{t('admin.disabled')}</Badge>
                    </div>
                  </div>
                  <Button className="w-full mt-4" variant="outline">
                    {t('admin.configureSettings')}
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Admin;