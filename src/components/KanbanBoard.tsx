import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { useNavigate } from '../router/Router';
import { Subscription, SubscriptionStatus, BillingFrequency } from '../types';
import {
  Layers,
  Calendar,
  IndianRupee,
  Building2,
  ArrowRight,
  Play,
  Pause,
  XCircle,
  CheckCircle2,
  Table,
  Search,
  Filter,
  MessageSquare,
  Sparkles,
  ShieldCheck,
  Check
} from 'lucide-react';

export const KanbanBoard: React.FC = () => {
  const { subscriptions, updateSubscriptionStatus, authenticatedUser } = useApp();
  const navigate = useNavigate();

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCadence, setSelectedCadence] = useState<'ALL' | BillingFrequency>('ALL');

  // Drag and Drop state
  const [draggedSubId, setDraggedSubId] = useState<string | null>(null);
  const [dragOverCol, setDragOverCol] = useState<SubscriptionStatus | null>(null);

  const columns: {
    status: SubscriptionStatus;
    title: string;
    headerClass: string;
    borderClass: string;
    bgClass: string;
    dropHighlightClass: string;
  }[] = [
    {
      status: 'DRAFT',
      title: 'Draft Offers',
      headerClass: 'bg-[#F0EDFA] text-[#6254E8] border border-[#E3DCF7]',
      borderClass: 'border-[#E3DCF7]',
      bgClass: 'bg-[#F0EDFA]/25',
      dropHighlightClass: 'ring-2 ring-[#6254E8] bg-[#F0EDFA]/60'
    },
    {
      status: 'QUOTATION',
      title: 'Quotation Sent',
      headerClass: 'bg-[#FFF1E8] text-[#B86221] border border-[#FFE1D1]',
      borderClass: 'border-[#FFE1D1]',
      bgClass: 'bg-[#FFF1E8]/25',
      dropHighlightClass: 'ring-2 ring-[#B86221] bg-[#FFF1E8]/60'
    },
    {
      status: 'CONFIRMED',
      title: 'Confirmed Pipeline',
      headerClass: 'bg-[#E5F0FA] text-[#2C6EA6] border border-[#D5E6F5]',
      borderClass: 'border-[#D5E6F5]',
      bgClass: 'bg-[#E5F0FA]/25',
      dropHighlightClass: 'ring-2 ring-[#2C6EA6] bg-[#E5F0FA]/60'
    },
    {
      status: 'ACTIVE',
      title: 'Active Recurring',
      headerClass: 'bg-[#E1F3EB] text-[#2E7D5D] border border-[#CEEBDD]',
      borderClass: 'border-[#CEEBDD]',
      bgClass: 'bg-[#E1F3EB]/25',
      dropHighlightClass: 'ring-2 ring-[#2E7D5D] bg-[#E1F3EB]/60'
    },
    {
      status: 'PAUSED',
      title: 'Paused / At-Risk',
      headerClass: 'bg-[#FFEBEB] text-[#D34545] border border-[#FFD5D5]',
      borderClass: 'border-[#FFD5D5]',
      bgClass: 'bg-[#FFEBEB]/25',
      dropHighlightClass: 'ring-2 ring-[#D34545] bg-[#FFEBEB]/60'
    },
    {
      status: 'CLOSED',
      title: 'Closed / Expired',
      headerClass: 'bg-[#F1F5F9] text-[#64748B] border border-[#E2E8F0]',
      borderClass: 'border-[#E2E8F0]',
      bgClass: 'bg-[#F8FAFC]/50',
      dropHighlightClass: 'ring-2 ring-[#64748B] bg-[#F1F5F9]'
    }
  ];

  const getNextPossibleStates = (status: SubscriptionStatus): SubscriptionStatus[] => {
    switch (status) {
      case 'DRAFT':
        return ['QUOTATION', 'CONFIRMED', 'CLOSED'];
      case 'QUOTATION':
        return ['CONFIRMED', 'ACTIVE', 'DRAFT', 'CLOSED'];
      case 'CONFIRMED':
        return ['ACTIVE', 'PAUSED', 'CLOSED'];
      case 'ACTIVE':
        return ['PAUSED', 'CLOSED'];
      case 'PAUSED':
        return ['ACTIVE', 'CLOSED'];
      case 'CLOSED':
        return ['ACTIVE'];
      default:
        return [];
    }
  };

  const calculateSubTotal = (sub: Subscription) => {
    return sub.lines.reduce((acc, curr) => acc + curr.totalAmount, 0);
  };

  const handleSwitchToTable = () => {
    if (authenticatedUser.role === 'ADMIN') navigate('/admin/subscriptions-list');
    else if (authenticatedUser.role === 'FINANCE_LEAD') navigate('/finance/subscriptions-list');
    else navigate('/staff/subscriptions-list');
  };

  // Drag and drop handlers
  const handleDragStart = (e: React.DragEvent, subId: string) => {
    e.dataTransfer.setData('text/plain', subId);
    e.dataTransfer.effectAllowed = 'move';
    setDraggedSubId(subId);
  };

  const handleDragEnd = () => {
    setDraggedSubId(null);
    setDragOverCol(null);
  };

  const handleDragOver = (e: React.DragEvent, colStatus: SubscriptionStatus) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (dragOverCol !== colStatus) {
      setDragOverCol(colStatus);
    }
  };

  const handleDragLeave = (e: React.DragEvent, colStatus: SubscriptionStatus) => {
    if (dragOverCol === colStatus) {
      setDragOverCol(null);
    }
  };

  const handleDrop = (e: React.DragEvent, targetStatus: SubscriptionStatus) => {
    e.preventDefault();
    setDragOverCol(null);
    const subId = e.dataTransfer.getData('text/plain') || draggedSubId;
    if (subId) {
      updateSubscriptionStatus(subId, targetStatus);
    }
    setDraggedSubId(null);
  };

  // Filter subscriptions
  const filteredSubs = subscriptions.filter((sub) => {
    const matchesSearch =
      !searchQuery ||
      sub.number.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sub.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sub.planName.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCadence =
      selectedCadence === 'ALL' || sub.billingFrequency === selectedCadence;

    return matchesSearch && matchesCadence;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold tracking-tight text-[#252735]">
              Subscription Lifecycle Kanban
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#E1F3EB] text-[#2E7D5D] border border-[#CEEBDD]">
              Interactive 6-Stage Machine
            </span>
          </div>
          <p className="text-xs text-[#697386] mt-0.5">
            Drag cards between columns or click stage actions to progress subscriptions through the required pipeline.
          </p>
        </div>

        <button
          onClick={handleSwitchToTable}
          className="flex items-center gap-2 px-3.5 py-2 rounded-xl border border-[#DCE5ED] bg-white hover:bg-[#F0EDFA]/50 text-xs font-semibold text-[#697386] hover:text-[#252735] transition-all shadow-2xs"
        >
          <Table className="w-3.5 h-3.5 text-[#6254E8]" />
          <span>Switch to Table Matrix</span>
          <ArrowRight className="w-3.5 h-3.5 opacity-60" />
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3 rounded-2xl bg-white border border-[#E3E8EE] shadow-[0_2px_8px_rgba(41,42,58,0.02)]">
        <div className="relative w-full sm:w-72">
          <Search className="w-3.5 h-3.5 text-[#9299A8] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by contract # or customer..."
            className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-[#E3E8EE] bg-white text-xs text-[#252735] placeholder:text-[#9299A8] outline-hidden focus:border-[#6254E8]"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto">
          <span className="text-[11px] font-bold text-[#9299A8] uppercase tracking-wider mr-1">
            Cadence:
          </span>
          {(['ALL', 'DAILY', 'WEEKLY', 'MONTHLY', 'YEARLY'] as const).map((cadence) => (
            <button
              key={cadence}
              onClick={() => setSelectedCadence(cadence)}
              className={`px-2.5 py-1 rounded-xl text-xs font-semibold transition-all ${
                selectedCadence === cadence
                  ? 'bg-[#6254E8] text-white shadow-2xs'
                  : 'bg-[#F0EDFA]/40 text-[#697386] hover:bg-[#F0EDFA] hover:text-[#252735]'
              }`}
            >
              {cadence}
            </button>
          ))}
        </div>
      </div>

      {/* Kanban Board Horizontal Columns */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 overflow-x-auto pb-4">
        {columns.map((col) => {
          const columnSubs = filteredSubs.filter((s) => s.status === col.status);
          const columnTotal = columnSubs.reduce((acc, sub) => acc + calculateSubTotal(sub), 0);
          const isOver = dragOverCol === col.status;

          return (
            <div
              key={col.status}
              onDragOver={(e) => handleDragOver(e, col.status)}
              onDragLeave={(e) => handleDragLeave(e, col.status)}
              onDrop={(e) => handleDrop(e, col.status)}
              className={`flex flex-col rounded-3xl border ${col.borderClass} ${col.bgClass} p-3 min-w-[270px] min-h-[520px] transition-all shadow-[0_4px_16px_rgba(41,42,58,0.02)] ${
                isOver ? col.dropHighlightClass : ''
              }`}
            >
              {/* Column Header */}
              <div
                className={`p-2.5 rounded-2xl ${col.headerClass} flex items-center justify-between mb-3 shadow-2xs`}
              >
                <div className="text-xs font-bold">{col.title}</div>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-white/90 shadow-2xs">
                  {columnSubs.length}
                </span>
              </div>

              {/* Column Value Summary */}
              <div className="text-[11px] font-medium text-[#697386] px-1 mb-3 flex items-center justify-between">
                <span>Total Value:</span>
                <span className="font-bold text-[#252735] font-mono tabular-nums">
                  ₹{columnTotal.toLocaleString('en-IN')}
                </span>
              </div>

              {/* Cards List */}
              <div className="space-y-3 flex-1">
                {columnSubs.length === 0 ? (
                  <div className="h-32 border border-dashed border-[#DCE5ED] rounded-2xl flex items-center justify-center text-xs text-[#9299A8]">
                    Drop contracts here
                  </div>
                ) : (
                  columnSubs.map((sub) => {
                    const subVal = calculateSubTotal(sub);
                    const nextStates = getNextPossibleStates(sub.status);
                    const hasNegotiationNotes = sub.notes?.includes('[Client Negotiation Request]');

                    return (
                      <div
                        key={sub.id}
                        draggable={true}
                        onDragStart={(e) => handleDragStart(e, sub.id)}
                        onDragEnd={handleDragEnd}
                        className={`bg-white rounded-2xl border border-[#E3E8EE] p-3.5 shadow-[0_4px_12px_rgba(41,42,58,0.03)] hover:shadow-md transition-all group cursor-grab active:cursor-grabbing ${
                          draggedSubId === sub.id ? 'opacity-40 scale-95' : ''
                        }`}
                      >
                        {/* Sub Number & Cadence */}
                        <div className="flex items-start justify-between gap-2 mb-1.5">
                          <span className="text-[11px] font-bold text-[#6254E8] font-mono">
                            {sub.number}
                          </span>
                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-[#F0EDFA] text-[#6254E8] border border-[#E3DCF7]">
                            {sub.billingFrequency}
                          </span>
                        </div>

                        <div className="text-xs font-bold text-[#252735] truncate mb-0.5">
                          {sub.customerName}
                        </div>

                        <div className="text-[11px] text-[#697386] truncate mb-2">
                          Plan: {sub.planName}
                        </div>

                        {/* Customer Negotiation Alert Badge */}
                        {hasNegotiationNotes && (
                          <div className="mb-2 p-2 rounded-xl bg-[#FFF1E8] border border-[#FFE1D1] text-[10px] text-[#B86221] space-y-0.5">
                            <div className="font-bold flex items-center gap-1">
                              <MessageSquare className="w-3 h-3 text-[#F3C77B]" />
                              <span>Customer Requested Negotiation</span>
                            </div>
                            <div className="line-clamp-2 italic text-[#697386]">
                              {sub.notes?.split('[Client Negotiation Request]:')[1]?.trim()}
                            </div>
                          </div>
                        )}

                        {/* Amount & Due Date */}
                        <div className="pt-2 border-t border-[#E3E8EE]/70 flex items-center justify-between text-xs mb-2.5">
                          <span className="font-bold text-[#252735] font-mono tabular-nums">
                            ₹{subVal.toLocaleString('en-IN')}
                          </span>
                          <div className="flex items-center gap-1 text-[10px] text-[#697386] font-mono">
                            <Calendar className="w-3 h-3" />
                            <span>{sub.nextBillingDate}</span>
                          </div>
                        </div>

                        {/* Stage Transition Action Buttons */}
                        {nextStates.length > 0 && (
                          <div className="space-y-1 pt-1 border-t border-[#E3E8EE]/40">
                            <div className="text-[9px] font-bold text-[#9299A8] uppercase tracking-wider mb-1 flex items-center justify-between">
                              <span>Next Valid Stages:</span>
                            </div>
                            <div className="flex flex-wrap gap-1">
                              {nextStates.map((st) => (
                                <button
                                  key={st}
                                  onClick={() => updateSubscriptionStatus(sub.id, st)}
                                  className="px-2 py-0.5 rounded-lg bg-[#F0EDFA] hover:bg-[#6254E8] text-[#6254E8] hover:text-white border border-[#E3DCF7] text-[10px] font-semibold transition-all flex items-center gap-1"
                                >
                                  {st === 'ACTIVE' && (
                                    <Play className="w-2.5 h-2.5 text-[#55C9A2]" />
                                  )}
                                  {st === 'PAUSED' && (
                                    <Pause className="w-2.5 h-2.5 text-[#F3C77B]" />
                                  )}
                                  {st === 'CLOSED' && (
                                    <XCircle className="w-2.5 h-2.5 text-[#E99B9B]" />
                                  )}
                                  {st === 'CONFIRMED' && (
                                    <CheckCircle2 className="w-2.5 h-2.5 text-[#7A8CE8]" />
                                  )}
                                  {st === 'QUOTATION' && (
                                    <Sparkles className="w-2.5 h-2.5 text-[#F3C77B]" />
                                  )}
                                  <span>{st}</span>
                                </button>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
