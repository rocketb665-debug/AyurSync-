import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import Markdown from 'react-markdown';

interface StreamingMessageProps {
  text: string;
  isStreaming?: boolean;
  onComplete?: () => void;
}

export const StreamingMessage: React.FC<StreamingMessageProps> = ({ text = '', isStreaming = false, onComplete }) => {
  const [displayedLines, setDisplayedLines] = useState<string[]>([]);
  const lines = (text || '').split('\n');

  useEffect(() => {
    if (!text) {
      setDisplayedLines([]);
      if (onComplete) onComplete();
      return;
    }

    if (!isStreaming) {
      setDisplayedLines(lines);
      if (onComplete) onComplete();
      return;
    }

    setDisplayedLines([]); // Reset when streaming starts
    let currentLineIndex = 0;
    const interval = setInterval(() => {
      if (currentLineIndex < lines.length) {
        const nextLine = lines[currentLineIndex];
        if (nextLine !== undefined) {
          setDisplayedLines(prev => [...prev, nextLine]);
        }
        currentLineIndex++;
      } else {
        clearInterval(interval);
        if (onComplete) onComplete();
      }
    }, 800);

    return () => clearInterval(interval);
  }, [text, isStreaming]);

  return (
    <div className="space-y-8">
      <AnimatePresence mode="popLayout">
        {displayedLines.map((line, index) => (
          <motion.div
            key={`${index}-${(line || '').substring(0, 10)}`}
            initial={{ opacity: 0, y: 20, filter: 'blur(10px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="prose prose-sm max-w-none prose-headings:text-inherit prose-p:leading-relaxed prose-strong:text-inherit prose-ul:list-disc prose-ol:list-decimal prose-table:border-collapse prose-table:w-full prose-td:border prose-td:border-gray-200 prose-td:p-2 prose-th:bg-gray-50 prose-th:p-2 prose-th:text-left"
          >
            <Markdown
              components={{
                img: ({node, ...props}) => (
                  <img {...props} className="w-16 h-16 rounded-full shadow-sm object-cover mb-4" />
                ),
                p: ({node, children, ...props}) => {
                  const content = React.Children.toArray(children).join('');
                  
                  // Check for Video Tag [VIDEO:ID]
                  const videoMatch = content.match(/\[VIDEO:([a-zA-Z0-9_-]{11})\]/);
                  if (videoMatch) {
                    const videoId = videoMatch[1];
                    return (
                      <div className="my-8 aspect-video rounded-[32px] overflow-hidden shadow-2xl border border-gray-100 bg-black group relative">
                        <iframe 
                          className="w-full h-full"
                          src={`https://www.youtube.com/embed/${videoId}?modestbranding=1&rel=0&showinfo=0&controls=1`}
                          title="AyurVault Video"
                          frameBorder="0"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                        ></iframe>
                      </div>
                    );
                  }

                  if (content.includes('AyurSync is an AI and provides educational insights.')) {
                    return <p {...props} className="text-[#A0A0A0] opacity-80 text-xs mt-8">{children}</p>;
                  }
                  return <p {...props}>{children}</p>;
                }
              }}
            >
              {line || ''}
            </Markdown>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};
