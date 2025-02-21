import { ContractAnalysis } from "@/interfaces/contract.interface";
import { api } from "@/lib/api";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState, useMemo } from "react";
import { Alert, AlertDescription } from "../ui/alert";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
} from "@tanstack/react-table";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import { UploadModal } from "../modals/upload-modal";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { MoreHorizontal } from "lucide-react";
import Link from "next/link";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export default function UserContracts() {
  const queryClient = useQueryClient();
  const [alert, setAlert] = useState<{ type: 'success' | 'error', message: string } | null>(null);

  const deleteContract = useMutation({
    mutationFn: async (contractId: string) => {
      try {
        console.log('Deleting contract with ID:', contractId);
        const response = await api.delete(`/contracts/contract/${contractId}`);
        if (response.status === 200) {
          console.log('Contract deleted successfully');
          return response.data;
        }
        throw new Error('Failed to delete contract');
      } catch (error) {
        console.error('Error deleting contract:', error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["user-contracts"]);
      setAlert({ type: 'success', message: 'Contract deleted successfully' });
      // Clear alert after 3 seconds
      setTimeout(() => setAlert(null), 3000);
    },
    onError: (error) => {
      console.error('Mutation error:', error);
      setAlert({ type: 'error', message: 'Failed to delete contract' });
      // Clear alert after 3 seconds
      setTimeout(() => setAlert(null), 3000);
    }
  });

  const handleDelete = async (contractId: string) => {
    try {
      await deleteContract.mutateAsync(contractId);
    } catch (error) {
      console.error('Failed to delete contract:', error);
    }
  };

  const { data: contracts } = useQuery<ContractAnalysis[]>({
    queryKey: ["user-contracts"],
    queryFn: () => fetchUserContracts(),
  });

  // Calculate statistics from contracts data
  const totalContracts = useMemo(() => contracts?.length || 0, [contracts]);
  
  const averageScore = useMemo(() => {
    if (!contracts?.length) return 0;
    const total = contracts.reduce((sum, contract) => sum + (contract.overallScore || 0), 0);
    return (total / contracts.length).toFixed(1);
  }, [contracts]);

  const highRiskContracts = useMemo(() => {
    return contracts?.filter(contract => 
      contract.risks?.some(risk => risk.severity === "high")
    ).length || 0;
  }, [contracts]);

  const [sorting, setSorting] = useState<SortingState>([]);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

  const contractTypeColors: { [key: string]: string } = {
    Employment: "bg-blue-900/20 text-blue-400",
    "Non-Disclosure Agreement": "bg-green-900/20 text-green-400",
    Sales: "bg-yellow-900/20 text-yellow-400",
    Lease: "bg-emerald-900/20 text-emerald-400",
    Services: "bg-pink-900/20 text-pink-400",
    Other: "bg-gray-900/20 text-gray-400",
  };

  const columns: ColumnDef<ContractAnalysis>[] = [
    {
      accessorKey: "_id",
      header: ({ column }) => {
        return (
          <div className="text-muted-foreground">Contract ID</div>
        );
      },
      cell: ({ row }) => (
        <div className="text-foreground">{row.getValue<string>("_id")}</div>
      ),
    },
    {
      accessorKey: "overallScore",
      header: ({ column }) => {
        return (
          <div className="text-muted-foreground">Overall Score</div>
        );
      },
      cell: ({ row }) => {
        const score = parseFloat(row.getValue("overallScore"));
        return (
          <Badge
            className="rounded-md"
            variant={
              score > 75 ? "success" : score < 50 ? "destructive" : "secondary"
            }
          >
            {score.toFixed(2)} Overall Score
          </Badge>
        );
      },
    },
    {
      accessorKey: "contractType",
      header: "Contract Type",
      cell: ({ row }) => {
        const contractType = row.getValue("contractType") as string;
        const colorClass =
          contractTypeColors[contractType] || contractTypeColors["Other"];
        return (
          <Badge className={cn("rounded-md", colorClass)}>{contractType}</Badge>
        );
      },
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const contract = row.original;

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant={"ghost"} className="size-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="size-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>
                <Link href={`/dashboard/contract/${contract._id}`}>
                  View Details
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                    <span className="text-destructive">Delete Contract</span>
                  </DropdownMenuItem>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>
                      Are you absolutely sure?
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                      This action cannot be undone. This will permanently delete
                      your contract and remove your data from our servers.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={() => handleDelete(contract._id)}
                      disabled={deleteContract.isPending}
                    >
                      {deleteContract.isPending ? "Deleting..." : "Delete"}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  const table = useReactTable({
    data: contracts ?? [],
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    state: {
      sorting,
    },
  });

  return (
    <div className="p-8 bg-background">
      <div className="flex items-center justify-between mb-8">
        <div className="space-y-1">
          <h2 className="text-2xl font-semibold tracking-tight text-foreground">Your Contracts</h2>
          <p className="text-sm text-muted-foreground">
            Manage and analyze your contracts
          </p>
        </div>
        <Button onClick={() => setIsUploadModalOpen(true)} className="bg-primary text-primary-foreground">
          Upload Contract
        </Button>
      </div>

      {alert && (
        <Alert variant={alert.type === 'success' ? "default" : "destructive"}>
          <AlertDescription>{alert.message}</AlertDescription>
        </Alert>
      )}

      <div className="grid gap-4 md:grid-cols-3 mb-8">
        <Card className="bg-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Contracts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{contracts?.length || 0}</div>
          </CardContent>
        </Card>

        <Card className="bg-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Average Score
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{averageScore}%</div>
          </CardContent>
        </Card>

        <Card className="bg-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              High Risk Contracts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{highRiskContracts}</div>
          </CardContent>
        </Card>
      </div>

      <div className="rounded-md border border-border bg-card">
        <Table>
          <TableHeader className="bg-muted/50">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className="hover:bg-muted/50">
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id} className="text-muted-foreground">
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                  className="hover:bg-muted/50"
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className="text-foreground">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center text-muted-foreground"
                >
                  No contracts found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-end space-x-2 py-4">
        <Button
          variant={"outline"}
          size={"sm"}
          onClick={() => table.setPageIndex(0)}
          disabled={!table.getCanPreviousPage()}
        >
          Previous
        </Button>
        <Button
          variant={"outline"}
          size={"sm"}
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}
        >
          Next
        </Button>
      </div>
      <UploadModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onUploadComplete={() => table.reset()}
      />
    </div>
  );
}

async function fetchUserContracts(): Promise<ContractAnalysis[]> {
  const response = await api.get("/contracts/user-contracts");
  return response.data;
}
