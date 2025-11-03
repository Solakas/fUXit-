import React from 'react';

interface MarkdownRendererProps {
  content: string;
}

const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content }) => {
  const renderLine = (line: string, index: number) => {
    // Bold text: **text**
    line = line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    
    // Custom tags for coloring feedback
    line = line.replace(/<good>(.*?)<\/good>/g, '<span class="text-green-400">$1</span>');

    // Headings: #, ##
    if (line.startsWith('## ')) {
      return <h2 key={index} className="text-2xl font-bold mt-6 mb-3 text-indigo-300" dangerouslySetInnerHTML={{ __html: line.substring(3) }} />;
    }
    if (line.startsWith('# ')) {
      return <h1 key={index} className="text-3xl font-bold mt-8 mb-4 text-indigo-200" dangerouslySetInnerHTML={{ __html: line.substring(2) }} />;
    }
     if (line.match(/^\d+\.\s/)) { // Numbered list
       return <li key={index} className="ml-5 list-decimal" dangerouslySetInnerHTML={{ __html: line.replace(/^\d+\.\s/, '') }} />;
    }
    if (line.startsWith('* ') || line.startsWith('- ')) { // Bulleted list
       return <li key={index} className="ml-5 list-disc" dangerouslySetInnerHTML={{ __html: line.substring(2) }} />;
    }

    return <p key={index} className="mb-2" dangerouslySetInnerHTML={{ __html: line }} />;
  };

  const lines = content.split('\n');
  const elements: React.ReactElement[] = [];
  let listItems: string[] = [];
  let listType: 'ol' | 'ul' | null = null;

  lines.forEach((line, index) => {
    const isOl = line.match(/^\d+\.\s/);
    const isUl = line.startsWith('* ') || line.startsWith('- ');

    if ((isOl && listType !== 'ol') || (isUl && listType !== 'ul') || (!isUl && !isOl && listType)) {
        if(listType === 'ol') {
            elements.push(<ol key={`list-${index}-ol`} className="space-y-2 mb-4">{listItems.map((item, i) => renderLine(item, i))}</ol>);
        } else if (listType === 'ul') {
            elements.push(<ul key={`list-${index}-ul`} className="space-y-2 mb-4">{listItems.map((item, i) => renderLine(item, i))}</ul >);
        }
        listItems = [];
        listType = null;
    }

    if(isOl) {
        listType = 'ol';
        listItems.push(line);
    } else if (isUl) {
        listType = 'ul';
        listItems.push(line);
    } else {
        elements.push(renderLine(line, index));
    }
  });

  // Render any remaining list items
  if (listItems.length > 0) {
     if(listType === 'ol') {
        elements.push(<ol key="last-list-ol" className="space-y-2 mb-4">{listItems.map((item, i) => renderLine(item, i))}</ol>);
    } else if (listType === 'ul') {
        elements.push(<ul key="last-list-ul" className="space-y-2 mb-4">{listItems.map((item, i) => renderLine(item, i))}</ul >);
    }
  }

  return <div className="prose prose-invert text-gray-300">{elements}</div>;
};

export default MarkdownRenderer;
