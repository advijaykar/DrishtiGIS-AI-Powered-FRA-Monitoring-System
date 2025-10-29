import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Target, 
  FileCheck, 
  Lightbulb, 
  Shield, 
  MapPin, 
  Activity, 
  Bell, 
  Settings,
  ArrowRight,
  Zap
} from 'lucide-react';

interface QuickAction {
  label: string;
  icon: React.ElementType;
  href: string;
  color: 'primary' | 'success' | 'warning';
  description?: string;
  badge?: string;
}

interface QuickActionsProps {
  className?: string;
}

const quickActions: QuickAction[] = [
  { 
    label: "View Records", 
    icon: FileCheck, 
    href: "/atlas", 
    color: "primary",
    description: "Browse and search FRA patta records with advanced filters and real-time data",
    badge: "1,247 Records"
  },
  { 
    label: "Decision Support", 
    icon: Lightbulb, 
    href: "/dss", 
    color: "success",
    description: "AI-powered recommendations for optimal scheme implementation and beneficiary analysis",
    badge: "94% Accuracy"
  },
  { 
    label: "Admin Panel", 
    icon: Shield, 
    href: "/admin", 
    color: "warning",
    description: "Complete administrative controls, user management, and system monitoring tools",
    badge: "Admin Only"
  }
];

const additionalTools = [
  { label: "Interactive Map", icon: MapPin, href: "/atlas", color: "text-primary" },
  { label: "AI Demo Hub", icon: Zap, href: "/demo", color: "text-success" },
  { label: "Notifications", icon: Bell, color: "text-warning" },
  { label: "Settings", icon: Settings, color: "text-muted-foreground" }
];

