import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  TreePine, 
  CheckCircle, 
  Clock, 
  Users, 
  TrendingUp, 
  TrendingDown,
  BarChart3,
  Eye,
  Download,
  Filter,
  RefreshCw,
  Sparkles,
  ArrowUpRight,
  MapPin
} from 'lucide-react';
import { Link } from 'react-router-dom';

interface StatItem {
  id: string;
  title: string;
  value: number;
  displayValue: string;
  icon: React.ElementType;
  color: string;
  bgColor: string;
  trend: {
    value: number;
    isPositive: boolean;
    label: string;
  };
  description: string;
  actionLabel: string;
  actionHref?: string;
  onClick?: () => void;
}

interface InteractiveStatsProps {
  className?: string;
}

const InteractiveStats: React.FC<InteractiveStatsProps> = ({ className = "" }) => {
  const [animatedValues, setAnimatedValues] = useState<Record<string, number>>({});
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedStat, setSelectedStat] = useState<string | null>(null);

  const statsData: StatItem[] = [
    {
      id: 'villages',
      title: 'Total Villages',
      value: 50247,
      displayValue: '50,247',
      icon: TreePine,
      color: 'text-blue-600',
      bgColor: 'from-blue-50 to-blue-100 hover:from-blue-100 hover:to-blue-200',
      trend: {
        value: 12,
        isPositive: true,
        label: 'vs last quarter'
      },
      description: 'Villages covered under FRA implementation across all states',
      actionLabel: 'View Map',
      actionHref: '/atlas'
    },
    {
      id: 'pattas',
      title: 'Approved Pattas',
      value: 125089,
      displayValue: '125,089',
      icon: CheckCircle,
      color: 'text-green-600',
      bgColor: 'from-green-50 to-green-100 hover:from-green-100 hover:to-green-200',
      trend: {
        value: 8,
        isPositive: true,
        label: 'this month'
      },
      description: 'Individual and Community Forest Rights successfully granted',
      actionLabel: 'View Records',
      actionHref: '/atlas'
    },
    {
      id: 'claims',
      title: 'Active Claims',
      value: 8456,
      displayValue: '8,456',
      icon: Clock,
      color: 'text-amber-600',
      bgColor: 'from-amber-50 to-amber-100 hover:from-amber-100 hover:to-amber-200',
      trend: {
        value: 5,
        isPositive: false,
        label: 'pending review'
      },
      description: 'Claims currently under processing and verification',
      actionLabel: 'Review Claims',
      actionHref: '/admin'
    },
    {
      id: 'beneficiaries',
      title: 'Beneficiaries',
      value: 15847,
      displayValue: '15,847',
      icon: Users,
      color: 'text-purple-600',
      bgColor: 'from-purple-50 to-purple-100 hover:from-purple-100 hover:to-purple-200',
      trend: {
        value: 15,
        isPositive: true,
        label: 'new this week'
      },
      description: 'Tribal families benefited from government schemes',
      actionLabel: 'DSS Analysis',
      actionHref: '/dss'
    }
  ];

  // Animated counter hook
  const useCountUp = (end: number, duration: number = 2000) => {
    const [count, setCount] = useState(0);
    
    useEffect(() => {
      let startTime: number;
      let animationId: number;
      
      const animate = (currentTime: number) => {
        if (!startTime) startTime = currentTime;
        const progress = Math.min((currentTime - startTime) / duration, 1);
        
        setCount(Math.floor(progress * end));
        
        if (progress < 1) {
          animationId = requestAnimationFrame(animate);
        }
      };
      
      animationId = requestAnimationFrame(animate);
      
      return () => {
        if (animationId) cancelAnimationFrame(animationId);
      };
    }, [end, duration]);
    
    return count;
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    setIsRefreshing(false);
  };

  const handleStatClick = (statId: string) => {
    setSelectedStat(selectedStat === statId ? null : statId);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { 
      opacity: 0, 
      y: 30, 
      scale: 0.9 
    },
    visible: { 
      opacity: 1, 
      y: 0, 
      scale: 1,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 15
      }
    }
  };

  const cardVariants = {
    hover: { 
      y: -8,
      scale: 1.02,
      transition: { 
        type: "spring", 
        stiffness: 300, 
        damping: 20 
      }
    },
    tap: { 
      scale: 0.98 
    }
  };

  return (
    <div className={`w-full ${className}`}>
      {/* Header Section */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between mb-8"
      >
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-3">
            <BarChart3 className="w-7 h-7 text-primary" />
            System Overview
          </h2>
          <p className="text-muted-foreground mt-1">
            Real-time statistics from the Forest Rights Management System
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="flex items-center gap-2"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button variant="outline" size="sm" className="flex items-center gap-2">
            <Download className="w-4 h-4" />
            Export
          </Button>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <motion.div
        className="grid lg:grid-cols-4 md:grid-cols-2 gap-6"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {statsData.map((stat, index) => {
          const StatIcon = stat.icon;
          const TrendIcon = stat.trend.isPositive ? TrendingUp : TrendingDown;
          const isSelected = selectedStat === stat.id;
          
          return (
            <motion.div
              key={stat.id}
              variants={itemVariants}
              whileHover="hover"
              whileTap="tap"
              onClick={() => handleStatClick(stat.id)}
            >
              <motion.div variants={cardVariants}>
                <Card 
                  className={`relative overflow-hidden cursor-pointer transition-all duration-300 
                    bg-gradient-to-br ${stat.bgColor} 
                    border-2 hover:border-opacity-50 hover:shadow-xl
                    ${isSelected ? 'ring-2 ring-primary ring-offset-2 border-primary' : 'border-transparent'}
                  `}
                >
                  {/* Background decoration */}
                  <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16"></div>
                  <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full translate-y-12 -translate-x-12"></div>
                  
                  {/* Sparkle effect on hover */}
                  <motion.div
                    className="absolute top-2 right-2"
                    whileHover={{ 
                      rotate: 180,
                      scale: 1.2,
                      transition: { duration: 0.3 }
                    }}
                  >
                    <Sparkles className="w-4 h-4 text-white/60" />
                  </motion.div>

                  <CardContent className="p-6 relative z-10">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 bg-white/90 rounded-lg shadow-sm`}>
                          <StatIcon className={`w-6 h-6 ${stat.color}`} />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
                          {isSelected && (
                            <motion.p
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: 'auto' }}
                              className="text-xs text-muted-foreground"
                            >
                              {stat.description}
                            </motion.p>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Main Value with Animation */}
                    <div className="mb-4">
                      <motion.div
                        className={`text-3xl font-bold ${stat.color}`}
                        whileHover={{ scale: 1.05 }}
                        transition={{ type: "spring", stiffness: 300 }}
                      >
                        <AnimatedCounter 
                          value={stat.value} 
                          suffix={stat.id === 'villages' || stat.id === 'pattas' ? '' : ''}
                        />
                      </motion.div>
                    </div>

                    {/* Trend Indicator */}
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <TrendIcon 
                          className={`w-4 h-4 ${
                            stat.trend.isPositive ? 'text-green-500' : 'text-red-500'
                          }`} 
                        />
                        <span 
                          className={`text-sm font-medium ${
                            stat.trend.isPositive ? 'text-green-600' : 'text-red-600'
                          }`}
                        >
                          {stat.trend.isPositive ? '+' : '-'}{stat.trend.value}%
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {stat.trend.label}
                        </span>
                      </div>
                      
                      {isSelected && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className="flex items-center gap-1"
                        >
                          <Badge variant="secondary" className="text-xs">
                            Live Data
                          </Badge>
                        </motion.div>
                      )}
                    </div>

                    {/* Progress Bar */}
                    <div className="mb-4">
                      <div className="h-2 bg-white/30 rounded-full overflow-hidden">
                        <motion.div
                          className={`h-full bg-gradient-to-r ${stat.bgColor.replace('from-', 'from-').replace('-50', '-400').replace('-100', '-500')}`}
                          initial={{ width: 0 }}
                          animate={{ width: `${Math.min((stat.value / 150000) * 100, 100)}%` }}
                          transition={{ duration: 1.5, delay: index * 0.2 }}
                        />
                      </div>
                    </div>

                    {/* Action Button */}
                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      {stat.actionHref ? (
                        <Button
                          asChild
                          size="sm"
                          variant="ghost"
                          className="w-full bg-white/20 hover:bg-white/30 text-foreground font-medium"
                        >
                          <Link to={stat.actionHref} className="flex items-center justify-center gap-2">
                            <Eye className="w-4 h-4" />
                            {stat.actionLabel}
                            <ArrowUpRight className="w-3 h-3 opacity-60" />
                          </Link>
                        </Button>
                      ) : (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={stat.onClick}
                          className="w-full bg-white/20 hover:bg-white/30 text-foreground font-medium"
                        >
                          <Eye className="w-4 h-4 mr-2" />
                          {stat.actionLabel}
                        </Button>
                      )}
                    </motion.div>

                    {/* Expanded Details */}
                    {isSelected && (
                      <motion.div
                        initial={{ opacity: 0, height: 0, marginTop: 0 }}
                        animate={{ opacity: 1, height: 'auto', marginTop: 16 }}
                        transition={{ duration: 0.3 }}
                        className="border-t border-white/20 pt-4"
                      >
                        <div className="grid grid-cols-2 gap-4 text-xs">
                          <div className="text-center">
                            <div className="font-semibold">Last Update</div>
                            <div className="text-muted-foreground">2 min ago</div>
                          </div>
                          <div className="text-center">
                            <div className="font-semibold">Source</div>
                            <div className="text-muted-foreground">Real-time</div>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </CardContent>

                  {/* Hover Indicator */}
                  <motion.div
                    className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                    initial={{ scaleX: 0 }}
                    whileHover={{ scaleX: 1 }}
                    transition={{ duration: 0.3 }}
                  />
                </Card>
              </motion.div>
            </motion.div>
          );
        })}
      </motion.div>

      {/* Additional Insights */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.2 }}
        className="mt-8 grid md:grid-cols-3 gap-4"
      >
        <Card className="p-4 bg-gradient-to-br from-blue-50/50 to-blue-100/50 border border-blue-200/50">
          <div className="flex items-center gap-3">
            <MapPin className="w-5 h-5 text-blue-600" />
            <div>
              <div className="text-sm font-medium">Coverage Rate</div>
              <div className="text-xs text-muted-foreground">89.2% of eligible villages</div>
            </div>
          </div>
        </Card>
        
        <Card className="p-4 bg-gradient-to-br from-green-50/50 to-green-100/50 border border-green-200/50">
          <div className="flex items-center gap-3">
            <TrendingUp className="w-5 h-5 text-green-600" />
            <div>
              <div className="text-sm font-medium">Success Rate</div>
              <div className="text-xs text-muted-foreground">94.7% approval rate</div>
            </div>
          </div>
        </Card>
        
        <Card className="p-4 bg-gradient-to-br from-purple-50/50 to-purple-100/50 border border-purple-200/50">
          <div className="flex items-center gap-3">
            <Clock className="w-5 h-5 text-purple-600" />
            <div>
              <div className="text-sm font-medium">Avg. Processing</div>
              <div className="text-xs text-muted-foreground">12.3 days per claim</div>
            </div>
          </div>
        </Card>
      </motion.div>
    </div>
  );
};

// Animated Counter Component
const AnimatedCounter: React.FC<{ value: number; suffix?: string }> = ({ value, suffix = '' }) => {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    const duration = 2000;
    const start = Date.now();
    const startValue = 0;

    const animate = () => {
      const now = Date.now();
      const progress = Math.min((now - start) / duration, 1);
      const easeOutCubic = 1 - Math.pow(1 - progress, 3);
      
      setDisplayValue(Math.floor(easeOutCubic * value));

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }, [value]);

  return (
    <span>
      {displayValue.toLocaleString()}{suffix}
    </span>
  );
};

export { InteractiveStats };
export default InteractiveStats;
