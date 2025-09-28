'use client';

import { useState, useEffect } from 'react';

interface ServiceHealth {
  status: 'healthy' | 'degraded' | 'unavailable';
  responseTime: number;
  lastCheck: Date;
  errorCount: number;
}

interface ServiceInfo {
  name: string;
  version: string;
  description: string;
  health: ServiceHealth;
  fallbackMode: boolean;
  circuitBreakerState: string;
  initialized: boolean;
}

interface HealthCheckResponse {
  status: string;
  timestamp: string;
  responseTime: number;
  services: { [key: string]: ServiceHealth };
  environment: string;
  useMockServices: boolean;
}

export default function ServiceDashboard() {
  const [healthData, setHealthData] = useState<HealthCheckResponse | null>(
    null
  );
  const [serviceDetails, setServiceDetails] = useState<{
    [key: string]: ServiceInfo;
  }>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  const fetchHealthData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch overall health
      const healthResponse = await fetch('/api/health');
      const healthData = await healthResponse.json();

      // Fetch detailed service information
      const servicesResponse = await fetch('/api/health/services');
      const servicesData = await servicesResponse.json();

      setHealthData(healthData);
      setServiceDetails(servicesData.services || {});
      setLastUpdate(new Date());
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to fetch health data'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHealthData();

    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchHealthData, 30000);

    return () => clearInterval(interval);
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy':
        return 'text-green-600 bg-green-100';
      case 'degraded':
        return 'text-yellow-600 bg-yellow-100';
      case 'unavailable':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy':
        return '✅';
      case 'degraded':
        return '⚠️';
      case 'unavailable':
        return '❌';
      default:
        return '❓';
    }
  };

  if (loading && !healthData) {
    return (
      <div className="p-6 max-w-6xl mx-auto">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading service health data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 max-w-6xl mx-auto">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <h3 className="font-bold">Error</h3>
          <p>{error}</p>
          <button
            onClick={fetchHealthData}
            className="mt-2 bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Service Health Dashboard
        </h1>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <span
              className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(healthData?.status || 'unknown')}`}
            >
              {getStatusIcon(healthData?.status || 'unknown')}{' '}
              {healthData?.status?.toUpperCase()}
            </span>
            <span className="text-sm text-gray-500">
              Environment: {healthData?.environment}
            </span>
            {healthData?.useMockServices && (
              <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                MOCK SERVICES
              </span>
            )}
          </div>
          <div className="text-right">
            <button
              onClick={fetchHealthData}
              disabled={loading}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50"
            >
              {loading ? 'Refreshing...' : 'Refresh'}
            </button>
            <p className="text-xs text-gray-500 mt-1">
              Last updated: {lastUpdate.toLocaleTimeString()}
            </p>
          </div>
        </div>
      </div>

      {/* Overall Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white p-4 rounded-lg shadow border">
          <h3 className="text-sm font-medium text-gray-500">Response Time</h3>
          <p className="text-2xl font-bold text-gray-900">
            {healthData?.responseTime}ms
          </p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow border">
          <h3 className="text-sm font-medium text-gray-500">Total Services</h3>
          <p className="text-2xl font-bold text-gray-900">
            {Object.keys(serviceDetails).length}
          </p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow border">
          <h3 className="text-sm font-medium text-gray-500">
            Healthy Services
          </h3>
          <p className="text-2xl font-bold text-green-600">
            {
              Object.values(serviceDetails).filter(
                service => service.health?.status === 'healthy'
              ).length
            }
          </p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow border">
          <h3 className="text-sm font-medium text-gray-500">Issues</h3>
          <p className="text-2xl font-bold text-red-600">
            {
              Object.values(serviceDetails).filter(
                service =>
                  service.health?.status === 'unavailable' ||
                  service.health?.status === 'degraded'
              ).length
            }
          </p>
        </div>
      </div>

      {/* Services Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Object.entries(serviceDetails).map(([serviceName, service]) => (
          <div
            key={serviceName}
            className="bg-white rounded-lg shadow border overflow-hidden"
          >
            <div className="p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-semibold text-gray-900">
                  {service.name}
                </h3>
                <span
                  className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(service.health?.status || 'unknown')}`}
                >
                  {getStatusIcon(service.health?.status || 'unknown')}{' '}
                  {service.health?.status?.toUpperCase()}
                </span>
              </div>

              <p className="text-sm text-gray-600 mb-3">
                {service.description}
              </p>

              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Version:</span>
                  <span className="font-medium">{service.version}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Response Time:</span>
                  <span className="font-medium">
                    {service.health?.responseTime || 'N/A'}ms
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Error Count:</span>
                  <span className="font-medium">
                    {service.health?.errorCount || 0}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Circuit Breaker:</span>
                  <span className="font-medium">
                    {service.circuitBreakerState}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Fallback Mode:</span>
                  <span
                    className={`font-medium ${service.fallbackMode ? 'text-yellow-600' : 'text-green-600'}`}
                  >
                    {service.fallbackMode ? 'Enabled' : 'Disabled'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Last Check:</span>
                  <span className="font-medium text-xs">
                    {service.health?.lastCheck
                      ? new Date(service.health.lastCheck).toLocaleTimeString()
                      : 'N/A'}
                  </span>
                </div>
              </div>
            </div>

            {service.health?.status !== 'healthy' && (
              <div className="bg-gray-50 px-4 py-3 border-t">
                <p className="text-sm text-gray-600">
                  ⚠️ Service experiencing issues. Check logs for details.
                </p>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Auto-refresh indicator */}
      <div className="mt-8 text-center text-sm text-gray-500">
        <p>Dashboard auto-refreshes every 30 seconds</p>
      </div>
    </div>
  );
}
