import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Thermometer, Droplets, Zap, Wifi, MapPin, Gauge } from 'lucide-react';

interface SensorData {
  id: string;
  location: string;
  coordinates: [number, number];
  soilMoisture: number;
  temperature: number;
  humidity: number;
  waterLevel: number;
  airQuality: number;
  batteryLevel: number;
  signalStrength: number;
  lastUpdate: string;
  status: 'online' | 'offline' | 'warning';
}

export const IoTDashboard: React.FC = () => {
  const [sensorData, setSensorData] = useState<SensorData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate IoT data
    const mockSensorData: SensorData[] = [
      {
        id: 'MSP430-001',
        location: 'Kumargram Village',
        coordinates: [89.6453, 26.7509],
        soilMoisture: 75,
        temperature: 28.5,
        humidity: 68,
        waterLevel: 82,
        airQuality: 45,
        batteryLevel: 85,
        signalStrength: 78,
        lastUpdate: '2 min ago',
        status: 'online'
      },
      {
        id: 'MSP430-002',
        location: 'Birpara Forest',
        coordinates: [89.4521, 26.8123],
        soilMoisture: 45,
        temperature: 25.2,
        humidity: 72,
        waterLevel: 65,
        airQuality: 38,
        batteryLevel: 92,
        signalStrength: 65,
        lastUpdate: '5 min ago',
        status: 'warning'
      },
      {
        id: 'MSP430-003',
        location: 'Madarihat Area',
        coordinates: [89.3876, 26.8765],
        soilMoisture: 88,
        temperature: 30.1,
        humidity: 75,
        waterLevel: 95,
        airQuality: 42,
        batteryLevel: 67,
        signalStrength: 82,
        lastUpdate: '1 min ago',
        status: 'online'
      }
    ];

    setTimeout(() => {
      setSensorData(mockSensorData);
      setIsLoading(false);
    }, 1000);

    // Simulate real-time updates
    const interval = setInterval(() => {
      setSensorData(prev => prev.map(sensor => ({
        ...sensor,
        soilMoisture: Math.max(0, Math.min(100, sensor.soilMoisture + (Math.random() - 0.5) * 10)),
        temperature: Math.max(15, Math.min(40, sensor.temperature + (Math.random() - 0.5) * 2)),
        humidity: Math.max(30, Math.min(90, sensor.humidity + (Math.random() - 0.5) * 5)),
        waterLevel: Math.max(0, Math.min(100, sensor.waterLevel + (Math.random() - 0.5) * 8)),
        airQuality: Math.max(0, Math.min(100, sensor.airQuality + (Math.random() - 0.5) * 5)),
        lastUpdate: Math.random() > 0.7 ? '1 min ago' : sensor.lastUpdate
      })));
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'default';
      case 'warning': return 'secondary';
      case 'offline': return 'destructive';
      default: return 'outline';
    }
  };

  const getSensorHealth = (data: SensorData) => {
    const metrics = [
      data.soilMoisture > 30 ? 1 : 0,
      data.temperature < 35 ? 1 : 0,
      data.humidity > 40 ? 1 : 0,
      data.waterLevel > 20 ? 1 : 0,
      data.airQuality < 60 ? 1 : 0,
      data.batteryLevel > 20 ? 1 : 0
    ];
    return Math.round((metrics.reduce((a, b) => a + b, 0) / metrics.length) * 100);
  };

  if (isLoading) {
    return (
      <div className="w-full space-y-6">
        <Card>
          <CardContent className="p-6">
            <div className="text-center">Loading IoT sensor data...</div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="w-full space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wifi className="h-5 w-5" />
            IoT Environmental Monitoring
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {sensorData.map((sensor) => (
              <Card key={sensor.id} className="p-4">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold">{sensor.id}</h3>
                      <p className="text-sm text-muted-foreground flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {sensor.location}
                      </p>
                    </div>
                    <Badge variant={getStatusColor(sensor.status)}>
                      {sensor.status}
                    </Badge>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Droplets className="h-4 w-4 text-blue-500" />
                        <span className="text-sm">Soil Moisture</span>
                      </div>
                      <span className="text-sm font-medium">{sensor.soilMoisture.toFixed(1)}%</span>
                    </div>
                    <Progress value={sensor.soilMoisture} className="h-2" />

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Thermometer className="h-4 w-4 text-red-500" />
                        <span className="text-sm">Temperature</span>
                      </div>
                      <span className="text-sm font-medium">{sensor.temperature.toFixed(1)}°C</span>
                    </div>
                    <Progress value={(sensor.temperature / 40) * 100} className="h-2" />

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Droplets className="h-4 w-4 text-cyan-500" />
                        <span className="text-sm">Humidity</span>
                      </div>
                      <span className="text-sm font-medium">{sensor.humidity.toFixed(1)}%</span>
                    </div>
                    <Progress value={sensor.humidity} className="h-2" />

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Gauge className="h-4 w-4 text-green-500" />
                        <span className="text-sm">Air Quality</span>
                      </div>
                      <span className="text-sm font-medium">{sensor.airQuality.toFixed(1)} AQI</span>
                    </div>
                    <Progress value={100 - sensor.airQuality} className="h-2" />

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Zap className="h-4 w-4 text-yellow-500" />
                        <span className="text-sm">Battery</span>
                      </div>
                      <span className="text-sm font-medium">{sensor.batteryLevel}%</span>
                    </div>
                    <Progress value={sensor.batteryLevel} className="h-2" />
                  </div>

                  <div className="pt-2 border-t">
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>Health: {getSensorHealth(sensor)}%</span>
                      <span>Updated: {sensor.lastUpdate}</span>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      <Alert>
        <Wifi className="h-4 w-4" />
        <AlertDescription>
          IoT sensors monitor soil moisture, temperature, humidity, water levels, and air quality in real-time using LoRaWAN connectivity for precision agriculture and sustainable land management.
        </AlertDescription>
      </Alert>
    </div>
  );
};