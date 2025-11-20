import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Sprout, Calendar, Wallet, Users } from "lucide-react";

interface DashboardProps {
  totalCrops: number;
  activePlots: number;
  upcomingHarvests: number;
  totalBudget: number;
  budgetSpent: number;
}

export function Dashboard({ totalCrops, activePlots, upcomingHarvests, totalBudget, budgetSpent }: DashboardProps) {
  const budgetRemaining = totalBudget - budgetSpent;
  const budgetPercentage = ((budgetSpent / totalBudget) * 100).toFixed(1);

  return (
    <div className="space-y-6">
      <div>
        <h2>Dashboard Overview</h2>
        <p className="text-muted-foreground">Welcome to the Barangay Community Farming System</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">Total Crops</CardTitle>
            <Sprout className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalCrops}</div>
            <p className="text-xs text-muted-foreground">Different varieties planted</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">Active Plots</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activePlots}</div>
            <p className="text-xs text-muted-foreground">Currently in use</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">Upcoming Harvests</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{upcomingHarvests}</div>
            <p className="text-xs text-muted-foreground">Within next 30 days</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">Budget Status</CardTitle>
            <Wallet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₱{budgetRemaining.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">{budgetPercentage}% spent of ₱{totalBudget.toLocaleString()}</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
