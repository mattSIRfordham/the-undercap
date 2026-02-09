import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";

interface SpreadDataPoint {
  recordedAt: Date;
  spreadPercent: number;
  bid: number;
  ask: number;
  lastPrice: number;
}

interface SpreadChartProps {
  ticker: string;
  data: SpreadDataPoint[];
  days: number;
}

export default function SpreadChart({ ticker, data, days }: SpreadChartProps) {
  // Transform data for recharts
  const chartData = data.map(point => ({
    time: new Date(point.recordedAt).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }),
    spread: point.spreadPercent,
    bid: point.bid,
    ask: point.ask,
    price: point.lastPrice,
  })).reverse(); // Reverse to show oldest first

  if (chartData.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{ticker} Spread History</CardTitle>
          <CardDescription>{days} day period</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="py-12 text-center text-muted-foreground">
            No historical data available yet. Data will appear as it's collected.
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{ticker} Spread History</CardTitle>
        <CardDescription>
          {days} day period • {chartData.length} data points
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis 
              dataKey="time" 
              className="text-xs"
              tick={{ fontSize: 10 }}
              interval="preserveStartEnd"
            />
            <YAxis 
              className="text-xs"
              tick={{ fontSize: 10 }}
              label={{ value: 'Spread %', angle: -90, position: 'insideLeft', style: { fontSize: 12 } }}
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'hsl(var(--card))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '6px'
              }}
              formatter={(value: number) => value.toFixed(3) + '%'}
            />
            <Legend />
            <Line 
              type="monotone" 
              dataKey="spread" 
              stroke="hsl(var(--primary))" 
              strokeWidth={2}
              dot={false}
              name="Spread %"
            />
          </LineChart>
        </ResponsiveContainer>

        <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <p className="text-xs text-muted-foreground mb-1">Current Spread</p>
            <p className="text-lg font-semibold">
              {chartData[chartData.length - 1]?.spread.toFixed(3)}%
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-1">Avg Spread</p>
            <p className="text-lg font-semibold">
              {(chartData.reduce((sum, d) => sum + d.spread, 0) / chartData.length).toFixed(3)}%
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-1">Min Spread</p>
            <p className="text-lg font-semibold text-green-600">
              {Math.min(...chartData.map(d => d.spread)).toFixed(3)}%
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-1">Max Spread</p>
            <p className="text-lg font-semibold text-red-600">
              {Math.max(...chartData.map(d => d.spread)).toFixed(3)}%
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
