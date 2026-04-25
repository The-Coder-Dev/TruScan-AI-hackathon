"use client";

import { useState, useTransition } from "react";
import {
  Search,
  Filter,
  Trash2,
  ChevronDown,
  Eye,
  Loader2,
  HistoryIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { RiskBadge, ScanTypeIcon, ScoreBar, formatDate } from "@/components/dashboard/shared";
import { deleteScan } from "@/app/dashboard/actions";
import type { Scan } from "@/lib/database.types";

interface Props {
  scans: Scan[];
  onDelete: (id: string) => void;
}

export function ScanHistory({ scans, onDelete }: Props) {
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<string[]>([]);
  const [riskFilter, setRiskFilter] = useState<string[]>([]);
  const [selectedScan, setSelectedScan] = useState<Scan | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const filtered = scans.filter((s) => {
    const matchSearch =
      !search ||
      s.label.toLowerCase().includes(search.toLowerCase()) ||
      s.explanation.toLowerCase().includes(search.toLowerCase());
    const matchType = typeFilter.length === 0 || typeFilter.includes(s.type);
    const matchRisk = riskFilter.length === 0 || riskFilter.includes(s.risk_level);
    return matchSearch && matchType && matchRisk;
  });

  function handleDelete(id: string) {
    setDeletingId(id);
    startTransition(async () => {
      const res = await deleteScan(id);
      if (!res.error) onDelete(id);
      setDeletingId(null);
    });
  }

  function toggleTypeFilter(val: string) {
    setTypeFilter((prev) =>
      prev.includes(val) ? prev.filter((v) => v !== val) : [...prev, val]
    );
  }

  function toggleRiskFilter(val: string) {
    setRiskFilter((prev) =>
      prev.includes(val) ? prev.filter((v) => v !== val) : [...prev, val]
    );
  }

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold">Scan History</h1>
        <p className="text-muted-foreground text-sm mt-1">
          All your past fraud detection scans, searchable and filterable.
        </p>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search scans…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 h-9"
          />
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="gap-2 h-9">
              <Filter className="w-3.5 h-3.5" />
              Type
              {typeFilter.length > 0 && (
                <Badge className="h-4 px-1 text-[10px]">{typeFilter.length}</Badge>
              )}
              <ChevronDown className="w-3 h-3" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Filter by Type</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuCheckboxItem
              checked={typeFilter.includes("audio")}
              onCheckedChange={() => toggleTypeFilter("audio")}
            >
              Audio
            </DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem
              checked={typeFilter.includes("sms")}
              onCheckedChange={() => toggleTypeFilter("sms")}
            >
              SMS
            </DropdownMenuCheckboxItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="gap-2 h-9">
              Risk Level
              {riskFilter.length > 0 && (
                <Badge className="h-4 px-1 text-[10px]">{riskFilter.length}</Badge>
              )}
              <ChevronDown className="w-3 h-3" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Filter by Risk</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {["high", "medium", "low"].map((r) => (
              <DropdownMenuCheckboxItem
                key={r}
                checked={riskFilter.includes(r)}
                onCheckedChange={() => toggleRiskFilter(r)}
              >
                {r.charAt(0).toUpperCase() + r.slice(1)} Risk
              </DropdownMenuCheckboxItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Table */}
      {filtered.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center space-y-3">
            <div className="w-12 h-12 rounded-xl bg-secondary flex items-center justify-center mx-auto">
              <HistoryIcon className="w-5 h-5 text-muted-foreground" />
            </div>
            <p className="font-medium">
              {scans.length === 0 ? "No scans yet" : "No results match your filters"}
            </p>
            <p className="text-sm text-muted-foreground">
              {scans.length === 0
                ? "Run your first audio or SMS scan to see results here."
                : "Try adjusting your search or filters."}
            </p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader className="pb-0 pt-4 px-5">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {filtered.length} result{filtered.length !== 1 ? "s" : ""}
            </CardTitle>
          </CardHeader>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-10"></TableHead>
                  <TableHead>Label</TableHead>
                  <TableHead className="hidden sm:table-cell">Type</TableHead>
                  <TableHead>Risk</TableHead>
                  <TableHead className="hidden md:table-cell">Score</TableHead>
                  <TableHead className="hidden lg:table-cell">Date</TableHead>
                  <TableHead className="w-20">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((scan) => (
                  <TableRow key={scan.id} className="group">
                    <TableCell>
                      <ScanTypeIcon type={scan.type} />
                    </TableCell>
                    <TableCell>
                      <p className="font-medium text-sm truncate max-w-[180px]">{scan.label}</p>
                      <p className="text-xs text-muted-foreground lg:hidden">
                        {formatDate(scan.created_at)}
                      </p>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">
                      <Badge variant="outline" className="text-xs capitalize">
                        {scan.type}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <RiskBadge level={scan.risk_level} />
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      <div className="flex items-center gap-2 min-w-[90px]">
                        <div className={`text-xs font-bold ${
                          scan.risk_level === "high" ? "text-red-500" :
                          scan.risk_level === "medium" ? "text-amber-500" : "text-emerald-500"
                        }`}>{scan.fraud_score}%</div>
                      </div>
                    </TableCell>
                    <TableCell className="hidden lg:table-cell text-xs text-muted-foreground">
                      {formatDate(scan.created_at)}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => setSelectedScan(scan)}
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-red-500 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500/10"
                          onClick={() => handleDelete(scan.id)}
                          disabled={deletingId === scan.id || isPending}
                        >
                          {deletingId === scan.id ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <Trash2 className="w-3.5 h-3.5" />
                          )}
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </Card>
      )}

      {/* Detail Dialog */}
      <Dialog open={!!selectedScan} onOpenChange={() => setSelectedScan(null)}>
        <DialogContent className="max-w-lg">
          {selectedScan && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <ScanTypeIcon type={selectedScan.type} />
                  {selectedScan.label}
                </DialogTitle>
                <DialogDescription>{formatDate(selectedScan.created_at)}</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <RiskBadge level={selectedScan.risk_level} />
                  <Badge variant="outline">Confidence: {selectedScan.confidence}%</Badge>
                </div>
                <ScoreBar score={selectedScan.fraud_score} risk={selectedScan.risk_level} />
                <div className="bg-secondary/50 rounded-lg p-4 space-y-1.5">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">AI Explanation</p>
                  <p className="text-sm leading-relaxed">{selectedScan.explanation}</p>
                </div>
                {selectedScan.raw_input && (
                  <div className="bg-secondary/50 rounded-lg p-4 space-y-1.5">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Original Message</p>
                    <p className="text-sm leading-relaxed text-muted-foreground line-clamp-6">
                      {selectedScan.raw_input}
                    </p>
                  </div>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
