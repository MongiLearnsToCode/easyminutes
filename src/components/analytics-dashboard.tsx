'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';

interface AnalyticsDashboardProps {
  userId: string;
}

export function AnalyticsDashboard({ userId }: AnalyticsDashboardProps) {
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | 'all'>('30d');
  
  // Calculate date range for queries
  const getDateRange = () => {
    const now = Date.now();
    switch (timeRange) {
      case '7d':
        return { startDate: now - 7 * 24 * 60 * 60 * 1000, endDate: now };
      case '30d':
        return { startDate: now - 30 * 24 * 60 * 60 * 1000, endDate: now };
      case 'all':
      default:
        return { startDate: undefined, endDate: now };
    }
  };
  
  const dateRange = getDateRange();
  
  // TODO: Implement the query to get user analytics
  // const userAnalytics = useQuery(api.get_analytics.getUserAnalytics, { userId });
  const userAnalytics: any = null;
  
  // TODO: Implement the query to get overall analytics
  // const overallAnalytics = useQuery(api.get_analytics.getOverallAnalytics);
  const overallAnalytics: any = {
    totalUsers: 124,
    totalGenerations: 456,
    successfulGenerations: 432,
    successRate: 94.7,
    under2MinuteGenerations: 389,
    under2MinuteRate: 85.3,
    averageProcessingTime: 7200, // in milliseconds
  };
  
  // TODO: Implement the query to get conversion analytics
  // const conversionAnalytics = useQuery(api.get_conversion_analytics.getConversionAnalytics, dateRange);
  const conversionAnalytics: any = {
    totalConversions: 23,
    totalCancellations: 5,
    totalExpirations: 2,
    totalRenewals: 18,
    uniqueUsersConverted: 23,
    uniqueUsersCancelled: 5,
    conversionRate: 12.4,
    churnRate: 8.7,
    retentionRate: 78.3,
    conversionsOverTime: {},
    cancellationsOverTime: {},
  };
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Analytics Dashboard</h2>
        <div className="flex gap-2">
          <button 
            className={`px-3 py-1 rounded ${timeRange === '7d' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
            onClick={() => setTimeRange('7d')}
          >
            7D
          </button>
          <button 
            className={`px-3 py-1 rounded ${timeRange === '30d' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
            onClick={() => setTimeRange('30d')}
          >
            30D
          </button>
          <button 
            className={`px-3 py-1 rounded ${timeRange === 'all' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
            onClick={() => setTimeRange('all')}
          >
            All
          </button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{overallAnalytics.totalUsers}</div>
            <p className="text-xs text-gray-500">Active users</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{overallAnalytics.successRate.toFixed(1)}%</div>
            <Progress value={overallAnalytics.successRate} className="mt-2" />
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">&lt;2 Minute Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{overallAnalytics.under2MinuteRate.toFixed(1)}%</div>
            <Progress value={overallAnalytics.under2MinuteRate} className="mt-2" />
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Avg. Processing Time</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{(overallAnalytics.averageProcessingTime / 1000).toFixed(1)}s</div>
            <p className="text-xs text-gray-500">Target: &lt;10s</p>
          </CardContent>
        </Card>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Conversions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{conversionAnalytics.totalConversions}</div>
            <p className="text-xs text-gray-500">Unique users: {conversionAnalytics.uniqueUsersConverted}</p>
            <Progress value={conversionAnalytics.conversionRate} className="mt-2" />
            <p className="text-xs text-gray-500 mt-1">Conversion rate: {conversionAnalytics.conversionRate.toFixed(1)}%</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Churn Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{conversionAnalytics.churnRate.toFixed(1)}%</div>
            <p className="text-xs text-gray-500">Cancellations: {conversionAnalytics.totalCancellations}</p>
            <Progress value={conversionAnalytics.churnRate} className="mt-2" />
            <p className="text-xs text-gray-500 mt-1">Expirations: {conversionAnalytics.totalExpirations}</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Retention Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{conversionAnalytics.retentionRate.toFixed(1)}%</div>
            <p className="text-xs text-gray-500">Renewals: {conversionAnalytics.totalRenewals}</p>
            <Progress value={conversionAnalytics.retentionRate} className="mt-2" />
            <p className="text-xs text-gray-500 mt-1">Active Pro users</p>
          </CardContent>
        </Card>
      </div>
      
      {/* TODO: Implement the query to get repeat usage analytics */}
      {/* const repeatUsageAnalytics = useQuery(api.get_repeat_usage_analytics.getRepeatUsageAnalytics, { days: 7 }); */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Active Users (7D)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-gray-500">In selected period</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Repeat Usage Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0%</div>
            <Progress value={0} className="mt-2" />
            <p className="text-xs text-gray-500 mt-1">Users with 2+ activities</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Highly Engaged</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-gray-500">Users with 5+ activities</p>
            <Progress value={0} className="mt-2" />
            <p className="text-xs text-gray-500 mt-1">In selected period</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Avg. Activities/User</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-gray-500">In selected period</p>
          </CardContent>
        </Card>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Performance Over Time</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-center justify-center">
              <p className="text-gray-500">Chart visualization would go here</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Conversions Over Time</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-center justify-center">
              <p className="text-gray-500">Chart visualization would go here</p>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Repeat Usage Trends</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-center justify-center">
            <p className="text-gray-500">Chart visualization would go here</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}