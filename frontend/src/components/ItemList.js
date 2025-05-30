import React, { useEffect, useState } from 'react';
import API from '../api';

export default function ItemList({ onEdit }) {
  const [items, setItems] = useState([]);

  useEffect(() => {
    API.get('items/')
      .then(res => setItems(res.data))
      .catch(console.error);
  }, []);

  const handleDelete = id => {
    API.delete(`items/${id}/`)
      .then(() => setItems(items.filter(item => item.id !== id)))
      .catch(console.error);
  };

  return (
    <ul>
      {items.map(item => (
        <li key={item.id}>
          <strong>{item.name}</strong>: {item.description}
          <button onClick={() => onEdit(item)}>Edit</button>
          <button onClick={() => handleDelete(item.id)}>Delete</button>
        </li>
      ))}
    </ul>
  );
}
