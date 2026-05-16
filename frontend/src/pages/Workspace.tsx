import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { Plus, Search, FileText, Sparkles, Share2, Archive } from 'lucide-react';
import api from '../api/axios';

interface Note {
  id: string;
  title: string;
  content: string;
  tags: string[];
  isArchived: boolean;
  isPublic: boolean;
  updatedAt: string;
}

export default function Workspace() {
  const navigate = useNavigate();
  const [notes, setNotes] = useState<Note[]>([]);
  const [activeNoteId, setActiveNoteId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isGeneratingAi, setIsGeneratingAi] = useState(false);
  const [aiInsights, setAiInsights] = useState<{ summary: string, action_items: string[], suggested_title: string } | null>(null);
  const [showAiModal, setShowAiModal] = useState(false);
  const [showDashboard, setShowDashboard] = useState(false);
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    fetchNotes();
  }, []);

  const fetchNotes = async () => {
    try {
      const res = await api.get('/notes');
      setNotes(res.data);
    } catch (err) {
      console.error('Failed to fetch notes', err);
    }
  };

  const fetchStats = async () => {
    try {
      const res = await api.get('/notes/stats');
      setStats(res.data);
    } catch (err) {
      console.error('Failed to fetch stats', err);
    }
  };

  const createNote = async () => {
    try {
      const res = await api.post('/notes', { title: '', content: '', tags: [] });
      setNotes([res.data, ...notes]);
      setActiveNoteId(res.data.id);
      setShowDashboard(false);
    } catch (err) {
      console.error('Failed to create note', err);
    }
  };

  const handleNoteChange = (field: keyof Note, value: any) => {
    setNotes((prevNotes) =>
      prevNotes.map((note) =>
        note.id === activeNoteId ? { ...note, [field]: value } : note
      )
    );
  };

  useEffect(() => {
    if (!activeNoteId) return;

    const activeNote = notes.find((n) => n.id === activeNoteId);
    if (!activeNote) return;

    const saveTimer = setTimeout(async () => {
      setIsSaving(true);
      try {
        await api.patch(`/notes/${activeNoteId}`, {
          title: activeNote.title,
          content: activeNote.content,
          tags: activeNote.tags,
        });
      } catch (err) {
        console.error('Auto-save failed', err);
      } finally {
        setIsSaving(false);
      }
    }, 1000); 

    return () => clearTimeout(saveTimer);
  }, [notes.find((n) => n.id === activeNoteId)?.title, notes.find((n) => n.id === activeNoteId)?.content, notes.find((n) => n.id === activeNoteId)?.tags]);

  const handleLogout = () => {
    localStorage.removeItem('peblo_token');
    localStorage.removeItem('peblo_user');
    navigate('/auth');
  };

  const handleShare = async () => {
    if (!activeNoteId) return;
    
    try {
      await api.patch(`/notes/${activeNoteId}`, { isPublic: true });
      
      handleNoteChange('isPublic', true);
      
      const shareLink = `${window.location.origin}/shared/${activeNoteId}`;
      await navigator.clipboard.writeText(shareLink);
      
      alert('Public link copied to clipboard!');
    } catch (err) {
      console.error('Failed to share note', err);
      alert('Failed to share note');
    }
  };

  const generateAiInsights = async () => {
    if (!activeNoteId) return;
    setIsGeneratingAi(true);
    setAiInsights(null); 
    setShowAiModal(true); 
    
    try {
      const res = await api.post(`/notes/${activeNoteId}/generate-summary`);
      setAiInsights(res.data);
    } catch (err: any) {
      console.error('AI Error', err);
      alert(err.response?.data?.error || 'Failed to generate insights.');
      setShowAiModal(false);
    } finally {
      setIsGeneratingAi(false);
    }
  };

  
  const filteredNotes = notes.filter((n) => 
    n.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    n.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const activeNote = notes.find((n) => n.id === activeNoteId);

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden text-gray-900 font-sans">
      
      {/* SIDEBAR */}
      <div className="w-80 bg-white border-r flex flex-col">
        <div className="p-4 border-b flex items-center justify-between">
          <h1 className="text-xl font-bold tracking-tight">Peblo Notes</h1>
          <button onClick={handleLogout} className="text-xs text-gray-500 hover:text-red-500">Logout</button>
        </div>
        
        <div className="p-4 border-b space-y-3">
          <div className="flex gap-2">
            <button 
              onClick={createNote}
              className="flex-1 flex items-center justify-center gap-2 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition font-medium text-sm"
            >
              <Plus size={16} /> New Note
            </button>
            <button 
              onClick={() => { setShowDashboard(true); fetchStats(); setActiveNoteId(null); }}
              className={`px-4 py-2 rounded-lg transition font-medium text-sm border ${showDashboard ? 'bg-gray-800 text-white border-gray-800' : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'}`}
            >
              Insights
            </button>
          </div>
          
          <div className="relative">
            <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
            <input 
              type="text" 
              placeholder="Search notes..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-100 border-transparent rounded-lg focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none text-sm"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {filteredNotes.map((note) => (
            <div 
              key={note.id}
              onClick={() => { setActiveNoteId(note.id); setShowDashboard(false); }}
              className={`p-4 border-b cursor-pointer transition ${activeNoteId === note.id ? 'bg-blue-50 border-l-4 border-l-blue-600' : 'hover:bg-gray-50 border-l-4 border-l-transparent'}`}
            >
              <h3 className="font-semibold truncate text-gray-800">
                {note.title || 'Untitled Note'}
              </h3>
              <p className="text-sm text-gray-500 truncate mt-1">
                {note.content || 'No content...'}
              </p>
              <span className="text-xs text-gray-400 mt-2 block">
                {formatDistanceToNow(new Date(note.updatedAt), { addSuffix: true })}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* MAIN AREA */}
      <div className="flex-1 flex flex-col bg-white overflow-hidden">
        {showDashboard ? (
          <div className="flex-1 overflow-y-auto p-8 bg-gray-50/50">
            <h2 className="text-3xl font-bold text-gray-900 mb-8">Productivity Insights</h2>
            {stats ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
                  <p className="text-gray-500 text-sm font-medium mb-1">Total Notes</p>
                  <p className="text-4xl font-bold text-blue-600">{stats.totalNotes}</p>
                </div>
                <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
                  <p className="text-gray-500 text-sm font-medium mb-1">Recently Edited (7 days)</p>
                  <p className="text-4xl font-bold text-emerald-600">{stats.recentlyEdited}</p>
                </div>
                <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
                  <p className="text-gray-500 text-sm font-medium mb-1">Weekly Activity</p>
                  <p className="text-2xl font-bold text-purple-600 mt-2">{stats.weeklyActivity}</p>
                </div>
                <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm md:col-span-2">
                  <p className="text-gray-500 text-sm font-medium mb-4">Most Used Tags</p>
                  <div className="flex flex-wrap gap-2">
                    {stats.mostUsedTags.length > 0 ? stats.mostUsedTags.map((t: any) => (
                      <span key={t.tag} className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm font-medium">
                        #{t.tag} <span className="text-gray-400 ml-1">({t.count})</span>
                      </span>
                    )) : <p className="text-gray-400 text-sm">No tags used yet.</p>}
                  </div>
                </div>
                <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
                  <p className="text-gray-500 text-sm font-medium mb-1">AI Interactions</p>
                  <p className="text-4xl font-bold text-orange-500">{stats.aiUsage}</p>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center py-20 text-gray-500">
                Loading insights...
              </div>
            )}
          </div>
        ) : activeNote ? (
          <>
            {/* Editor Top Bar */}
            <div className="h-14 border-b flex items-center justify-between px-6 bg-gray-50/50">
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <FileText size={16} />
                <span>{isSaving ? 'Saving...' : 'All changes saved'}</span>
              </div>
              <div className="flex items-center gap-3">
                <button 
                  onClick={generateAiInsights}
                  disabled={isGeneratingAi}
                  className="flex items-center gap-1.5 text-sm font-medium text-purple-600 hover:text-purple-700 bg-purple-100 px-3 py-1.5 rounded-md transition disabled:opacity-50"
                >
                  <Sparkles size={16} /> {isGeneratingAi ? 'Thinking...' : 'AI Summary'}
                </button>
                <button 
                  onClick={handleShare}
                  className={`flex items-center gap-1.5 text-sm font-medium px-3 py-1.5 rounded-md transition ${activeNote?.isPublic ? 'text-blue-600 bg-blue-50 hover:bg-blue-100' : 'text-gray-500 hover:text-gray-800 hover:bg-gray-100'}`}
                  title="Share Publicly"
                >
                  <Share2 size={16} /> {activeNote?.isPublic ? 'Shared' : 'Share'}
                </button>
                <button className="text-gray-400 hover:text-red-600 transition" title="Archive"><Archive size={18} /></button>
              </div>
            </div>

            {/* Editing Canvas */}
            <div className="flex-1 overflow-y-auto p-8 max-w-4xl mx-auto w-full">
              <input 
                type="text"
                placeholder="Note Title"
                value={activeNote.title}
                onChange={(e) => handleNoteChange('title', e.target.value)}
                className="w-full text-4xl font-bold text-gray-900 placeholder-gray-300 border-none outline-none bg-transparent mb-4"
              />
              <input 
                type="text" 
                placeholder="Add tags separated by commas (e.g. work, meeting)"
                value={activeNote.tags ? activeNote.tags.join(', ') : ''}
                onChange={(e) => {
                  const newTags = e.target.value.split(',').map(t => t.trim()).filter(Boolean);
                  handleNoteChange('tags', newTags);
                }}
                className="w-full text-sm text-blue-600 placeholder-gray-400 border-none outline-none bg-transparent mb-8"
              />
              <textarea 
                placeholder="Start typing your note here..."
                value={activeNote.content}
                onChange={(e) => handleNoteChange('content', e.target.value)}
                className="w-full h-full min-h-[50vh] text-lg text-gray-700 placeholder-gray-300 border-none outline-none bg-transparent resize-none leading-relaxed"
              />
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-gray-400">
            <FileText size={48} className="mb-4 text-gray-300" />
            <p className="text-lg font-medium text-gray-500">Select a note or view Insights</p>
          </div>
        )}
      </div>

      {/* AI INSIGHTS MODAL */}
      {showAiModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col">
            <div className="p-4 border-b bg-purple-50 flex justify-between items-center">
              <h3 className="font-bold text-purple-800 flex items-center gap-2">
                <Sparkles size={18} /> AI Workspace Insights
              </h3>
              <button onClick={() => setShowAiModal(false)} className="text-gray-500 hover:text-gray-800">&times;</button>
            </div>
            
            <div className="p-6 space-y-6">
              {isGeneratingAi ? (
                <div className="flex flex-col items-center py-8 text-gray-500">
                  <Sparkles size={32} className="animate-pulse text-purple-400 mb-3" />
                  <p>Analyzing your notes...</p>
                </div>
              ) : aiInsights ? (
                <>
                  <div>
                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Suggested Title</h4>
                    <p className="text-gray-800 font-medium bg-gray-50 p-3 rounded-lg border border-gray-100">{aiInsights.suggested_title}</p>
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Executive Summary</h4>
                    <p className="text-gray-700 leading-relaxed text-sm">{aiInsights.summary}</p>
                  </div>
                  {aiInsights.action_items && aiInsights.action_items.length > 0 && (
                    <div>
                      <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Action Items</h4>
                      <ul className="space-y-2">
                        {aiInsights.action_items.map((item, idx) => (
                          <li key={idx} className="flex gap-2 text-sm text-gray-700 items-start">
                            <span className="text-purple-500 mt-0.5">•</span> {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  {/*  A button to quickly apply the suggested title to the note */}
                  <button 
                    onClick={() => {
                      handleNoteChange('title', aiInsights.suggested_title);
                      setShowAiModal(false);
                    }}
                    className="w-full py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition font-medium text-sm mt-4"
                  >
                    Apply Suggested Title
                  </button>
                </>
              ) : null}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}