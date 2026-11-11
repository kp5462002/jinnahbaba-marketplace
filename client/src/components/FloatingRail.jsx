import { MessageSquare, Search, FileQuestion } from 'lucide-react';

export default function FloatingRail() {
  return (
    <div className="fixed right-4 bottom-24 z-40 flex flex-col gap-3">
      <button className="bg-white shadow-lg rounded-lg px-3 py-3 text-gray-600 hover:text-[#00A651] hover:shadow-xl transition flex flex-col items-center gap-1 border" title="Messenger">
        <MessageSquare size={20} />
        <span className="text-[10px] font-medium">Messenger</span>
      </button>
      <button className="bg-white shadow-lg rounded-lg px-3 py-3 text-gray-600 hover:text-[#00A651] hover:shadow-xl transition flex flex-col items-center gap-1 border" title="Lens">
        <Search size={20} />
        <span className="text-[10px] font-medium">Lens</span>
      </button>
      <button className="bg-white shadow-lg rounded-lg px-3 py-3 text-gray-600 hover:text-[#00A651] hover:shadow-xl transition flex flex-col items-center gap-1 border" title="Survey">
        <FileQuestion size={20} />
        <span className="text-[10px] font-medium">Survey</span>
      </button>
    </div>
  );
}
