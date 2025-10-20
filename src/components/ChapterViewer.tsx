import React, { useState } from "react";
import { Chapter } from "../lib/types";
import { copyToClipboard } from "../lib/utils";

interface ChapterViewerProps {
  chapters: Chapter[];
  className?: string;
}

const ChapterViewer: React.FC<ChapterViewerProps> = ({
  chapters,
  className = "",
}) => {
  const [selectedChapter, setSelectedChapter] = useState<number>(0);
  const [copySuccess, setCopySuccess] = useState<boolean>(false);

  const handleCopyChapter = async () => {
    if (chapters[selectedChapter]) {
      const content = `# ${chapters[selectedChapter].title}\n\n${chapters[selectedChapter].content}`;
      const success = await copyToClipboard(content);
      if (success) {
        setCopySuccess(true);
        setTimeout(() => setCopySuccess(false), 2000);
      }
    }
  };

  if (!chapters || chapters.length === 0) {
    return (
      <div className={`text-center py-8 text-gray-500 ${className}`}>
        <p>Aucun chapitre disponible</p>
      </div>
    );
  }

  return (
    <div className={`bg-white border rounded-lg ${className}`}>
      {/* Navigation des chapitres */}
      <div className="border-b">
        <div className="flex overflow-x-auto">
          {chapters.map((chapter, index) => (
            <button
              key={index}
              onClick={() => setSelectedChapter(index)}
              className={`flex-shrink-0 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                selectedChapter === index
                  ? "border-blue-500 text-blue-600 bg-blue-50"
                  : "border-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-50"
              }`}
            >
              Chapitre {index + 1}
            </button>
          ))}
        </div>
      </div>

      {/* Contenu du chapitre */}
      <div className="p-6">
        <div className="flex justify-between items-start mb-4">
          <h2 className="text-2xl font-bold text-gray-900">
            {chapters[selectedChapter].title}
          </h2>
          <button
            onClick={handleCopyChapter}
            className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors"
          >
            {copySuccess ? "✓ Copié" : "📋 Copier"}
          </button>
        </div>

        {chapters[selectedChapter].description && (
          <p className="text-gray-600 italic mb-4">
            {chapters[selectedChapter].description}
          </p>
        )}

        <div className="prose max-w-none">
          <div className="whitespace-pre-wrap text-gray-800 leading-relaxed">
            {chapters[selectedChapter].content}
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="border-t p-4 flex justify-between">
        <button
          onClick={() => setSelectedChapter(Math.max(0, selectedChapter - 1))}
          disabled={selectedChapter === 0}
          className="px-4 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          ← Chapitre précédent
        </button>

        <span className="flex items-center text-sm text-gray-600">
          {selectedChapter + 1} / {chapters.length}
        </span>

        <button
          onClick={() =>
            setSelectedChapter(
              Math.min(chapters.length - 1, selectedChapter + 1)
            )
          }
          disabled={selectedChapter === chapters.length - 1}
          className="px-4 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Chapitre suivant →
        </button>
      </div>
    </div>
  );
};

export default ChapterViewer;
