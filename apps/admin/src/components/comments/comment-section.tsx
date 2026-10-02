'use client';

import React, { useState, useEffect } from 'react';
import {
  MessageSquare,
  ThumbsUp,
  Reply,
  Pin,
  Send,
  Sparkles,
  CheckCircle2,
  Clock,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Smile,
  Code,
  Bold,
  Italic,
  Quote,
  Eye,
  Edit3,
  ShieldCheck,
  UserCheck,
} from 'lucide-react';
import { CommentItem } from '@headless/core';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

interface CommentSectionProps {
  contentEntryId: string;
  contentEntryTitle?: string;
  contentEntrySlug?: string;
  className?: string;
  theme?: 'dark' | 'light' | 'auto';
}

const EMOJI_LIST = ['👍', '❤️', '🔥', '🚀', '💡', '🎉', '👏', '🙌'];

export function CommentSection({
  contentEntryId,
  contentEntryTitle = 'Current Article',
  contentEntrySlug,
  className = '',
}: CommentSectionProps) {
  const [comments, setComments] = useState<CommentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState<'createdAt' | 'votesCount'>('createdAt');

  // Root composer state
  const [authorName, setAuthorName] = useState('');
  const [authorEmail, setAuthorEmail] = useState('');
  const [authorWebsite, setAuthorWebsite] = useState('');
  const [content, setContent] = useState('');
  const [isPreview, setIsPreview] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Active reply composer
  const [replyingToId, setReplyingToId] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState('');
  const [replySubmitting, setReplySubmitting] = useState(false);

  // Voted comments tracking
  const [votedMap, setVotedMap] = useState<Record<string, number>>({});

  // Collapsed threads tracking
  const [collapsedMap, setCollapsedMap] = useState<Record<string, boolean>>({});

  const fetchComments = async () => {
    try {
      setLoading(true);
      const res = await fetch(
        `/api/v1/comments?contentEntryId=${encodeURIComponent(
          contentEntryId
        )}&status=APPROVED&threaded=true&sortBy=${sortBy}&sortOrder=desc`
      );
      const data = await res.json();
      if (data.comments) {
        setComments(data.comments);
      }
    } catch (err) {
      console.error('[CommentSection] Fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComments();
  }, [contentEntryId, sortBy]);

  // Load saved guest details from localStorage if available
  useEffect(() => {
    try {
      const savedName = localStorage.getItem('headless_comment_name');
      const savedEmail = localStorage.getItem('headless_comment_email');
      const savedWebsite = localStorage.getItem('headless_comment_website');
      if (savedName) setAuthorName(savedName);
      if (savedEmail) setAuthorEmail(savedEmail);
      if (savedWebsite) setAuthorWebsite(savedWebsite);
    } catch {}
  }, []);

  const handleVote = async (commentId: string) => {
    const currentVote = votedMap[commentId] || 0;
    const delta = currentVote > 0 ? -1 : 1;

    // Optimistic UI update
    setVotedMap((prev) => ({ ...prev, [commentId]: currentVote > 0 ? 0 : 1 }));

    const updateVotesInTree = (items: CommentItem[]): CommentItem[] => {
      return items.map((item) => {
        if (item.id === commentId) {
          return { ...item, votesCount: (item.votesCount || 0) + delta };
        }
        if (item.replies && item.replies.length > 0) {
          return { ...item, replies: updateVotesInTree(item.replies) };
        }
        return item;
      });
    };

    setComments((prev) => updateVotesInTree(prev));

    try {
      await fetch(`/api/v1/comments/${commentId}/vote`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ delta }),
      });
    } catch (err) {
      console.error('[CommentSection] Vote error:', err);
    }
  };

  const handleInsertFormatting = (prefix: string, suffix: string = '') => {
    setContent((prev) => `${prev}${prefix}${suffix}`);
  };

  const handleInsertEmoji = (emoji: string) => {
    setContent((prev) => `${prev} ${emoji} `);
  };

  const handleSubmitRoot = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() || !authorName.trim() || !authorEmail.trim()) {
      setSubmitError('Please provide your name, email, and comment message.');
      return;
    }

    try {
      setSubmitting(true);
      setSubmitError(null);
      setSubmitSuccess(null);

      // Save to localStorage
      try {
        localStorage.setItem('headless_comment_name', authorName);
        localStorage.setItem('headless_comment_email', authorEmail);
        if (authorWebsite) localStorage.setItem('headless_comment_website', authorWebsite);
      } catch {}

      const res = await fetch('/api/v1/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contentEntryId,
          contentEntryTitle,
          contentEntrySlug,
          author: {
            name: authorName,
            email: authorEmail,
            website: authorWebsite || undefined,
            isGuest: true,
          },
          content,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to submit comment');
      }

      setContent('');
      setIsPreview(false);

      if (data.comment?.status === 'APPROVED') {
        setSubmitSuccess('Your comment has been published!');
        setComments((prev) => [data.comment, ...prev]);
      } else {
        setSubmitSuccess(
          'Thank you! Your comment has been submitted and is awaiting moderation.'
        );
      }
    } catch (err: any) {
      setSubmitError(err.message || 'An error occurred while posting your comment.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmitReply = async (parentId: string) => {
    if (!replyContent.trim() || !authorName.trim() || !authorEmail.trim()) {
      alert('Please fill in your name, email, and reply message.');
      return;
    }

    try {
      setReplySubmitting(true);
      const res = await fetch('/api/v1/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contentEntryId,
          contentEntryTitle,
          contentEntrySlug,
          parentId,
          author: {
            name: authorName,
            email: authorEmail,
            website: authorWebsite || undefined,
            isGuest: true,
          },
          content: replyContent,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to submit reply');

      setReplyContent('');
      setReplyingToId(null);

      if (data.comment?.status === 'APPROVED') {
        const addReplyToTree = (items: CommentItem[]): CommentItem[] => {
          return items.map((item) => {
            if (item.id === parentId) {
              return {
                ...item,
                replies: [...(item.replies || []), data.comment],
              };
            }
            if (item.replies && item.replies.length > 0) {
              return { ...item, replies: addReplyToTree(item.replies) };
            }
            return item;
          });
        };
        setComments((prev) => addReplyToTree(prev));
      } else {
        alert('Your reply has been submitted and is awaiting editorial moderation.');
      }
    } catch (err: any) {
      alert(err.message || 'Failed to submit reply');
    } finally {
      setReplySubmitting(false);
    }
  };

  const toggleCollapse = (id: string) => {
    setCollapsedMap((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  // Render a single comment item with recursive replies
  const renderComment = (item: CommentItem, depth = 0) => {
    const isVoted = (votedMap[item.id] || 0) > 0;
    const isCollapsed = collapsedMap[item.id] || false;
    const isStaff = item.author.role === 'admin' || item.author.role === 'editor';
    const isAuthor = item.author.role === 'author';

    return (
      <div
        key={item.id}
        className={`group relative text-[14px] transition-all ${
          depth > 0 ? 'mt-3.5 pl-3.5 sm:pl-6 border-l-2 border-slate-700/60' : 'mt-5'
        }`}
      >
        <div
          className={`p-4 rounded-xl border transition-all ${
            item.isPinned
              ? 'bg-amber-950/20 border-amber-500/40 shadow-xs shadow-amber-500/5'
              : 'bg-slate-900/70 hover:bg-slate-900/90 border-slate-800 hover:border-slate-700'
          }`}
        >
          {/* Header Row */}
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-2.5">
              {/* Avatar */}
              {item.author.avatarUrl ? (
                <img
                  src={item.author.avatarUrl}
                  alt={item.author.name}
                  className="w-8 h-8 rounded-full object-cover ring-1 ring-slate-700"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-linear-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-semibold text-xs shadow-xs">
                  {item.author.name.charAt(0).toUpperCase()}
                </div>
              )}

              {/* Name & Badges */}
              <div>
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="font-semibold text-slate-100 group-hover:text-blue-400 transition-colors">
                    {item.author.name}
                  </span>

                  {item.author.website && (
                    <a
                      href={item.author.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-slate-400 hover:text-slate-200 transition-colors"
                      title={item.author.website}
                    >
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}

                  {isStaff && (
                    <Badge className="bg-purple-900/60 text-purple-300 border-purple-700/60 text-[10px] px-1.5 py-0 flex items-center gap-0.5">
                      <ShieldCheck className="w-2.5 h-2.5" /> Staff
                    </Badge>
                  )}

                  {isAuthor && (
                    <Badge className="bg-emerald-900/60 text-emerald-300 border-emerald-700/60 text-[10px] px-1.5 py-0 flex items-center gap-0.5">
                      <UserCheck className="w-2.5 h-2.5" /> Author
                    </Badge>
                  )}

                  {item.isPinned && (
                    <Badge className="bg-amber-900/60 text-amber-300 border-amber-700/60 text-[10px] px-1.5 py-0 flex items-center gap-0.5">
                      <Pin className="w-2.5 h-2.5 fill-amber-300/30" /> Pinned
                    </Badge>
                  )}
                </div>

                <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5">
                  <Clock className="w-3 h-3" />
                  <span>{new Date(item.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                  {item.location && <span className="text-slate-400">• {item.location}</span>}
                </div>
              </div>
            </div>

            {/* Collapse Toggle */}
            {item.replies && item.replies.length > 0 && (
              <button
                onClick={() => toggleCollapse(item.id)}
                className="text-slate-400 hover:text-slate-200 p-1 text-xs flex items-center gap-1 transition-colors"
              >
                {isCollapsed ? (
                  <>
                    <ChevronDown className="w-3.5 h-3.5" />
                    <span>Expand ({item.replies.length})</span>
                  </>
                ) : (
                  <>
                    <ChevronUp className="w-3.5 h-3.5" />
                    <span>Collapse</span>
                  </>
                )}
              </button>
            )}
          </div>

          {/* Comment Body */}
          {!isCollapsed && (
            <>
              <div className="mt-3 text-slate-200 whitespace-pre-wrap leading-relaxed font-normal">
                {item.content}
              </div>

              {/* Action Toolbar */}
              <div className="mt-3.5 pt-2.5 border-t border-slate-800/80 flex items-center gap-4 text-xs">
                {/* Upvote button */}
                <button
                  onClick={() => handleVote(item.id)}
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md transition-all font-medium ${
                    isVoted
                      ? 'bg-blue-600/20 text-blue-400 border border-blue-500/40 shadow-xs'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                  }`}
                >
                  <ThumbsUp className={`w-3.5 h-3.5 ${isVoted ? 'fill-blue-400' : ''}`} />
                  <span>{item.votesCount || 0}</span>
                </button>

                {/* Reply button */}
                <button
                  onClick={() =>
                    setReplyingToId(replyingToId === item.id ? null : item.id)
                  }
                  className="flex items-center gap-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800 px-2.5 py-1 rounded-md transition-all"
                >
                  <Reply className="w-3.5 h-3.5" />
                  <span>Reply</span>
                </button>
              </div>

              {/* Inline Reply Composer */}
              {replyingToId === item.id && (
                <div className="mt-3 p-3.5 rounded-lg bg-slate-950/80 border border-slate-800 animate-in fade-in-50 duration-200">
                  <div className="text-xs font-semibold text-slate-300 mb-2 flex items-center gap-1.5">
                    <Reply className="w-3 h-3 text-blue-400" />
                    Replying to {item.author.name}
                  </div>
                  <Textarea
                    value={replyContent}
                    onChange={(e) => setReplyContent(e.target.value)}
                    placeholder={`Write your reply to ${item.author.name}...`}
                    rows={2}
                    className="bg-slate-900 border-slate-700 text-slate-100 text-xs resize-none mb-2 focus-visible:ring-blue-500"
                  />
                  <div className="flex justify-end gap-2">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setReplyingToId(null)}
                      className="text-xs text-slate-400 hover:text-slate-200 h-7"
                    >
                      Cancel
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => handleSubmitReply(item.id)}
                      disabled={replySubmitting || !replyContent.trim()}
                      className="text-xs bg-blue-600 hover:bg-blue-500 text-white h-7 flex items-center gap-1"
                    >
                      <Send className="w-3 h-3" />
                      {replySubmitting ? 'Posting...' : 'Reply'}
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Recursive Nested Replies */}
        {!isCollapsed && item.replies && item.replies.length > 0 && (
          <div className="space-y-2">
            {item.replies.map((reply) => renderComment(reply, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className={`w-full max-w-4xl mx-auto ${className}`}>
      {/* Module Title & Stats */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-6">
        <div className="flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-blue-400" />
          <h3 className="text-lg font-bold text-slate-100">Discussion</h3>
          <Badge className="bg-blue-950 text-blue-400 border-blue-800 ml-1">
            {comments.length}
          </Badge>
        </div>

        {/* Sorting selection */}
        <div className="flex items-center gap-2 text-xs">
          <span className="text-slate-400">Sort by:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="bg-slate-900 border border-slate-700 text-slate-200 text-xs rounded-md px-2.5 py-1 focus:ring-1 focus:ring-blue-500 outline-hidden"
          >
            <option value="createdAt">Newest First</option>
            <option value="votesCount">Most Upvoted</option>
          </select>
        </div>
      </div>

      {/* Main Comment Composer */}
      <form
        onSubmit={handleSubmitRoot}
        className="p-4 sm:p-5 rounded-xl bg-slate-900/80 border border-slate-800 shadow-lg mb-8"
      >
        <div className="text-sm font-semibold text-slate-200 mb-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>Leave a thought or feedback</span>
          </div>

          {/* Markdown preview toggle */}
          <div className="flex items-center gap-1 bg-slate-950 p-0.5 rounded-lg border border-slate-800">
            <button
              type="button"
              onClick={() => setIsPreview(false)}
              className={`px-2 py-0.5 rounded text-xs transition-colors flex items-center gap-1 ${
                !isPreview ? 'bg-slate-800 text-white font-medium' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Edit3 className="w-3 h-3" /> Write
            </button>
            <button
              type="button"
              onClick={() => setIsPreview(true)}
              className={`px-2 py-0.5 rounded text-xs transition-colors flex items-center gap-1 ${
                isPreview ? 'bg-slate-800 text-white font-medium' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Eye className="w-3 h-3" /> Preview
            </button>
          </div>
        </div>

        {/* Formatting Toolbar */}
        {!isPreview && (
          <div className="flex items-center gap-1.5 mb-2 pb-2 border-b border-slate-800/80 text-slate-400 text-xs overflow-x-auto">
            <button
              type="button"
              onClick={() => handleInsertFormatting('**', '**')}
              title="Bold"
              className="p-1 hover:text-slate-100 hover:bg-slate-800 rounded transition-colors"
            >
              <Bold className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => handleInsertFormatting('*', '*')}
              title="Italic"
              className="p-1 hover:text-slate-100 hover:bg-slate-800 rounded transition-colors"
            >
              <Italic className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => handleInsertFormatting('`', '`')}
              title="Inline Code"
              className="p-1 hover:text-slate-100 hover:bg-slate-800 rounded transition-colors"
            >
              <Code className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => handleInsertFormatting('> ')}
              title="Quote"
              className="p-1 hover:text-slate-100 hover:bg-slate-800 rounded transition-colors"
            >
              <Quote className="w-3.5 h-3.5" />
            </button>

            <span className="text-slate-700">|</span>

            {/* Quick Emoji Buttons */}
            {EMOJI_LIST.map((emoji) => (
              <button
                key={emoji}
                type="button"
                onClick={() => handleInsertEmoji(emoji)}
                className="hover:scale-125 px-1 transition-transform"
              >
                {emoji}
              </button>
            ))}
          </div>
        )}

        {/* Editor or Preview Pane */}
        {isPreview ? (
          <div className="min-h-[100px] p-3 rounded-lg bg-slate-950 border border-slate-800 text-sm text-slate-200 mb-3 whitespace-pre-wrap">
            {content.trim() ? content : <span className="text-slate-400 italic">Nothing to preview yet.</span>}
          </div>
        ) : (
          <Textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Share your feedback, ask questions, or contribute insights..."
            rows={3}
            className="bg-slate-950 border-slate-800 text-slate-100 text-sm resize-none mb-3 focus-visible:ring-blue-500"
          />
        )}

        {/* Guest credentials row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 mb-3">
          <div>
            <label className="text-xs text-slate-400 block mb-1">Your Name *</label>
            <Input
              value={authorName}
              onChange={(e) => setAuthorName(e.target.value)}
              placeholder="e.g. Alex Morgan"
              className="bg-slate-950 border-slate-800 text-xs h-8 focus-visible:ring-blue-500"
              required
            />
          </div>
          <div>
            <label className="text-xs text-slate-400 block mb-1">Email Address *</label>
            <Input
              type="email"
              value={authorEmail}
              onChange={(e) => setAuthorEmail(e.target.value)}
              placeholder="alex@example.com"
              className="bg-slate-950 border-slate-800 text-xs h-8 focus-visible:ring-blue-500"
              required
            />
          </div>
          <div>
            <label className="text-xs text-slate-400 block mb-1">Website (Optional)</label>
            <Input
              value={authorWebsite}
              onChange={(e) => setAuthorWebsite(e.target.value)}
              placeholder="https://mysite.com"
              className="bg-slate-950 border-slate-800 text-xs h-8 focus-visible:ring-blue-500"
            />
          </div>
        </div>

        {/* Feedback Messages */}
        {submitSuccess && (
          <div className="p-2.5 mb-3 rounded-lg bg-emerald-950/40 border border-emerald-500/30 text-emerald-400 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{submitSuccess}</span>
          </div>
        )}
        {submitError && (
          <div className="p-2.5 mb-3 rounded-lg bg-rose-950/40 border border-rose-500/30 text-rose-400 text-xs">
            {submitError}
          </div>
        )}

        {/* Submit Button */}
        <div className="flex items-center justify-between pt-1">
          <span className="text-[11px] text-slate-400">
            Markdown formatting and standard code blocks supported.
          </span>
          <Button
            type="submit"
            disabled={submitting || !content.trim() || !authorName.trim() || !authorEmail.trim()}
            className="bg-blue-600 hover:bg-blue-500 text-white text-xs h-8 px-4 flex items-center gap-1.5 shadow-md shadow-blue-600/20"
          >
            <Send className="w-3.5 h-3.5" />
            {submitting ? 'Submitting...' : 'Post Comment'}
          </Button>
        </div>
      </form>

      {/* Comments List */}
      {loading ? (
        <div className="space-y-4 py-8">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse bg-slate-900/60 p-4 rounded-xl border border-slate-800">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 rounded-full bg-slate-800" />
                <div className="h-4 w-32 bg-slate-800 rounded" />
              </div>
              <div className="h-3 w-3/4 bg-slate-800 rounded mb-1.5" />
              <div className="h-3 w-1/2 bg-slate-800 rounded" />
            </div>
          ))}
        </div>
      ) : comments.length === 0 ? (
        <div className="text-center py-12 px-4 rounded-xl bg-slate-900/30 border border-dashed border-slate-800">
          <MessageSquare className="w-10 h-10 text-slate-400 mx-auto mb-2" />
          <h4 className="text-base font-semibold text-slate-200">No comments yet</h4>
          <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
            Be the first to join the conversation and share your insights on this article!
          </p>
        </div>
      ) : (
        <div className="space-y-1">
          {comments.map((item) => renderComment(item))}
        </div>
      )}
    </div>
  );
}
