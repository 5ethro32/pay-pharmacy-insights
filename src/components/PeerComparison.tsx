import React, { useState, useEffect, useMemo } from "react";
import { PaymentData } from "@/types/paymentTypes";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface PeerComparisonProps {
  userId: string;
  documentList: PaymentData[];
  peerData: PaymentData[];
  loading: boolean;
}

const PeerComparison = ({ userId, documentList, peerData, loading }: PeerComparisonProps) => {
  const [selectedMetric, setSelectedMetric] = useState<string>("totalItems");
  const [selectedMonth, setSelectedMonth] = useState<string>("");
  const [selectedHealthBoard, setSelectedHealthBoard] = useState<string>("All");

  // Get unique health boards from all data
  const healthBoards = useMemo(() => {
    const allData = [...documentList, ...peerData];
    const uniqueBoards = new Set(allData.map(doc => doc.healthBoard).filter(Boolean));
    return ["All", ...Array.from(uniqueBoards)];
  }, [documentList, peerData]);

  const filteredPeerData = useMemo(() => {
    return peerData.filter(peer => {
      if (selectedHealthBoard === "All") return true;
      return peer.healthBoard === selectedHealthBoard;
    });
  }, [peerData, selectedHealthBoard]);

  const filteredDocumentList = useMemo(() => {
    return documentList.filter(doc => {
      if (selectedMonth === "") return true;
      return doc.month.toUpperCase() === selectedMonth.toUpperCase();
    });
  }, [documentList, selectedMonth]);

  const filteredPeerList = useMemo(() => {
    let filtered = filteredPeerData;
    if (selectedMonth !== "") {
      filtered = filteredPeerData.filter(peer => peer.month.toUpperCase() === selectedMonth.toUpperCase());
    }
    return filtered;
  }, [filteredPeerData, selectedMonth]);

  const averageValue = useMemo(() => {
    if (filteredDocumentList.length === 0) return 0;
    const total = filteredDocumentList.reduce((acc, doc) => acc + (doc[selectedMetric as keyof PaymentData] as number || 0), 0);
    return total / filteredDocumentList.length;
  }, [filteredDocumentList, selectedMetric]);

  const peerAverageValue = useMemo(() => {
    if (filteredPeerList.length === 0) return 0;
    const total = filteredPeerList.reduce((acc, peer) => acc + (peer[selectedMetric as keyof PaymentData] as number || 0), 0);
    return total / filteredPeerList.length;
  }, [filteredPeerList, selectedMetric]);

  const monthOptions = useMemo(() => {
    const allMonths = documentList.map(doc => doc.month);
    const uniqueMonths = new Set(allMonths);
    return ["", ...Array.from(uniqueMonths)];
  }, [documentList]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-4 items-center justify-between">
        <div className="flex flex-wrap gap-4 items-center">
          <Select
            value={selectedMonth}
            onValueChange={setSelectedMonth}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select Month" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Months</SelectItem>
              {monthOptions.map((month) => (
                <SelectItem key={month} value={month}>
                  {month || "Unknown"}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={selectedHealthBoard}
            onValueChange={setSelectedHealthBoard}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select Health Board" />
            </SelectTrigger>
            <SelectContent>
              {healthBoards.map((board) => (
                <SelectItem key={board} value={board}>
                  {board || "Unknown"}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={selectedMetric}
            onValueChange={setSelectedMetric}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Compare metric" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="totalItems">Total Items</SelectItem>
              <SelectItem value="netPayment">Net Payment</SelectItem>
              <SelectItem value="averageItemValue">Average Item Value</SelectItem>
              {/* Add more metrics as needed */}
            </SelectContent>
          </Select>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-800"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow-md p-4">
            <h3 className="text-lg font-semibold mb-2">Your Average</h3>
            <p className="text-gray-600">
              {selectedMetric}: {averageValue.toFixed(2)}
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-4">
            <h3 className="text-lg font-semibold mb-2">Peer Average</h3>
            <p className="text-gray-600">
              {selectedMetric}: {peerAverageValue.toFixed(2)}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default PeerComparison;
