import React, { useState, useEffect } from 'react';
import API from '../api';

export default function ItemForm({ current, onSaved }) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  useEffect(() => {
    if (current) {
      setName(current.name);
      setDescription(current.description);
    }
  }, [current]);

  const handleSubmit = e => {
    e.preventDefault();
    const payload = { name, description };

    const request = current
      ? API.put(`items/${current.id}/`, payload)
      : API.post('items/', payload);

    request
      .then(() => {
        setName('');
        setDescription('');
        onSaved();
      })
      .catch(console.error);
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        placeholder="Name"
        value={name}
        onChange={e => setName(e.target.value)}
        required
      />
      <textarea
        placeholder="Description"
        value={description}
        onChange={e => setDescription(e.target.value)}
      />
      <button type="submit">
        {current ? 'Update' : 'Create'}
      </button>
    </form>
  );
}
