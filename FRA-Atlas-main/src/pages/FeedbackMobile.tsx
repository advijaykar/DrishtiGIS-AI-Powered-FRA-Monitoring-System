import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Camera, MapPin, Send, Wifi, WifiOff, Upload } from "lucide-react";
import { Link } from "react-router-dom";

const FeedbackMobile = () => {
  const [isOnline, setIsOnline] = useState(true);
  const [queuedItems, setQueuedItems] = useState(2);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);

  const categories = [
    { id: "pond", label: "Pond Issue", icon: "💧" },
    { id: "borewell", label: "Borewell Request", icon: "🕳️" },
    { id: "boundary", label: "Boundary Dispute", icon: "🗺️" },
    { id: "grievance", label: "General Grievance", icon: "📝" }
  ];

  const handleLocationCapture = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        setLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude
        });
      });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Mock submission
    alert("Feedback submitted successfully!");
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile Header */}
      <header className="bg-card border-b shadow-sm sticky top-0 z-10">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" asChild>
              <Link to="/">
                <ArrowLeft className="w-4 h-4" />
              </Link>
            </Button>
            <div>
              <h1 className="font-semibold">Patta Holder Feedback</h1>
              <p className="text-xs text-muted-foreground">Mobile App</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Badge variant={isOnline ? "secondary" : "destructive"} className="text-xs">
              {isOnline ? <Wifi className="w-3 h-3 mr-1" /> : <WifiOff className="w-3 h-3 mr-1" />}
              {isOnline ? "Online" : "Offline"}
            </Badge>
            {queuedItems > 0 && (
              <Badge variant="outline" className="text-xs">
                <Upload className="w-3 h-3 mr-1" />
                {queuedItems} Queued
              </Badge>
            )}
          </div>
        </div>
      </header>

      <div className="px-4 py-6 space-y-6">
        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-3">
                {categories.map((category) => (
                  <Button
                    key={category.id}
                    variant={selectedCategory === category.id ? "default" : "outline"}
                    className="h-20 flex flex-col gap-2"
                    onClick={() => setSelectedCategory(category.id)}
                  >
                    <span className="text-2xl">{category.icon}</span>
                    <span className="text-xs">{category.label}</span>
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Feedback Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Submit Feedback</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Description
                  </label>
                  <Textarea
                    placeholder="Describe your issue or request..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="min-h-[100px]"
                    required
                  />
                </div>

                {/* Location Capture */}
                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Location
                  </label>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      className="flex-1"
                      onClick={handleLocationCapture}
                    >
                      <MapPin className="w-4 h-4 mr-2" />
                      {location ? "Location Captured" : "Capture GPS"}
                    </Button>
                    {location && (
                      <Badge variant="secondary" className="self-center">
                        {location.lat.toFixed(4)}, {location.lng.toFixed(4)}
                      </Badge>
                    )}
                  </div>
                </div>

                {/* Photo Capture */}
                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Photos (Optional)
                  </label>
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full"
                  >
                    <Camera className="w-4 h-4 mr-2" />
                    Take Photo
                  </Button>
                </div>

                <Button type="submit" className="w-full">
                  <Send className="w-4 h-4 mr-2" />
                  Submit Feedback
                </Button>
              </form>
            </CardContent>
          </Card>
        </motion.div>

        {/* Offline Queue Status */}
        {queuedItems > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="bg-warning/5 border-warning/20">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <Upload className="w-5 h-5 text-warning" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">Offline Queue</p>
                    <p className="text-xs text-muted-foreground">
                      {queuedItems} items waiting to sync when online
                    </p>
                  </div>
                  <Button variant="outline" size="sm">
                    View Queue
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* PWA Install Prompt */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="bg-forest/5 border-forest/20">
            <CardContent className="p-4 text-center">
              <h3 className="font-medium mb-2">Install FRA Atlas App</h3>
              <p className="text-sm text-muted-foreground mb-3">
                Add to home screen for quick access and offline support
              </p>
              <Button size="sm" className="bg-forest hover:bg-forest/90">
                Install App
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default FeedbackMobile;