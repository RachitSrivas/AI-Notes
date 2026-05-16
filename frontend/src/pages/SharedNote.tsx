import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { formatDistanceToNow } from 'date-fns';
import { FileText } from 'lucide-react';

export default function SharedNote() {
  const { id } = useParams();
  const [note, setNote] = useState<any>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    axios.get(`http://localhost:5000/shared/${id}`)
      .then(res => setNote(res.data))
      .catch(err => setError(err.response?.data?.error || 'Note not found'));
  }, [id]);

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center text-red-500 font-medium">
        {error}
      </div>
    );
  }

  if (!note) {
    return <div className="min-h-screen bg-gray-50 flex items-center justify-center text-gray-500">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6 md:p-12 font-sans">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center gap-2 text-blue-600 font-bold text-lg mb-8">
          <FileText size={24} /> Peblo Notes
        </div>
        
        <div className="bg-white p-8 md:p-12 rounded-2xl shadow-sm border border-gray-100">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">{note.title || 'Untitled Note'}</h1>
          <p className="text-sm text-gray-400 mb-10 pb-6 border-b">
            Last updated {formatDistanceToNow(new Date(note.updatedAt))} ago
          </p>
          <div className="whitespace-pre-wrap text-gray-700 text-lg leading-relaxed">
            {note.content}
          </div>
        </div>
      </div>
    </div>
  );
}