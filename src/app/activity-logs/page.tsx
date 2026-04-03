"use client";

import { useCallback, useEffect, useState } from "react";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type ActivityLog = {
  id: string;
  action: string;
  details: string;
  metadata: string;
  createdAt: string;
  userId: string | null;
  userName: string | null;
};

const getResponseError = async (response: Response) => {
  const payload = await response.json().catch(() => null);
  return payload?.error ?? response.statusText ?? "Unable to complete request.";
};

const formatDateTime = (value: string) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "-";
  }

  return date.toLocaleString();
};

export default function ActivityLogsPage() {
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/activity-logs?limit=10");
      if (!response.ok) {
        setLogs([]);
        setError(await getResponseError(response));
        return;
      }

      const payload = (await response.json()) as ActivityLog[];
      setLogs(payload);
    } catch (fetchError) {
      setLogs([]);
      setError(fetchError instanceof Error ? fetchError.message : "Unable to load activity logs.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchLogs();
  }, [fetchLogs]);

  return (
    <main className="space-y-6 pb-8">
      <Card className="border border-border/70 bg-card/80">
        <CardHeader>
          <div>
            <CardTitle className="text-2xl">Activity Logs</CardTitle>
            <CardDescription>
              Latest audit trail for order, stock, and restock-queue actions.
            </CardDescription>
          </div>
          <CardAction>
            <Badge variant="outline" className="text-xs uppercase tracking-[0.3em]">
              Latest 10
            </Badge>
          </CardAction>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            This feed is reverse chronological and keeps the most recent operational events visible.
          </p>
        </CardContent>
      </Card>

      {error ? (
        <div className="rounded-2xl border border-destructive/60 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      ) : null}

      <Card className="border border-border/80 bg-card/70">
        <CardContent className="px-0">
          <Table className="min-w-full">
            <TableHeader>
              <TableRow>
                <TableHead>Time</TableHead>
                <TableHead>User</TableHead>
                <TableHead>Action</TableHead>
                <TableHead>Details</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                Array.from({ length: 6 }).map((_, index) => (
                  <TableRow key={`activity-skeleton-${index}`}>
                    <TableCell><Skeleton className="h-4 w-32 rounded" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-24 rounded" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-28 rounded" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-72 rounded" /></TableCell>
                  </TableRow>
                ))
              ) : logs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4}>
                    <p className="py-6 text-center text-sm text-muted-foreground">
                      No activity recorded yet.
                    </p>
                  </TableCell>
                </TableRow>
              ) : (
                logs.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell className="text-muted-foreground">
                      {formatDateTime(log.createdAt)}
                    </TableCell>
                    <TableCell>{log.userName ?? "System"}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{log.action}</Badge>
                    </TableCell>
                    <TableCell>{log.details}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </main>
  );
}
