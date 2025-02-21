"use client"

import { ContractAnalysis } from "@/interfaces/contract.interface";
import { ReactNode, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { ArrowDown, ArrowUp, Minus } from "lucide-react";
import OverallScoreChart from "./chart";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { motion } from "framer-motion";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Accordion, AccordionItem, AccordionTrigger } from "../ui/accordion";
import { AccordionContent } from "@radix-ui/react-accordion";
import { MessageSquare } from "lucide-react";

interface IContractAnalysisResultsProps {
  analysisResults: ContractAnalysis;
  contractId: string;
}

export default function ContractAnalysisResults({
  analysisResults,
  contractId,
}: IContractAnalysisResultsProps) {
  const [activeTab, setActiveTab] = useState("summary");

  if (!analysisResults) {
    return <div>No results</div>;
  }

  const getScore = () => {
    const score = analysisResults.overallScore; //analysisResults.overallScore ||
    if (score > 70)
      return { icon: ArrowUp, color: "text-green-500", text: "Good" };
    if (score < 50)
      return { icon: ArrowDown, color: "text-red-500", text: "Bad" };
    return { icon: Minus, color: "text-yellow-500", text: "Average" };
  };

  const scoreTrend = getScore();

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "high":
        return "bg-red-100 text-red-800";
      case "medium":
        return "bg-yellow-100 text-yellow-800";
      case "low":
        return "bg-green-100 text-green-800";
    }
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case "high":
        return "bg-red-100 text-red-800";
      case "medium":
        return "bg-yellow-100 text-yellow-800";
      case "low":
        return "bg-green-100 text-green-800";
    }
  };

  const renderRisksAndOpportunities = (
    items: Array<{
      risk?: string;
      opportunity?: string;
      explanation?: string;
      severity?: string;
      impact?: string;
    }>,
    type: "risks" | "opportunities"
  ) => {
    const fakeItems = {
      risk: type === "risks" ? "Hidden Risk" : undefined,
      opportunity: type === "opportunities" ? "Hidden Opportunity" : undefined,
      explanation: "Hidden Explanation",
      severity: "low",
      impact: "low",
    };

    return (
      <ul className="space-y-4">
        {items.map((item, index) => (
          <motion.li
            className="border rounded-lg p-4"
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
          >
            <div className="flex justify-between items-start mb-2">
              <span className="font-semibold text-lg">
                {type === "risks" ? item.risk : item.opportunity}
              </span>
              {(item.severity || item.impact) && (
                <Badge
                  className={
                    type === "risks"
                      ? getSeverityColor(item.severity!)
                      : getImpactColor(item.impact!)
                  }
                >
                  {(item.severity || item.impact)?.toUpperCase()}
                </Badge>
              )}
            </div>
            <p className="mt-2 text-gray-600">
              {type === "risks" ? item.explanation : item.explanation}
            </p>
          </motion.li>
        ))}
      </ul>
    );
  };

  const handleAskAI = () => {
    // Implement AI chat functionality directly without subscription check
    // You can add your AI chat logic here
    console.log("Opening AI chat...");
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Analysis Results</h1>
        <div className="flex space-x-2">
          <Button onClick={handleAskAI} variant="outline">
            <MessageSquare className="size-4 mr-2" />
            Ask AI
          </Button>
        </div>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Overal Contract Score</CardTitle>
          <CardDescription>
            Based on risks and opportunities identified
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="w-1/2">
              <div className="flex items-center space-x-4 mb-4">
                <div className="text-4xl font-bold">
                  {analysisResults.overallScore ?? 0}
                </div>
                <div className={`flex items-center ${scoreTrend.color}`}>
                  <scoreTrend.icon className="size-6 mr-1" />
                  <span className="font-semibold">{scoreTrend.text}</span>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Risk</span>
                  <span>{100 - analysisResults.overallScore}%</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Opportunities</span>
                  <span>{analysisResults.overallScore}%</span>
                </div>
              </div>
              <p className="text-sm text-gray-600 mt-4">
                This score represents the overall risk and opportunitys
                identified in the contract.
              </p>
            </div>

            <div className="w-1/2 h-48 flex justify-center items-center mt-[-20px]">
              <div className="w-full h-full max-w-xs">
                <OverallScoreChart
                  overallScore={analysisResults.overallScore}
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="summary">Summary</TabsTrigger>
          <TabsTrigger value="risks">Risks</TabsTrigger>
          <TabsTrigger value="opportunities">Opportunities</TabsTrigger>
          <TabsTrigger value="negotiation">Negotiation Points</TabsTrigger>
        </TabsList>
        <TabsContent value="summary">
          <Card>
            <CardHeader>
              <CardTitle>Contract Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="prose max-w-none">
                {analysisResults.summary}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="risks">
          <Card>
            <CardHeader>
              <CardTitle>Risks</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="prose max-w-none">
                {analysisResults.risks}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="opportunities">
          <Card>
            <CardHeader>
              <CardTitle>Opportunities</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="prose max-w-none">
                {analysisResults.opportunities}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="negotiation">
          <Card>
            <CardHeader>
              <CardTitle>Negotiation Points</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="prose max-w-none">
                {analysisResults.negotiationPoints}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Accordion type="single" collapsible className="mb-6">
        <AccordionItem value="contract-details">
          <AccordionTrigger>Contract Details</AccordionTrigger>
          <AccordionContent>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <h3 className="font-semibold mb-2">
                  Duration and Termination
                </h3>
                <p>{analysisResults.contractDuration}</p>
                <strong>Termination Conditions</strong>
                <p>{analysisResults.terminationConditions}</p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Legal Informatiob</h3>
                <p>
                  <strong>Legal Compliance</strong>
                  {analysisResults.legalCompliance}
                </p>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}
