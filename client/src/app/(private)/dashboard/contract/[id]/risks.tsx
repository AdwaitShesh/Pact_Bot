import React from 'react';
import { Card, CardContent } from "@/components/ui/card";

interface RisksProps {
  risks: Array<{
    description: string;
    severity: 'low' | 'medium' | 'high';
    category: string;
    _id?: string;
  }>;
}

export default function Risks({ risks }: RisksProps) {
  return (
    <div className="space-y-4">
      {risks.map((risk, index) => (
        <Card key={risk._id || index}>
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <p className="text-sm text-gray-500">{risk.category}</p>
                <p className="text-base font-medium">{risk.description}</p>
              </div>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                risk.severity === 'high' 
                  ? 'bg-red-100 text-red-700' 
                  : risk.severity === 'medium'
                  ? 'bg-yellow-100 text-yellow-700'
                  : 'bg-green-100 text-green-700'
              }`}>
                {risk.severity}
              </span>
            </div>
          </CardContent>
        </Card>
      ))}
      {risks.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          No risks identified
        </div>
      )}
    </div>
  );
} 