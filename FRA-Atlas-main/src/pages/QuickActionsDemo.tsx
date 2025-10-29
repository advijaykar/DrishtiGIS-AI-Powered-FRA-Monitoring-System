import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Palette, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import { QuickActions } from '@/components/QuickActions';

const QuickActionsDemo = () => {
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
                <h1 className="text-2xl font-bold text-foreground">Quick Actions Demo</h1>
                <p className="text-sm text-muted-foreground">Enhanced UI Component Showcase</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <Badge variant="secondary" className="bg-primary/10 text-primary">
                <Sparkles className="w-3 h-3 mr-1" />
                Enhanced UI
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
            <Palette className="w-8 h-8 text-primary" />
            <h2 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
              Beautiful Quick Actions UI
            </h2>
          </div>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Experience the enhanced Quick Actions component with smooth animations, 
            beautiful gradients, and interactive hover effects.
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
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <h3 className="font-semibold mb-2">Smooth Animations</h3>
            <p className="text-sm text-muted-foreground">
              Framer Motion powered animations with stagger effects and smooth transitions
            </p>
          </Card>

          <Card className="text-center p-6 border-2 bg-gradient-to-br from-green-50/50 to-green-100/50 dark:from-green-950/50 dark:to-green-900/50">
            <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <Palette className="w-6 h-6 text-white" />
            </div>
            <h3 className="font-semibold mb-2">Beautiful Design</h3>
            <p className="text-sm text-muted-foreground">
              Gradient backgrounds, custom colors, and modern UI design patterns
            </p>
          </Card>

          <Card className="text-center p-6 border-2 bg-gradient-to-br from-amber-50/50 to-amber-100/50 dark:from-amber-950/50 dark:to-amber-900/50">
            <div className="w-12 h-12 bg-amber-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <ArrowLeft className="w-6 h-6 text-white" />
            </div>
            <h3 className="font-semibold mb-2">Interactive</h3>
            <p className="text-sm text-muted-foreground">
              Hover effects, click animations, and responsive design for all devices
            </p>
          </Card>
        </motion.div>

        {/* Main Demo */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, delay: 0.4 }}
        >
          <QuickActions />
        </motion.div>

        {/* Code Preview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="mt-16"
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                Implementation Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold mb-2">Features Implemented:</h4>
                  <ul className="text-sm space-y-2 text-muted-foreground">
                    <li>• Framer Motion animations with stagger effects</li>
                    <li>• Gradient backgrounds and hover states</li>
                    <li>• Interactive card scaling and floating elements</li>
                    <li>• Color-coded action categories</li>
                    <li>• Statistics footer with real-time data</li>
                    <li>• Additional tools section</li>
                    <li>• Responsive design for all screen sizes</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Usage in Component:</h4>
                  <div className="bg-muted p-4 rounded-lg text-sm font-mono">
                    <div className="text-muted-foreground">// Import the component</div>
                    <div>import &#123; QuickActions &#125; from '@/components/QuickActions';</div>
                    <br />
                    <div className="text-muted-foreground">// Use it in your page</div>
                    <div>&lt;QuickActions /&gt;</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default QuickActionsDemo;
