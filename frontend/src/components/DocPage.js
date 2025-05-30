// src/components/DocPage.js
import React, { useEffect, useState } from 'react';
import API from '../api';

export default function DocPage() {
  const [blocks, setBlocks] = useState([]);

  useEffect(() => {
    API.get('google-doc/')
      .then(res => setBlocks(res.data))
      .catch(console.error);
  }, []);

  const styleMap = {
    h1: 'text-3xl font-bold mt-6 mb-4',
    h2: 'text-2xl font-semibold mt-5 mb-3',
    h3: 'text-xl font-medium mt-4 mb-2',
    p:  'text-base mb-4'
  };

  return (
    <div className="container mx-auto p-6 bg-white rounded-lg shadow">
      {blocks.map((block, idx) => {
        const Tag = block.type;
        const cls = styleMap[block.type] || '';
        return <Tag key={idx} className={cls}>{block.text}</Tag>;
      })}
    </div>
  );
}
