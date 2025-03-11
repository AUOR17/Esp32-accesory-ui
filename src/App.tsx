import { useState, useCallback, useEffect } from 'react';
import './App.css';


interface LucideIconProps {
  className?: string;
  size?: number;
}


interface DeviceConfig {
  maxMotorTemp: number;
  reactivationMotorTemp: number;
}

interface DeviceData {
  temperature: number;
  flowRate: number;
  totalTime: number;
  status: string;
}


const AlertCircle = ({ className, size = 24 }: LucideIconProps) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <circle cx="12" cy="12" r="10"></circle>
    <line x1="12" y1="8" x2="12" y2="12"></line>
    <line x1="12" y1="16" x2="12.01" y2="16"></line>
  </svg>
);

const Thermometer = ({ className, size = 24 }: LucideIconProps) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <path d="M14 4v10.54a4 4 0 1 1-4 0V4a2 2 0 0 1 4 0Z"></path>
  </svg>
);

const Activity = ({ className, size = 24 }: LucideIconProps) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <path d="M22 12h-4l-3 9L9 3l-3 9H2"></path>
  </svg>
);

const Clock = ({ className, size = 24 }: LucideIconProps) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <circle cx="12" cy="12" r="10"></circle>
    <polyline points="12 6 12 12 16 14"></polyline>
  </svg>
);

function App() {
  const [ipAddress, setIpAddress] = useState<string>('');
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [config, setConfig] = useState<DeviceConfig>({
    maxMotorTemp: 100,
    reactivationMotorTemp: 45
  });
  const [deviceData, setDeviceData] = useState<DeviceData>({
    temperature: -273.15,
    flowRate: 0,
    totalTime: 0,
    status: 'Idle'
  });
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  // Function to connect to the device
  const connectToDevice = async (): Promise<void> => {
    if (!ipAddress) {
      setError('Please enter an IP address');
      return;
    }

    setLoading(true);
    setError('');
    
    try {
      // Make a request to the device's config endpoint
      const response = await fetch(`http://${ipAddress}/config`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      setConfig(data);
      setIsConnected(true);
    } catch (err) {
      setError('Failed to connect to the device. Please check the IP address and try again.');
      setIsConnected(false);
    } finally {
      setLoading(false);
    }
  };

  // Function to update configuration
  const updateConfig = async (): Promise<void> => {
    if (!isConnected) return;
    
    setLoading(true);
    setError('');
    
    try {
  
      const formData = `maxMotorTemp=${config.maxMotorTemp}&reactivationMotorTemp=${config.reactivationMotorTemp}`;
      
      console.log('Sending data:', formData);
      
      const response = await fetch(`http://${ipAddress}/config`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: formData,
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Server response:', errorText);
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      console.log('Update successful');
      setError('');
      
      alert('Configuration updated successfully!');
      
      
      await fetchDeviceData();
    } catch (err) {
      console.error('Update error:', err);
      setError('Failed to update configuration.');
    } finally {
      setLoading(false);
    }
  };

  
  const fetchDeviceData = useCallback(async (): Promise<void> => {
    if (!isConnected) return;
    
    try {
      const response = await fetch(`http://${ipAddress}/status`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      setDeviceData(data);
    } catch (err) {
      console.error('Error fetching device data:', err);
     
    }
  }, [isConnected, ipAddress]);

  
  useEffect(() => {
    if (!isConnected) return;
    
    const interval = setInterval(fetchDeviceData, 500); 
    
    return () => clearInterval(interval);
  }, [isConnected, fetchDeviceData]);

  
  const handleConfigChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const { name, value } = e.target;
    setConfig(prev => ({
      ...prev,
      [name]: parseInt(value, 10)
    }));
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Device Monitoring Interface</h1>
      
      {/* Connection Form */}
      <div className="bg-gray-100 p-4 rounded-lg mb-6">
        <div className="flex gap-4 mb-4">
          <div className="flex-grow">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Device IP Address:
            </label>
            <input
              type="text"
              value={ipAddress}
              onChange={(e) => setIpAddress(e.target.value)}
              placeholder="e.g. 192.168.1.100"
              className="w-full p-2 border rounded"
              disabled={isConnected || loading}
            />
          </div>
          <div className="self-end">
            <button
              onClick={connectToDevice}
              disabled={isConnected || loading}
              className={`p-2 rounded text-white ${isConnected ? 'bg-green-500' : 'bg-blue-500 hover:bg-blue-600'}`}
            >
              {isConnected ? 'Connected' : loading ? 'Connecting...' : 'Connect'}
            </button>
          </div>
        </div>
        
        {error && (
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4 flex items-center">
            <AlertCircle className="mr-2" size={20} />
            <span>{error}</span>
          </div>
        )}
        
        {isConnected && (
          <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4">
            Connected to: {ipAddress}
          </div>
        )}
      </div>
      
      {isConnected && (
        <>
          {/* Configuration Form */}
          <div className="bg-white border border-gray-200 rounded-lg p-4 mb-6 shadow-sm">
            <h2 className="text-xl font-semibold mb-4">Configuration</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Max Motor Temperature (°C):
                </label>
                <input
                  type="number"
                  name="maxMotorTemp"
                  value={config.maxMotorTemp}
                  onChange={handleConfigChange}
                  className="w-full p-2 border rounded"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Reactivation Motor Temperature (°C):
                </label>
                <input
                  type="number"
                  name="reactivationMotorTemp"
                  value={config.reactivationMotorTemp}
                  onChange={handleConfigChange}
                  className="w-full p-2 border rounded"
                />
              </div>
            </div>
            <button
              onClick={updateConfig}
              disabled={loading}
              className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded"
            >
              {loading ? 'Updating...' : 'Update Configuration'}
            </button>
          </div>
          
          {/* Real-time Data Display */}
          <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
            <h2 className="text-xl font-semibold mb-4">Device Status: {deviceData.status}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex items-center p-4 bg-gray-50 rounded-lg">
                <Thermometer className="mr-3 text-red-500" size={32} />
                <div>
                  <p className="text-sm text-gray-500">Temperature</p>
                  <p className="text-2xl font-bold">{deviceData.temperature} °C</p>
                </div>
              </div>
              
              <div className="flex items-center p-4 bg-gray-50 rounded-lg">
                <Activity className="mr-3 text-blue-500" size={32} />
                <div>
                  <p className="text-sm text-gray-500">Status</p>
                  <p className="text-2xl font-bold">{deviceData.status}</p>
                </div>
              </div>
              
              <div className="flex items-center p-4 bg-gray-50 rounded-lg">
                <Clock className="mr-3 text-green-500" size={32} />
                <div>
                  <p className="text-sm text-gray-500">Total Time</p>
                  <p className="text-2xl font-bold">{deviceData.totalTime.toFixed(1)} s</p>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default App;