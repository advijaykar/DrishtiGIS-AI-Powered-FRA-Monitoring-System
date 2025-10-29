import React, { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import { Camera, Phone, MapPin, Upload, Check, Clock, AlertCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface FeedbackSubmission {
  id: string;
  feedback_type: 'asset_verification' | 'photo_upload' | 'status_update';
  content: string;
  photo_url?: string;
  coordinates?: { lat: number; lng: number };
  submitted_by_phone: string;
  verified: boolean;
  created_at: Date;
  patta_holder?: string;
  village?: string;
}

interface LocationData {
  latitude: number;
  longitude: number;
  accuracy: number;
}

export const CommunityFeedbackLoop: React.FC = () => {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Form state
  const [feedbackType, setFeedbackType] = useState<string>('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [content, setContent] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [location, setLocation] = useState<LocationData | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCapturingLocation, setIsCapturingLocation] = useState(false);
  
  // Recent submissions
  const [recentFeedbacks, setRecentFeedbacks] = useState<FeedbackSubmission[]>([
    {
      id: '1',
      feedback_type: 'asset_verification',
      content: 'Confirmed farmland area is accurate. Currently growing rice.',
      submitted_by_phone: '+91-9876543210',
      verified: true,
      created_at: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
      patta_holder: 'Ravi Kumar',
      village: 'Kumargram'
    },
    {
      id: '2',
      feedback_type: 'photo_upload',
      content: 'New pond constructed with government support',
      photo_url: 'https://example.com/pond.jpg',
      submitted_by_phone: '+91-9876543211',
      verified: false,
      created_at: new Date(Date.now() - 6 * 60 * 60 * 1000), // 6 hours ago
      patta_holder: 'Maya Devi',
      village: 'Birpara'
    },
    {
      id: '3',
      feedback_type: 'status_update',
      content: 'Patta approval received from district office',
      submitted_by_phone: '+91-9876543212',
      verified: true,
      created_at: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
      patta_holder: 'Suresh Munda',
      village: 'Nagrakata'
    }
  ]);

  const captureLocation = () => {
    setIsCapturingLocation(true);
    
    if (!navigator.geolocation) {
      toast({
        title: "Location Error",
        description: "Geolocation is not supported by this browser",
        variant: "destructive",
      });
      setIsCapturingLocation(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy
        });
        setIsCapturingLocation(false);
        toast({
          title: "Location Captured",
          description: `Accuracy: ${position.coords.accuracy.toFixed(0)}m`,
        });
      },
      (error) => {
        console.error('Geolocation error:', error);
        toast({
          title: "Location Error",
          description: "Failed to capture location",
          variant: "destructive",
        });
        setIsCapturingLocation(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000
      }
    );
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "File Too Large",
          description: "Please select a file smaller than 5MB",
          variant: "destructive",
        });
        return;
      }
      
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast({
          title: "Invalid File Type",
          description: "Please select an image file",
          variant: "destructive",
        });
        return;
      }
      
      setSelectedFile(file);
      toast({
        title: "Photo Selected",
        description: `Selected: ${file.name}`,
      });
    }
  };

  const uploadPhoto = async (file: File): Promise<string | null> => {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substr(2, 9)}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('community-photos')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('community-photos')
        .getPublicUrl(fileName);

      return publicUrl;
    } catch (error) {
      console.error('Error uploading photo:', error);
      return null;
    }
  };

  const submitFeedback = async () => {
    if (!feedbackType || !phoneNumber || !content.trim()) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    // Validate phone number format
    const phoneRegex = /^\+?[1-9]\d{1,14}$/;
    if (!phoneRegex.test(phoneNumber.replace(/[-()\s]/g, ''))) {
      toast({
        title: "Invalid Phone Number",
        description: "Please enter a valid phone number",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      let photoUrl: string | null = null;
      
      // Upload photo if selected
      if (selectedFile) {
        photoUrl = await uploadPhoto(selectedFile);
        if (!photoUrl) {
          throw new Error('Failed to upload photo');
        }
      }

      // Prepare feedback data
      const feedbackData = {
        feedback_type: feedbackType as 'asset_verification' | 'photo_upload' | 'status_update',
        content: content.trim(),
        photo_url: photoUrl,
        submitted_by_phone: phoneNumber,
        coordinates: location ? `POINT(${location.longitude} ${location.latitude})` : null,
        verified: false
      };

      // Insert into database
      const { error } = await supabase
        .from('community_feedback')
        .insert(feedbackData);

      if (error) throw error;

      // Add to recent feedbacks for immediate UI update
      const newFeedback: FeedbackSubmission = {
        id: Math.random().toString(36).substr(2, 9),
        feedback_type: feedbackData.feedback_type,
        content: feedbackData.content,
        photo_url: photoUrl || undefined,
        coordinates: location ? { lat: location.latitude, lng: location.longitude } : undefined,
        submitted_by_phone: phoneNumber,
        verified: false,
        created_at: new Date(),
        patta_holder: 'Unknown', // Would be determined by backend
        village: 'Unknown'
      };

      setRecentFeedbacks(prev => [newFeedback, ...prev.slice(0, 4)]);

      // Reset form
      setFeedbackType('');
      setPhoneNumber('');
      setContent('');
      setSelectedFile(null);
      setLocation(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }

      // Send SMS confirmation (mock)
      toast({
        title: "Feedback Submitted",
        description: "Thank you! SMS confirmation sent to your phone.",
      });

      // Mock SMS sending
      setTimeout(() => {
        toast({
          title: "SMS Sent",
          description: `Confirmation SMS sent to ${phoneNumber}`,
        });
      }, 2000);

    } catch (error) {
      console.error('Error submitting feedback:', error);
      toast({
        title: "Submission Failed",
        description: "Failed to submit feedback. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays}d ago`;
  };

  const getFeedbackTypeIcon = (type: string) => {
    switch (type) {
      case 'asset_verification': return Check;
      case 'photo_upload': return Camera;
      case 'status_update': return AlertCircle;
      default: return AlertCircle;
    }
  };

  const getFeedbackTypeLabel = (type: string) => {
    switch (type) {
      case 'asset_verification': return 'Asset Verification';
      case 'photo_upload': return 'Photo Upload';
      case 'status_update': return 'Status Update';
      default: return 'Unknown';
    }
  };

  return (
    <div className="w-full space-y-6">
      {/* Mobile Feedback Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Phone className="h-5 w-5" />
            Community Feedback Portal
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">Feedback Type</label>
            <Select value={feedbackType} onValueChange={setFeedbackType}>
              <SelectTrigger>
                <SelectValue placeholder="Select feedback type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="asset_verification">Asset Verification</SelectItem>
                <SelectItem value="photo_upload">Photo Upload</SelectItem>
                <SelectItem value="status_update">Status Update</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Phone Number</label>
            <Input
              type="tel"
              placeholder="+91-XXXXXXXXXX"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
            />
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Feedback Content</label>
            <Textarea
              placeholder="Describe your feedback or asset confirmation..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={3}
            />
          </div>

          {/* Photo Upload */}
          <div>
            <label className="text-sm font-medium mb-2 block">Geotagged Photo (Optional)</label>
            <div className="flex items-center gap-2">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                onChange={handleFileSelect}
                className="hidden"
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-2"
              >
                <Camera className="h-4 w-4" />
                {selectedFile ? selectedFile.name : 'Take Photo'}
              </Button>
              {selectedFile && (
                <Badge variant="secondary">
                  {(selectedFile.size / 1024 / 1024).toFixed(1)}MB
                </Badge>
              )}
            </div>
          </div>

          {/* Location Capture */}
          <div>
            <label className="text-sm font-medium mb-2 block">Location (GPS)</label>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={captureLocation}
                disabled={isCapturingLocation}
                className="flex items-center gap-2"
              >
                <MapPin className="h-4 w-4" />
                {isCapturingLocation ? 'Capturing...' : location ? 'Update Location' : 'Capture Location'}
              </Button>
              {location && (
                <Badge variant="secondary">
                  {location.latitude.toFixed(4)}, {location.longitude.toFixed(4)}
                </Badge>
              )}
            </div>
          </div>

          <Button
            onClick={submitFeedback}
            disabled={isSubmitting}
            className="w-full"
          >
            {isSubmitting ? 'Submitting...' : 'Submit Feedback'}
          </Button>
        </CardContent>
      </Card>

      {/* Recent Feedback */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Recent Community Feedback
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentFeedbacks.map(feedback => {
              const FeedbackIcon = getFeedbackTypeIcon(feedback.feedback_type);
              return (
                <div key={feedback.id} className="flex items-start gap-3 p-3 bg-muted rounded-lg">
                  <div className="flex items-center gap-2">
                    <FeedbackIcon className="h-4 w-4" />
                    <Badge variant={feedback.verified ? 'default' : 'secondary'}>
                      {feedback.verified ? 'Verified' : 'Pending'}
                    </Badge>
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium">
                        {getFeedbackTypeLabel(feedback.feedback_type)}
                      </span>
                      <span className="text-sm text-muted-foreground">
                        from {feedback.patta_holder} • {feedback.village}
                      </span>
                    </div>
                    
                    <p className="text-sm mb-2">{feedback.content}</p>
                    
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span>{feedback.submitted_by_phone}</span>
                      <span>{formatTimeAgo(feedback.created_at)}</span>
                      {feedback.photo_url && (
                        <Badge variant="outline" className="text-xs">
                          <Camera className="h-3 w-3 mr-1" />
                          Photo
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* SMS Integration Info */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="font-semibold text-blue-800 mb-2">SMS Integration</h4>
        <p className="text-sm text-blue-700">
          Community members can submit feedback via SMS by sending messages to our dedicated number. 
          Format: TYPE [VERIFICATION/PHOTO/UPDATE] MESSAGE to +91-XXXX-XXXXXX
        </p>
      </div>
    </div>
  );
};