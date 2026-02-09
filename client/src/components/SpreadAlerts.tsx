import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Badge } from "./ui/badge";
import { Switch } from "./ui/switch";
import { Bell, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

export default function SpreadAlerts() {
  const [newTicker, setNewTicker] = useState("");
  const [newThreshold, setNewThreshold] = useState("2.0");

  const { data: alerts, refetch } = trpc.spreadAlerts.list.useQuery();
  const createAlert = trpc.spreadAlerts.create.useMutation();
  const deleteAlert = trpc.spreadAlerts.delete.useMutation();
  const toggleAlert = trpc.spreadAlerts.toggle.useMutation();

  const handleCreateAlert = async () => {
    const ticker = newTicker.trim().toUpperCase();
    const threshold = parseFloat(newThreshold);

    if (!ticker || isNaN(threshold) || threshold <= 0) {
      toast.error("Please enter a valid ticker and threshold");
      return;
    }

    try {
      await createAlert.mutateAsync({
        ticker,
        thresholdPercent: threshold
      });
      
      toast.success(`Alert created for ${ticker}`);
      setNewTicker("");
      setNewThreshold("2.0");
      refetch();
    } catch (error) {
      toast.error("Failed to create alert");
    }
  };

  const handleDeleteAlert = async (alertId: number) => {
    try {
      await deleteAlert.mutateAsync({ alertId });
      toast.success("Alert deleted");
      refetch();
    } catch (error) {
      toast.error("Failed to delete alert");
    }
  };

  const handleToggleAlert = async (alertId: number, isActive: boolean) => {
    try {
      await toggleAlert.mutateAsync({ alertId, isActive });
      toast.success(isActive ? "Alert enabled" : "Alert disabled");
      refetch();
    } catch (error) {
      toast.error("Failed to update alert");
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Bell className="w-5 h-5 text-primary" />
          <CardTitle>Spread Alerts</CardTitle>
        </div>
        <CardDescription>
          Get notified when spreads exceed your threshold
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* Create Alert Form */}
        <div className="mb-6 p-4 bg-muted/50 rounded-lg">
          <h4 className="text-sm font-medium mb-3">Create New Alert</h4>
          <div className="flex flex-col sm:flex-row gap-2">
            <Input
              placeholder="Ticker (e.g., AAPL)"
              value={newTicker}
              onChange={(e) => setNewTicker(e.target.value.toUpperCase())}
              maxLength={10}
              className="flex-1"
            />
            <div className="flex items-center gap-2">
              <Input
                type="number"
                placeholder="Threshold %"
                value={newThreshold}
                onChange={(e) => setNewThreshold(e.target.value)}
                min="0.01"
                max="100"
                step="0.1"
                className="w-32"
              />
              <Button onClick={handleCreateAlert} disabled={createAlert.isPending}>
                <Plus className="w-4 h-4 mr-1" />
                Add
              </Button>
            </div>
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            You'll be notified when the spread exceeds this percentage
          </p>
        </div>

        {/* Alert List */}
        {!alerts || alerts.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Bell className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>No alerts set up yet</p>
            <p className="text-sm mt-1">Create your first alert above</p>
          </div>
        ) : (
          <div className="space-y-3">
            {alerts.map((alert) => (
              <div
                key={alert.id}
                className="flex items-center justify-between p-3 border rounded-lg"
              >
                <div className="flex items-center gap-3 flex-1">
                  <Switch
                    checked={alert.isActive}
                    onCheckedChange={(checked) => handleToggleAlert(alert.id, checked)}
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{alert.ticker}</span>
                      <Badge variant="secondary">
                        {alert.thresholdPercent.toFixed(2)}% threshold
                      </Badge>
                      {!alert.isActive && (
                        <Badge variant="outline">Paused</Badge>
                      )}
                    </div>
                    {alert.lastTriggeredAt && (
                      <p className="text-xs text-muted-foreground mt-1">
                        Last triggered: {new Date(alert.lastTriggeredAt).toLocaleString()}
                      </p>
                    )}
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleDeleteAlert(alert.id)}
                  disabled={deleteAlert.isPending}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