export const QuickActions: React.FC<QuickActionsProps> = ({ className = "" }) => {
  const containerVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20, scale: 0.9 },
    visible: { 
      opacity: 1, 
      y: 0, 
      scale: 1,
      transition: { duration: 0.5 }
    }
  };

  const cardVariants = {
    hover: { 
      scale: 1.02, 
      y: -4,
      transition: { type: "spring", stiffness: 300, damping: 20 }
    },
    tap: { scale: 0.98 }
  };

  const getColorClasses = (color: string) => {
    const colorMap = {
      primary: {
        bg: "bg-gradient-to-br from-blue-50 to-blue-100 hover:from-blue-100 hover:to-blue-200 dark:from-blue-950/50 dark:to-blue-900/50",
        border: "border-blue-200 hover:border-blue-300 dark:border-blue-800",
        icon: "text-blue-600 dark:text-blue-400",
        text: "text-blue-900 dark:text-blue-100",
        accent: "bg-blue-500"
      },
      success: {
        bg: "bg-gradient-to-br from-green-50 to-green-100 hover:from-green-100 hover:to-green-200 dark:from-green-950/50 dark:to-green-900/50",
        border: "border-green-200 hover:border-green-300 dark:border-green-800",
        icon: "text-green-600 dark:text-green-400",
        text: "text-green-900 dark:text-green-100",
        accent: "bg-green-500"
      },
      warning: {
        bg: "bg-gradient-to-br from-amber-50 to-amber-100 hover:from-amber-100 hover:to-amber-200 dark:from-amber-950/50 dark:to-amber-900/50",
        border: "border-amber-200 hover:border-amber-300 dark:border-amber-800",
        icon: "text-amber-600 dark:text-amber-400",
        text: "text-amber-900 dark:text-amber-100",
        accent: "bg-amber-500"
      }
    };
    return colorMap[color as keyof typeof colorMap] || colorMap.primary;
  };

  return (
    <motion.div
      className={`w-full ${className}`}
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <Card className="shadow-lg bg-gradient-to-br from-background via-background to-muted/30 border-2 border-muted/50 backdrop-blur-sm">
        {/* Header */}
        <CardHeader className="pb-6 border-b border-muted/20">
          <motion.div variants={itemVariants}>
            <CardTitle className="flex items-center gap-4 text-xl">
              <div className="relative">
                <div className="w-12 h-12 bg-gradient-to-br from-primary/20 to-primary/10 rounded-xl flex items-center justify-center border border-primary/20">
                  <Target className="w-7 h-7 text-primary" />
                </div>
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full animate-pulse"></div>
              </div>
              <div>
                <h3 className="font-bold bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">
                  Quick Actions
                </h3>
                <p className="text-sm text-muted-foreground font-normal mt-1">
                  Access key features instantly with one click
                </p>
              </div>
            </CardTitle>
          </motion.div>
        </CardHeader>

        <CardContent className="p-8 space-y-8">
          {/* Main Actions Grid */}
          <div className="grid md:grid-cols-3 gap-6">
            {quickActions.map((action, index) => {
              const colors = getColorClasses(action.color);
              
              return (
                <motion.div
                  key={index}
                  variants={itemVariants}
                  whileHover="hover"
                  whileTap="tap"
                >
                  <Link to={action.href} className="block h-full">
                    <motion.div variants={cardVariants} className="h-full">
                      <Card className={`h-full transition-all duration-300 hover:shadow-xl cursor-pointer border-2 ${colors.bg} ${colors.border} relative overflow-hidden group`}>
                        {/* Background decoration */}
                        <div className="absolute top-0 right-0 w-24 h-24 bg-white/5 rounded-full -translate-y-12 translate-x-12 group-hover:scale-150 transition-transform duration-500"></div>
                        
                        <CardContent className="p-6 text-center space-y-4 relative z-10">
                          {/* Icon Container */}
                          <div className="flex justify-center relative">
                            <div className="w-20 h-20 bg-white/90 dark:bg-background/90 rounded-2xl flex items-center justify-center shadow-lg ring-2 ring-white/50 dark:ring-background/50 group-hover:scale-110 transition-transform duration-300">
                              <action.icon className={`w-9 h-9 ${colors.icon}`} />
                            </div>
                            {/* Floating indicator */}
                            <div className={`absolute -top-2 -right-2 w-6 h-6 ${colors.accent} rounded-full flex items-center justify-center animate-bounce`}>
                              <ArrowRight className="w-3 h-3 text-white" />
                            </div>
                          </div>

                          {/* Content */}
                          <div className="space-y-3">
                            <div>
                              <h4 className={`font-bold text-xl ${colors.text} group-hover:scale-105 transition-transform duration-200`}>
                                {action.label}
                              </h4>
                              {action.badge && (
                                <Badge 
                                  variant="outline" 
                                  className={`mt-2 ${colors.text} border-current bg-white/60 dark:bg-background/60`}
                                >
                                  {action.badge}
                                </Badge>
                              )}
                            </div>
                            
                            <p className="text-sm text-muted-foreground leading-relaxed min-h-[2.5rem]">
                              {action.description}
                            </p>
                          </div>

                          {/* Action Button */}
                          <div className="pt-2">
                            <Button
                              size="sm"
                              className={`${colors.accent} hover:opacity-90 text-white font-medium px-6 py-2 rounded-full transition-all duration-200 group-hover:shadow-lg`}
                            >
                              Access Now
                              <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform duration-200" />
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  </Link>
                </motion.div>
              );
            })}
          </div>
          
          {/* Additional Tools Section */}
          <motion.div variants={itemVariants} className="border-t border-muted/20 pt-6">
            <div className="flex items-center justify-between mb-6">
              <h4 className="text-sm font-semibold text-muted-foreground flex items-center gap-2">
                <Activity className="w-4 h-4" />
                Additional Tools & Features
              </h4>
              <Badge variant="outline" className="text-xs">
                Quick Access
              </Badge>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {additionalTools.map((tool, index) => (
                <motion.div
                  key={index}
                  variants={itemVariants}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {tool.href ? (
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-auto p-4 justify-start hover:bg-muted/50 transition-all duration-200 group border border-transparent hover:border-muted/20" 
                      asChild
                    >
                      <Link to={tool.href} className="flex items-center gap-3">
                        <tool.icon className={`w-4 h-4 ${tool.color} group-hover:scale-110 transition-transform duration-200`} />
                        <span className="text-xs font-medium">{tool.label}</span>
                      </Link>
                    </Button>
                  ) : (
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-auto p-4 justify-start hover:bg-muted/50 transition-all duration-200 group border border-transparent hover:border-muted/20"
                    >
                      <tool.icon className={`w-4 h-4 ${tool.color} group-hover:scale-110 transition-transform duration-200 mr-3`} />
                      <span className="text-xs font-medium">{tool.label}</span>
                    </Button>
                  )}
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Statistics Footer */}
          <motion.div variants={itemVariants} className="border-t border-muted/20 pt-6">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="space-y-1">
                <div className="text-lg font-bold text-primary">1,247</div>
                <div className="text-xs text-muted-foreground">Active Records</div>
              </div>
              <div className="space-y-1">
                <div className="text-lg font-bold text-success">94%</div>
                <div className="text-xs text-muted-foreground">AI Accuracy</div>
              </div>
              <div className="space-y-1">
                <div className="text-lg font-bold text-warning">24/7</div>
                <div className="text-xs text-muted-foreground">System Uptime</div>
              </div>
            </div>
          </motion.div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default QuickActions;
