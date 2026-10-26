'use client';

import React, { useState } from 'react';
import { useSquadStore } from '@/lib/store';
import { BorrowItem, BorrowType, BorrowStatus, PersonaId } from '@/types';
import { formatRelativeTime, cn } from '@/lib/utils';
import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Modal } from '@/components/ui/Modal';
import {
  ShoppingBag,
  Search,
  Plus,
  HelpCircle,
  Sparkles,
  CheckCircle2,
  Clock,
  ArrowRight,
  RotateCcw,
  Tag,
  MapPin,
  Laptop,
  Book,
  Shirt,
  Box,
  IndianRupee,
  ShieldAlert,
} from 'lucide-react';

type ItemCategory = 'Electronics' | 'Books & Notes' | 'Clothing & Accessories' | 'Daily Essentials' | 'Other';

const CATEGORIES: { label: ItemCategory; icon: React.ElementType }[] = [
  { label: 'Electronics', icon: Laptop },
  { label: 'Books & Notes', icon: Book },
  { label: 'Clothing & Accessories', icon: Shirt },
  { label: 'Daily Essentials', icon: Box },
  { label: 'Other', icon: Tag },
];

export function BorrowBoard() {
  const {
    borrowItems,
    personas,
    currentPersonaId,
    addBorrowItem,
    updateBorrowStatus,
  } = useSquadStore();

  const [mainView, setMainView] = useState<'borrow' | 'lost_found'>('borrow');
  const [statusFilter, setStatusFilter] = useState<'all' | 'open' | 'borrowed' | 'resolved'>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isPostModalOpen, setIsPostModalOpen] = useState(false);
  const [actionFeedback, setActionFeedback] = useState<string | null>(null);

  // Form state for creating an item
  const [postType, setPostType] = useState<BorrowType>('LendingOffer');
  const [postTitle, setPostTitle] = useState('');
  const [postCategory, setPostCategory] = useState<ItemCategory>('Electronics');
  const [postLocation, setPostLocation] = useState('Flat 402 - Living Room');
  const [postDeposit, setPostDeposit] = useState<number>(0);
  const [postNotes, setPostNotes] = useState('');

  const handlePostItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!postTitle.trim()) return;

    addBorrowItem({
      type: postType,
      title: postTitle.trim(),
      category: postCategory,
      ownerId: currentPersonaId,
      borrowerOrClaimerId: null,
      status: 'Open',
      locationOrRoom: postLocation.trim() || 'Flat 402',
      depositRequired: Number(postDeposit) || 0,
      notes: postNotes.trim(),
    });

    setIsPostModalOpen(false);
    setPostTitle('');
    setPostNotes('');
    setActionFeedback('Item posted to the board successfully!');
    setTimeout(() => setActionFeedback(null), 3000);
  };

  const handleStatusTransition = (
    item: BorrowItem,
    newStatus: BorrowStatus,
    borrowerId?: PersonaId | null
  ) => {
    updateBorrowStatus(item.id, newStatus, borrowerId);
    let msg = `Status updated to ${newStatus}!`;
    if (newStatus === 'Borrowed') {
      msg = `You reserved/borrowed "${item.title}"! Remember to return it when done.`;
    } else if (newStatus === 'Returned') {
      msg = `"${item.title}" marked as safely returned!`;
    } else if (newStatus === 'Resolved') {
      msg = `"${item.title}" marked as resolved!`;
    }
    setActionFeedback(msg);
    setTimeout(() => setActionFeedback(null), 3500);
  };

  // Filter items based on main tab (borrow vs lost_found)
  const isBorrowType = (t: BorrowType) => t === 'BorrowRequest' || t === 'LendingOffer';
  const isLostFoundType = (t: BorrowType) => t === 'LostItem' || t === 'FoundItem';

  const displayedItems = borrowItems.filter((item) => {
    // 1. Main tab filter
    if (mainView === 'borrow' && !isBorrowType(item.type)) return false;
    if (mainView === 'lost_found' && !isLostFoundType(item.type)) return false;

    // 2. Status filter
    if (statusFilter === 'open' && item.status !== 'Open') return false;
    if (statusFilter === 'borrowed' && item.status !== 'Borrowed') return false;
    if (statusFilter === 'resolved' && item.status !== 'Returned' && item.status !== 'Resolved')
      return false;

    // 3. Category filter
    if (categoryFilter !== 'all' && item.category !== categoryFilter) return false;

    // 4. Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = item.title.toLowerCase().includes(q);
      const matchNotes = item.notes?.toLowerCase().includes(q);
      const matchOwner = personas[item.ownerId]?.name.toLowerCase().includes(q);
      if (!matchTitle && !matchNotes && !matchOwner) return false;
    }

    return true;
  });

  const getStatusBadge = (status: BorrowStatus) => {
    switch (status) {
      case 'Open':
        return (
          <Badge variant="success" size="sm" withDot>
            Open
          </Badge>
        );
      case 'Borrowed':
        return (
          <Badge variant="warning" size="sm" withDot>
            Borrowed
          </Badge>
        );
      case 'Returned':
      case 'Resolved':
        return (
          <Badge variant="secondary" size="sm" withDot>
            {status}
          </Badge>
        );
    }
  };

  const getTypeBadge = (type: BorrowType) => {
    switch (type) {
      case 'LendingOffer':
        return (
          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
            Lending Offer
          </span>
        );
      case 'BorrowRequest':
        return (
          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/30">
            Borrow Request
          </span>
        );
      case 'LostItem':
        return (
          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/30">
            Lost Item
          </span>
        );
      case 'FoundItem':
        return (
          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/30">
            Found Item
          </span>
        );
    }
  };

  const getCategoryIcon = (category: string) => {
    const found = CATEGORIES.find((c) => c.label === category);
    return found ? found.icon : Tag;
  };

  const openBorrowCount = borrowItems.filter((i) => isBorrowType(i.type) && i.status === 'Open').length;
  const openLostCount = borrowItems.filter((i) => isLostFoundType(i.type) && i.status === 'Open').length;

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-gradient-to-r from-emerald-950/40 via-card to-card border border-emerald-500/20 rounded-2xl p-4 sm:p-6 shadow-sm">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-emerald-500/15 text-emerald-500">
              <ShoppingBag className="w-4 h-4" />
            </span>
            <h2 className="text-xl font-bold tracking-tight text-foreground">
              Borrow & Lost/Found Wing
            </h2>
            <Badge variant="daily" size="sm">
              {openBorrowCount + openLostCount} Active Listings
            </Badge>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Lend calculators, HDMI adapters, textbooks, and find misplaced dorm keys or ID cards within the flat.
          </p>
        </div>

        <Button
          variant="daily"
          size="sm"
          onClick={() => {
            setPostType(mainView === 'borrow' ? 'LendingOffer' : 'LostItem');
            setIsPostModalOpen(true);
          }}
          className="shadow-emerald-500/20 shrink-0"
        >
          <Plus className="w-4 h-4 mr-1.5" />
          {mainView === 'borrow' ? 'Post Item to Lend / Request' : 'Report Lost / Found'}
        </Button>
      </div>

      {actionFeedback && (
        <div className="flex items-center gap-2 p-3 bg-emerald-500/15 border border-emerald-500/40 text-emerald-700 dark:text-emerald-300 rounded-xl text-xs sm:text-sm animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
          <span>{actionFeedback}</span>
        </div>
      )}

      {/* Main Mode Tabs: Borrow Board vs Lost & Found */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setMainView('borrow');
              setStatusFilter('all');
            }}
            className={cn(
              'px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center gap-2',
              mainView === 'borrow'
                ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-500/20'
                : 'bg-muted/60 text-muted-foreground hover:text-foreground'
            )}
          >
            <ShoppingBag className="w-4 h-4" />
            Borrow & Lending ({openBorrowCount} open)
          </button>

          <button
            onClick={() => {
              setMainView('lost_found');
              setStatusFilter('all');
            }}
            className={cn(
              'px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center gap-2',
              mainView === 'lost_found'
                ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-500/20'
                : 'bg-muted/60 text-muted-foreground hover:text-foreground'
            )}
          >
            <HelpCircle className="w-4 h-4" />
            Lost & Found ({openLostCount} open)
          </button>
        </div>

        {/* Search Input */}
        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search items, notes, owners..."
            className="w-full text-xs rounded-xl border border-border bg-background pl-9 pr-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>
      </div>

      {/* Filter Chips: Status & Category */}
      <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
        {/* Status filters */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
          <button
            onClick={() => setStatusFilter('all')}
            className={cn(
              'px-2.5 py-1 rounded-lg border font-medium transition-colors text-xs',
              statusFilter === 'all'
                ? 'bg-card border-emerald-500 text-foreground font-semibold'
                : 'border-border bg-muted/40 text-muted-foreground hover:text-foreground'
            )}
          >
            All
          </button>
          <button
            onClick={() => setStatusFilter('open')}
            className={cn(
              'px-2.5 py-1 rounded-lg border font-medium transition-colors text-xs',
              statusFilter === 'open'
                ? 'bg-card border-emerald-500 text-foreground font-semibold'
                : 'border-border bg-muted/40 text-muted-foreground hover:text-foreground'
            )}
          >
            Open Only
          </button>
          {mainView === 'borrow' && (
            <button
              onClick={() => setStatusFilter('borrowed')}
              className={cn(
                'px-2.5 py-1 rounded-lg border font-medium transition-colors text-xs',
                statusFilter === 'borrowed'
                  ? 'bg-card border-emerald-500 text-foreground font-semibold'
                  : 'border-border bg-muted/40 text-muted-foreground hover:text-foreground'
              )}
            >
              Borrowed
            </button>
          )}
          <button
            onClick={() => setStatusFilter('resolved')}
            className={cn(
              'px-2.5 py-1 rounded-lg border font-medium transition-colors text-xs',
              statusFilter === 'resolved'
                ? 'bg-card border-emerald-500 text-foreground font-semibold'
                : 'border-border bg-muted/40 text-muted-foreground hover:text-foreground'
            )}
          >
            {mainView === 'borrow' ? 'Returned' : 'Resolved'}
          </button>
        </div>

        {/* Category dropdown */}
        <div className="flex items-center gap-1.5">
          <span className="text-[11px] text-muted-foreground hidden sm:inline">Category:</span>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="text-xs rounded-lg border border-border bg-background px-2.5 py-1 focus:outline-none focus:ring-1 focus:ring-emerald-500"
          >
            <option value="all">All Categories</option>
            {CATEGORIES.map((c) => (
              <option key={c.label} value={c.label}>
                {c.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Items Grid */}
      {displayedItems.length === 0 ? (
        <Card className="py-12 text-center">
          <CardContent className="space-y-3">
            <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mx-auto text-muted-foreground">
              <ShoppingBag className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h3 className="font-semibold text-sm text-foreground">No items match this filter</h3>
              <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                {mainView === 'borrow'
                  ? 'Have an extra calculator or adapter to lend? Or need something for a class presentation?'
                  : 'Lost an item on campus or found misplaced keys? List it here to notify your squad.'}
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setPostType(mainView === 'borrow' ? 'LendingOffer' : 'LostItem');
                setIsPostModalOpen(true);
              }}
              className="mt-2 text-xs"
            >
              <Plus className="w-3.5 h-3.5 mr-1" />
              Create Post
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {displayedItems.map((item) => {
            const owner = personas[item.ownerId];
            const borrower = item.borrowerOrClaimerId ? personas[item.borrowerOrClaimerId] : null;
            const isOwner = item.ownerId === currentPersonaId;
            const isBorrower = item.borrowerOrClaimerId === currentPersonaId;
            const CategoryIcon = getCategoryIcon(item.category);

            return (
              <Card
                key={item.id}
                className={cn(
                  'flex flex-col justify-between overflow-hidden transition-all duration-200',
                  (isOwner || isBorrower) && 'border-emerald-500/40 bg-emerald-950/5'
                )}
              >
                <div className="p-4 space-y-3">
                  {/* Top Header: Category & Status */}
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5">
                      <span className="p-1 rounded-md bg-muted text-muted-foreground">
                        <CategoryIcon className="w-3.5 h-3.5" />
                      </span>
                      <span className="text-[11px] text-muted-foreground font-medium truncate max-w-[120px]">
                        {item.category}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      {getTypeBadge(item.type)}
                      {getStatusBadge(item.status)}
                    </div>
                  </div>

                  {/* Title & Notes */}
                  <div>
                    <h3 className="font-semibold text-sm text-foreground leading-snug">
                      {item.title}
                    </h3>
                    {item.notes && (
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-2 leading-relaxed">
                        {item.notes}
                      </p>
                    )}
                  </div>

                  {/* Metadata box: Location & Deposit */}
                  <div className="space-y-1.5 bg-muted/40 rounded-xl p-2.5 border border-border/50 text-[11px]">
                    <div className="flex items-center justify-between text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-emerald-500 shrink-0" />
                        <span className="truncate max-w-[160px]">{item.locationOrRoom}</span>
                      </span>

                      {item.depositRequired > 0 && (
                        <span className="font-semibold text-amber-500 flex items-center gap-0.5">
                          <IndianRupee className="w-3 h-3" />
                          ₹{item.depositRequired} Deposit
                        </span>
                      )}
                    </div>

                    {/* Owner / Borrower Info */}
                    <div className="flex items-center justify-between pt-1 border-t border-border/40">
                      <div className="flex items-center gap-1.5">
                        <Avatar name={owner?.name || 'Owner'} src={owner?.avatar} size="xs" />
                        <span className="text-muted-foreground text-[10px]">
                          {item.type === 'BorrowRequest' || item.type === 'LostItem'
                            ? 'Wanted by'
                            : 'Offered by'}{' '}
                          <span className="font-medium text-foreground">
                            {isOwner ? 'You' : owner?.name.split(' ')[0]}
                          </span>
                        </span>
                      </div>

                      {borrower && (
                        <div className="flex items-center gap-1.5">
                          <Avatar name={borrower.name} src={borrower.avatar} size="xs" />
                          <span className="text-muted-foreground text-[10px]">
                            With:{' '}
                            <span className="font-medium text-foreground">
                              {isBorrower ? 'You' : borrower.name.split(' ')[0]}
                            </span>
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Action Footer */}
                <div className="p-3 bg-muted/20 border-t border-border flex items-center justify-between gap-2">
                  <span className="text-[10px] text-muted-foreground">
                    {formatRelativeTime(item.createdAt)}
                  </span>

                  {/* Action Buttons based on lifecycle */}
                  <div>
                    {/* 1. Open Lending Offer */}
                    {item.type === 'LendingOffer' && item.status === 'Open' && (
                      <Button
                        variant="daily"
                        size="sm"
                        onClick={() =>
                          handleStatusTransition(item, 'Borrowed', currentPersonaId)
                        }
                        className="text-xs h-7 px-2.5"
                      >
                        Request to Borrow
                      </Button>
                    )}

                    {/* 2. Open Borrow Request */}
                    {item.type === 'BorrowRequest' && item.status === 'Open' && (
                      <Button
                        variant="daily"
                        size="sm"
                        onClick={() =>
                          handleStatusTransition(item, 'Borrowed', currentPersonaId)
                        }
                        className="text-xs h-7 px-2.5"
                      >
                        I Can Lend This
                      </Button>
                    )}

                    {/* 3. Borrowed item -> Mark Returned */}
                    {item.status === 'Borrowed' && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleStatusTransition(item, 'Returned', null)}
                        className="text-xs h-7 px-2.5 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/10"
                      >
                        <RotateCcw className="w-3 h-3 mr-1" />
                        Mark Returned
                      </Button>
                    )}

                    {/* 4. Open Lost Item */}
                    {item.type === 'LostItem' && item.status === 'Open' && (
                      <Button
                        variant="daily"
                        size="sm"
                        onClick={() =>
                          handleStatusTransition(item, 'Resolved', currentPersonaId)
                        }
                        className="text-xs h-7 px-2.5"
                      >
                        I Found This!
                      </Button>
                    )}

                    {/* 5. Open Found Item */}
                    {item.type === 'FoundItem' && item.status === 'Open' && (
                      <Button
                        variant="daily"
                        size="sm"
                        onClick={() =>
                          handleStatusTransition(item, 'Resolved', currentPersonaId)
                        }
                        className="text-xs h-7 px-2.5"
                      >
                        Claim This Item
                      </Button>
                    )}

                    {/* 6. Completed / Resolved */}
                    {(item.status === 'Returned' || item.status === 'Resolved') && (
                      <span className="text-[11px] font-medium text-muted-foreground flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                        Done
                      </span>
                    )}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Post Item Modal */}
      <Modal
        isOpen={isPostModalOpen}
        onClose={() => setIsPostModalOpen(false)}
        title={mainView === 'borrow' ? 'Post to Borrow Board' : 'Report Lost & Found Item'}
        description="List an item to share with flatmates or report something missing."
        size="md"
      >
        <form onSubmit={handlePostItem} className="space-y-4">
          {/* Post Type Selector */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground">Post Intent</label>
            <div className="grid grid-cols-2 gap-2">
              {mainView === 'borrow' ? (
                <>
                  <button
                    type="button"
                    onClick={() => setPostType('LendingOffer')}
                    className={cn(
                      'p-2.5 rounded-xl border text-xs font-medium text-left transition-colors',
                      postType === 'LendingOffer'
                        ? 'border-emerald-500 bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 font-semibold'
                        : 'border-border bg-card hover:bg-muted text-muted-foreground'
                    )}
                  >
                    🤝 I Want to Lend / Offer
                  </button>
                  <button
                    type="button"
                    onClick={() => setPostType('BorrowRequest')}
                    className={cn(
                      'p-2.5 rounded-xl border text-xs font-medium text-left transition-colors',
                      postType === 'BorrowRequest'
                        ? 'border-emerald-500 bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 font-semibold'
                        : 'border-border bg-card hover:bg-muted text-muted-foreground'
                    )}
                  >
                    🙋 I Need to Borrow Something
                  </button>
                </>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={() => setPostType('LostItem')}
                    className={cn(
                      'p-2.5 rounded-xl border text-xs font-medium text-left transition-colors',
                      postType === 'LostItem'
                        ? 'border-rose-500 bg-rose-500/15 text-rose-600 dark:text-rose-400 font-semibold'
                        : 'border-border bg-card hover:bg-muted text-muted-foreground'
                    )}
                  >
                    🔍 I Lost an Item
                  </button>
                  <button
                    type="button"
                    onClick={() => setPostType('FoundItem')}
                    className={cn(
                      'p-2.5 rounded-xl border text-xs font-medium text-left transition-colors',
                      postType === 'FoundItem'
                        ? 'border-amber-500 bg-amber-500/15 text-amber-600 dark:text-amber-400 font-semibold'
                        : 'border-border bg-card hover:bg-muted text-muted-foreground'
                    )}
                  >
                    ✨ I Found an Item
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Title */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground">Item Name & Details</label>
            <input
              type="text"
              value={postTitle}
              onChange={(e) => setPostTitle(e.target.value)}
              placeholder="e.g. TI-84 Plus Graphing Calculator or Blue Umbrella"
              required
              className="w-full text-xs rounded-xl border border-border bg-background px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {/* Category & Location */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">Category</label>
              <select
                value={postCategory}
                onChange={(e) => setPostCategory(e.target.value as ItemCategory)}
                className="w-full text-xs rounded-xl border border-border bg-background px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                {CATEGORIES.map((c) => (
                  <option key={c.label} value={c.label}>
                    {c.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">Location / Room</label>
              <input
                type="text"
                value={postLocation}
                onChange={(e) => setPostLocation(e.target.value)}
                placeholder="e.g. Living Room TV Console or Room B"
                className="w-full text-xs rounded-xl border border-border bg-background px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          {/* Security Deposit (Only for Borrow) */}
          {mainView === 'borrow' && (
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">
                Refundable Deposit (₹, optional)
              </label>
              <input
                type="number"
                min={0}
                step={50}
                value={postDeposit}
                onChange={(e) => setPostDeposit(Number(e.target.value))}
                placeholder="0"
                className="w-full text-xs rounded-xl border border-border bg-background px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          )}

          {/* Notes */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground">Notes / Instructions</label>
            <textarea
              rows={2}
              value={postNotes}
              onChange={(e) => setPostNotes(e.target.value)}
              placeholder="e.g. Return by Friday evening, handle with care..."
              className="w-full text-xs rounded-xl border border-border bg-background px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-border">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsPostModalOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" variant="daily" size="sm">
              Publish Listing
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
