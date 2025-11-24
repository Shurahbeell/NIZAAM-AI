import { useLocation } from "wouter";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, AlertTriangle, Package } from "lucide-react";
import { useLHWInventory } from "@/lib/useLHWData";
import { Skeleton } from "@/components/ui/skeleton";

export default function Inventory() {
  const [, setLocation] = useLocation();
  const { data: inventory, isLoading } = useLHWInventory();

  const getStatusColor = (status: string) => {
    switch (status) {
      case "in_stock":
        return "bg-green-100 text-green-800";
      case "low":
        return "bg-yellow-100 text-yellow-800";
      case "out_of_stock":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const groupedInventory =
    inventory?.reduce(
      (acc: Record<string, any[]>, item: any) => {
        if (!acc[item.itemType]) acc[item.itemType] = [];
        acc[item.itemType].push(item);
        return acc;
      },
      {}
    ) || {};

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <header className="border-b sticky top-0 bg-background z-10">
        <div className="p-4 flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setLocation("/lhw/dashboard")}
            data-testid="button-back"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-lg font-semibold">Inventory</h1>
        </div>
      </header>

      <div className="p-4 max-w-2xl mx-auto">
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-20 w-full" />
            ))}
          </div>
        ) : inventory && inventory.length > 0 ? (
          Object.entries(groupedInventory || {}).map(([type, items]) => (
            <div key={type} className="mb-6">
              <h2 className="text-sm font-semibold mb-3 capitalize text-muted-foreground">
                {type}
              </h2>
              <div className="space-y-3">
                {items.map((item: any) => (
                  <Card
                    key={item.id}
                    className="p-4"
                    data-testid={`card-inventory-${item.id}`}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="font-semibold">{item.itemName}</h3>
                        <p className="text-xs text-muted-foreground mt-1">
                          Quantity: {item.quantity} units
                        </p>
                      </div>
                      <Badge className={getStatusColor(item.reorderStatus)}>
                        {item.reorderStatus.replace("_", " ")}
                      </Badge>
                    </div>

                    {item.reorderStatus === "low" && (
                      <div className="text-xs text-amber-600 mb-3 flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3" />
                        Below minimum threshold ({item.minThreshold})
                      </div>
                    )}

                    {item.reorderStatus === "out_of_stock" && (
                      <Button
                        size="sm"
                        className="w-full"
                        onClick={() => alert("Request for restock submitted")}
                        data-testid={`button-restock-${item.id}`}
                      >
                        Request Restock
                      </Button>
                    )}
                  </Card>
                ))}
              </div>
            </div>
          ))
        ) : (
          <Card className="p-8 text-center">
            <Package className="w-12 h-12 mx-auto mb-3 text-muted-foreground" />
            <p className="text-muted-foreground">No inventory items</p>
          </Card>
        )}
      </div>
    </div>
  );
}
