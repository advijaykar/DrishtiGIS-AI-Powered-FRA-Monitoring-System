import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, BarChart3, Sparkles, Zap, Activity } from 'lucide-react';
import { Link } from 'react-router-dom';
import { InteractiveStats } from '@/components/InteractiveStats';

const StatsDemo = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      {/* Header */}
      <header className="bg-card/80 backdrop-blur-sm border-b shadow-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" asChild>
                <Link to="/">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Home
                </Link>
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-foreground">Interactive Statistics Demo</h1>
                <p className="text-sm text-muted-foreground">Enhanced Statistical Cards with Animations</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <Badge variant="secondary" className="bg-primary/10 text-primary">
                <Activity className="w-3 h-3 mr-1" />
                Live Demo
              </Badge>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-12">
        {/* Demo Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <div className="flex items-center justify-center gap-3 mb-4">
            <BarChart3 className="w-8 h-8 text-primary" />
            <h2 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
              Interactive Statistics Cards
            </h2>
          </div>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            Experience beautiful, animated statistics cards with click interactions, hover effects, 
            trend indicators, and smooth number animations. Click on any card to reveal additional details!
          </p>
        </motion.div>

        {/* Features Overview */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="grid md:grid-cols-3 gap-6 mb-12"
        >
          <Card className="text-center p-6 border-2 bg-gradient-to-br from-blue-50/50 to-blue-100/50 dark:from-blue-950/50 dark:to-blue-900/50">
            <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <Zap className="w-6 h-6 text-white" />
            </div>
            <h3 className="font-semibold mb-2">Animated Counters</h3>
            <p className="text-sm text-muted-foreground">
              Numbers count up with smooth easing animations and proper formatting
            </p>
          </Card>

          <Card className="text-center p-6 border-2 bg-gradient-to-br from-green-50/50 to-green-100/50 dark:from-green-950/50 dark:to-green-900/50">
            <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <Activity className="w-6 h-6 text-white" />
            </div>
            <h3 className="font-semibold mb-2">Interactive Elements</h3>
            <p className="text-sm text-muted-foreground">
              Click to expand details, hover for effects, and refresh for new data
            </p>
          </Card>

          <Card className="text-center p-6 border-2 bg-gradient-to-br from-purple-50/50 to-purple-100/50 dark:from-purple-950/50 dark:to-purple-900/50">
            <div className="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <h3 className="font-semibold mb-2">Beautiful Design</h3>
            <p className="text-sm text-muted-foreground">
              Gradient backgrounds, trend indicators, and progress bars
            </p>
          </Card>
        </motion.div>

        {/* Main Demo */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, delay: 0.4 }}
        >
          <InteractiveStats />
        </motion.div>

        {/* Features Breakdown */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="mt-16 grid md:grid-cols-2 gap-8"
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                Interactive Features
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-1.5 h-1.5 bg-primary rounded-full mt-2"></div>
                  <div>
                    <h4 className="font-medium">Click to Expand</h4>
                    <p className="text-sm text-muted-foreground">Click any card to reveal additional details and metadata</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-1.5 h-1.5 bg-green-500 rounded-full mt-2"></div>
                  <div>
                    <h4 className="font-medium">Hover Effects</h4>
                    <p className="text-sm text-muted-foreground">Smooth scaling, shadows, and animated elements on hover</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-1.5 h-1.5 bg-purple-500 rounded-full mt-2"></div>
                  <div>
                    <h4 className="font-medium">Action Buttons</h4>
                    <p className="text-sm text-muted-foreground">Direct navigation to relevant sections with visual feedback</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-1.5 h-1.5 bg-amber-500 rounded-full mt-2"></div>
                  <div>
                    <h4 className="font-medium">Refresh & Export</h4>
                    <p className="text-sm text-muted-foreground">Real-time data updates with loading states and export options</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                Visual Elements
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2"></div>
                  <div>
                    <h4 className="font-medium">Animated Numbers</h4>
                    <p className="text-sm text-muted-foreground">Count-up animations with easing and proper number formatting</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-1.5 h-1.5 bg-green-500 rounded-full mt-2"></div>
                  <div>
                    <h4 className="font-medium">Trend Indicators</h4>
                    <p className="text-sm text-muted-foreground">Visual trends with colored arrows and percentage changes</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-1.5 h-1.5 bg-purple-500 rounded-full mt-2"></div>
                  <div>
                    <h4 className="font-medium">Progress Bars</h4>
                    <p className="text-sm text-muted-foreground">Animated progress bars showing relative values</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-1.5 h-1.5 bg-amber-500 rounded-full mt-2"></div>
                  <div>
                    <h4 className="font-medium">Background Effects</h4>
                    <p className="text-sm text-muted-foreground">Gradient backgrounds, sparkle effects, and decorative elements</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Implementation Example */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.8 }}
          className="mt-12"
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
                Implementation Usage
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-muted p-6 rounded-lg font-mono text-sm">
                <div className="text-muted-foreground mb-2">// Import and use the component</div>
                <div className="text-green-600">import</div> <div className="text-blue-600">&#123; InteractiveStats &#125;</div> <div className="text-green-600">from</div> <div className="text-orange-600">'@/components/InteractiveStats'</div>;
                <br /><br />
                <div className="text-muted-foreground">// Use in your component</div><br />
                <div className="text-blue-600">&lt;</div><div className="text-red-600">InteractiveStats</div> <div className="text-green-600">className</div>=<div className="text-orange-600">"my-8"</div> <div className="text-blue-600">/&gt;</div>
              </div>
              
              <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4 text-center text-sm">
                <div>
                  <div className="font-semibold text-blue-600">50,247</div>
                  <div className="text-xs text-muted-foreground">Total Villages</div>
                </div>
                <div>
                  <div className="font-semibold text-green-600">125,089</div>
                  <div className="text-xs text-muted-foreground">Approved Pattas</div>
                </div>
                <div>
                  <div className="font-semibold text-amber-600">8,456</div>
                  <div className="text-xs text-muted-foreground">Active Claims</div>
                </div>
                <div>
                  <div className="font-semibold text-purple-600">15,847</div>
                  <div className="text-xs text-muted-foreground">Beneficiaries</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default StatsDemo;
