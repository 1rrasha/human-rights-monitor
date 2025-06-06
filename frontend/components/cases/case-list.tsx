"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Edit, Eye, MapPin, MoreHorizontal, Trash, Users, Star, UserPlus, Share } from "lucide-react";
import { useState } from "react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useCases } from "@/hooks/useCases";
import { CasesQueryParams, Case, UpdateCaseData } from "@/services/cases.service";
import { formatDistanceToNow } from "date-fns";
import { useRouter } from "next/navigation";
import { CaseDetails } from "./case-details";
import { CaseEdit } from "./case-edit";
import { useToast } from "@/components/ui/use-toast";

interface CaseListProps {
  filters: CasesQueryParams;
}

const getStatusBadge = (status: string) => {
  switch (status) {
    case "new":
      return <Badge variant="outline" className="status-badge status-badge-new">New</Badge>;
    case "under_investigation":
      return <Badge variant="outline" className="status-badge status-badge-investigating">Investigating</Badge>;
    case "resolved":
      return <Badge variant="outline" className="status-badge status-badge-resolved">Resolved</Badge>;
    case "archived":
      return <Badge variant="outline" className="status-badge status-badge-archived bg-red-300">Archived</Badge>;
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
};

const getPriorityBadge = (priority: string) => {
  switch (priority) {
    case "high":
      return <Badge className="priority-badge-high">High</Badge>;
    case "medium":
      return <Badge className="priority-badge-medium">Medium</Badge>;
    case "low":
      return <Badge className="priority-badge-low">Low</Badge>;
    default:
      return <Badge>{priority}</Badge>;
  }
};

export function CaseList({ filters }: CaseListProps) {
  const { cases, isLoading, error, updateCase, deleteCase } = useCases(filters);
  const { toast } = useToast();
  const [selectedCases, setSelectedCases] = useState<string[]>([]);
  const [starredCases, setStarredCases] = useState<string[]>([]);
  const [selectedCase, setSelectedCase] = useState<Case | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isArchiveDialogOpen, setIsArchiveDialogOpen] = useState(false);
  const router = useRouter();

  const toggleSelectAll = () => {
    if (selectedCases.length === cases?.length) {
      setSelectedCases([]);
    } else {
      setSelectedCases(cases?.map((c) => c._id) || []);
    }
  };

  const toggleSelect = (id: string) => {
    if (selectedCases.includes(id)) {
      setSelectedCases(selectedCases.filter((caseId) => caseId !== id));
    } else {
      setSelectedCases([...selectedCases, id]);
    }
  };

  const toggleStar = (id: string) => {
    if (starredCases.includes(id)) {
      setStarredCases(starredCases.filter((caseId) => caseId !== id));
    } else {
      setStarredCases([...starredCases, id]);
    }
  };

  const handleViewCase = (caseItem: Case) => {
    setSelectedCase(caseItem);
    setIsViewDialogOpen(true);
  };

  const handleEditCase = (caseItem: Case) => {
    setSelectedCase(caseItem);
    setIsEditDialogOpen(true);
  };

  const handleArchiveCase = (caseItem: Case) => {
    setSelectedCase(caseItem);
    setIsArchiveDialogOpen(true);
  };

  const handleArchiveConfirm = async () => {
    if (selectedCase) {
      try {
        await deleteCase(selectedCase.case_id);
        setIsArchiveDialogOpen(false);
        toast({ title: "Success", description: "Case archived successfully" });
      } catch (error) {
        console.error("Failed to archive case:", error);
        toast({
          title: "Error",
          description: "Failed to archive case",
          variant: "destructive",
        });
      }
    }
  };

  const handleSaveCase = async (updatedCase: Case) => {
    try {
      const updateData: UpdateCaseData = {
        title: updatedCase.title,
        description: updatedCase.description,
        violation_types: updatedCase.violation_types,
        status: updatedCase.status,
        priority: updatedCase.priority,
        location: updatedCase.location,
        date_occurred: updatedCase.date_occurred,
        date_reported: updatedCase.date_reported,
        victims: updatedCase.victims,
        perpetrators: updatedCase.perpetrators,
        files: updatedCase.files, // Include files from CaseEdit
      };
      console.log("Updating case with data:", updateData);
      await updateCase({
        caseId: updatedCase.case_id,
        data: updateData,
      });
      toast({ title: "Success", description: "Case updated successfully" });
    } catch (error) {
      console.error("Failed to update case:", error);
      toast({
        title: "Error",
        description: "Failed to update case",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <Card className="data-card">
        <CardContent className="p-6 text-center">
          <p>Loading cases...</p>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="data-card">
        <CardContent className="p-6 text-center text-destructive">
          <p>Error loading cases: {error.message}</p>
        </CardContent>
      </Card>
    );
  }

  if (!cases || cases.length === 0) {
    return (
      <Card className="data-card">
        <CardContent className="p-6 text-center">
          <p>No cases found.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <TooltipProvider>
      <Card className="data-card">
        <CardContent className="p-0">
          {selectedCases.length > 0 && (
            <div className="p-2 bg-muted/50 border-b flex items-center justify-between animate-slide-down">
              <div className="text-sm">
                <span className="font-medium">{selectedCases.length}</span> cases selected
              </div>
              <div className="flex gap-1">
                <Button variant="outline" size="sm" className="h-8">
                  <UserPlus className="h-4 w-4 mr-1" />
                  Assign
                </Button>
                <Button variant="outline" size="sm" className="h-8">
                  <Share className="h-4 w-4 mr-1" />
                  Share
                </Button>
                <Button variant="outline" size="sm" className="h-8 text-destructive hover:text-destructive">
                  <Trash className="h-4 w-4 mr-1" />
                  Delete
                </Button>
              </div>
            </div>
          )}

          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="w-[50px]">
                    <Checkbox
                      checked={selectedCases.length === cases.length && cases.length > 0}
                      onCheckedChange={toggleSelectAll}
                    />
                  </TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                  <TableHead>Case ID</TableHead>
                  <TableHead className="min-w-[200px]">Title</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead className="text-center">Victims</TableHead>
                  <TableHead>Violation Types</TableHead>
                  <TableHead>Created By</TableHead>
                  <TableHead className="w-[80px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {cases.map((caseItem) => (
                  <TableRow key={caseItem._id} className="group">
                    <TableCell>
                      <Checkbox
                        checked={selectedCases.includes(caseItem._id)}
                        onCheckedChange={() => toggleSelect(caseItem._id)}
                      />
                    </TableCell>
                    <TableCell>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => toggleStar(caseItem._id)}
                          >
                            <Star
                              className={`h-4 w-4 ${
                                starredCases.includes(caseItem._id)
                                  ? "fill-yellow-400 text-yellow-400"
                                  : "text-muted-foreground group-hover:text-foreground"
                              }`}
                            />
                            <span className="sr-only">Star case</span>
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          {starredCases.includes(caseItem._id) ? "Remove from starred" : "Add to starred"}
                        </TooltipContent>
                      </Tooltip>
                    </TableCell>
                    <TableCell className="font-medium font-mono">{caseItem.case_id}</TableCell>
                    <TableCell className="max-w-[200px] truncate font-medium">{caseItem.title}</TableCell>
                    <TableCell>{getStatusBadge(caseItem.status)}</TableCell>
                    <TableCell>{getPriorityBadge(caseItem.priority)}</TableCell>
                    <TableCell className="flex items-center gap-1 max-w-[150px] truncate">
                      <MapPin className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                      {caseItem.location.region}, {caseItem.location.country}
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge variant="outline" className="flex items-center justify-center gap-1 w-10 mx-auto">
                        <Users className="h-3 w-3" />
                        {caseItem.victims.length}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {caseItem.violation_types.map((type, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {type}
                          </Badge>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        {caseItem.created_by_user.full_name}
                      </div>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 opacity-0 text-black group-hover:opacity-100 transition-opacity"
                          >
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only text-black">Actions</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => handleViewCase(caseItem)}>
                            <Eye className="h-4 w-4 mr-2" />
                            <span>View Details</span>
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleEditCase(caseItem)}>
                            <Edit className="h-4 w-4 mr-2" />
                            <span>Edit Case</span>
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="text-destructive"
                            onClick={() => handleArchiveCase(caseItem)}
                          >
                            <Trash className="h-4 w-4 mr-2" />
                            <span>Archive Case</span>
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {selectedCase && (
        <>
          <CaseDetails
            caseItem={selectedCase}
            isOpen={isViewDialogOpen}
            onClose={() => setIsViewDialogOpen(false)}
            onEdit={handleEditCase}
            onArchive={handleArchiveCase}
          />

          <CaseEdit
            caseItem={selectedCase}
            isOpen={isEditDialogOpen}
            onClose={() => setIsEditDialogOpen(false)}
            onSave={handleSaveCase}
          />
        </>
      )}

      <AlertDialog open={isArchiveDialogOpen} onOpenChange={setIsArchiveDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will archive the case "{selectedCase?.title}". Archived cases can be restored later if needed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleArchiveConfirm}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Archive Case
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </TooltipProvider>
  );
}