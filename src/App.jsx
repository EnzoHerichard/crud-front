/* eslint-disable react/prop-types */
import React, { useState, useEffect, useCallback, useMemo } from "react";


// eslint-disable-next-line react/display-name, react/prop-types
const ListComponent = React.memo(({ items, categories, deleteItem, startEditItem }) => {
  const getCategoryName = (categoryId) => {
    const category = categories.find(cat => cat.id === categoryId);
    return category ? category.name : "Unknown";
  };

  return (
    <>
      <ul>
        <h1 style={{ color: "white" }}>Items</h1>
        {items.map((item) => (
          <li key={item.id} style={{ listStyle: "none", marginBottom: "10px" }}>
            <h2 style={{ color: "white" }}>{item.title}</h2>
            <p style={{ color: "white" }}>{item.description}</p>
            <p style={{ color: "white" }}>Price: ${item.price.toFixed(2)}</p>
            <p style={{ color: "white" }}>Category: {getCategoryName(item.category_id)}</p>
            <button
              onClick={() => deleteItem(item.id)}
              style={{ padding: "5px", borderRadius: "4px", border: "none", backgroundColor: "#FF0000", color: "white", cursor: "pointer" }}>
              Delete
            </button>
            <button
              onClick={() => startEditItem(item)}
              style={{ padding: "5px", borderRadius: "4px", border: "none", backgroundColor: "#007BFF", color: "white", cursor: "pointer", marginLeft: "10px" }}>
              Edit
            </button>
          </li>
        ))}
      </ul>
    </>
  );
});

const EditItemForm = ({ item, categories, updateItem, cancelEdit }) => {
  const [title, setTitle] = useState(item.title);
  const [description, setDescription] = useState(item.description);
  const [price, setPrice] = useState(item.price);
  const [categoryId, setCategoryId] = useState(item.category_id);

  const handleSubmit = (e) => {
    e.preventDefault();
    const updatedItem = {
      ...item,
      title,
      description,
      price: parseFloat(price),
      category_id: parseInt(categoryId, 10),
    };

    updateItem(updatedItem);
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "10px", marginTop: "20px" }}>
      <h1 style={{ color: "white" }}>Edit Item</h1>
      <input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Title"
        required
        style={{ padding: "10px", borderRadius: "4px", border: "1px solid #ccc" }}
      />
      <textarea
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="Description"
        required
        style={{ padding: "10px", borderRadius: "4px", border: "1px solid #ccc", resize: "vertical" }}
      />
      <input
        type="number"
        value={price}
        onChange={(e) => setPrice(e.target.value)}
        placeholder="Price"
        step="0.01"
        required
        style={{ padding: "10px", borderRadius: "4px", border: "1px solid #ccc" }}
      />
      <select
        value={categoryId}
        onChange={(e) => setCategoryId(e.target.value)}
        required
        style={{ padding: "10px", borderRadius: "4px", border: "1px solid #ccc" }}
      >
        <option value="">Select a category</option>
        {categories.map((cat) => (
          <option key={cat.id} value={cat.id}>
            {cat.name}
          </option>
        ))}
      </select>
      <button type="submit" style={{ padding: "10px", borderRadius: "4px", border: "none", backgroundColor: "#007BFF", color: "white", cursor: "pointer" }}>
        Update Item
      </button>
      <button type="button" onClick={cancelEdit} style={{ padding: "10px", borderRadius: "4px", border: "none", backgroundColor: "#6c757d", color: "white", cursor: "pointer" }}>
        Cancel
      </button>
    </form>
  );
};


const CrudApp = () => {
  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [error, setError] = useState(null);
  const [editingItem, setEditingItem] = useState(null);

  useEffect(() => {
    fetch(`http://localhost:8000/items`)
      .then((response) => {
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        return response.json();
      })
      .then((data) => setItems(data))
      .catch((error) => setError(error));
  }, []);

  useEffect(() => {
    fetch(`http://localhost:8000/categories`)
      .then((response) => response.json())
      .then((data) => setCategories(data))
      .catch((error) => console.error("Error fetching categories:", error));
  }, []);

  const addItem = useCallback((newItem) => {
    setItems((prevItems) => [...prevItems, newItem]);
  }, []);

  const deleteItem = useCallback((id) => {
    setItems((prevItems) => prevItems.filter(item => item.id !== id));
    fetch(`http://localhost:8000/items/${id}`, {
      method: "DELETE",
    });
  }, []);

  const startEditItem = useCallback((item) => {
    setEditingItem(item);
  }, []);

  const updateItem = useCallback((updatedItem) => {
    setItems((prevItems) => prevItems.map(item => item.id === updatedItem.id ? updatedItem : item));
    fetch(`http://localhost:8000/items/${updatedItem.id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(updatedItem),
    });
    setEditingItem(null);
  }, []);

  const cancelEdit = useCallback(() => {
    setEditingItem(null);
  }, []);

  const memoizedItems = useMemo(() => items, [items]);
  const memoizedCategories = useMemo(() => categories, [categories]);

  return (
    <div style={{ padding: "20px", maxWidth: "800px", margin: "0 auto" }}>
      <h1>CRUD App</h1>
      {error && <div style={{ color: "red" }}>Error: {error.message}</div>}
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <ListComponent items={memoizedItems} categories={memoizedCategories} deleteItem={deleteItem} startEditItem={startEditItem} />
        {editingItem ? (
          <EditItemForm item={editingItem} categories={memoizedCategories} updateItem={updateItem} cancelEdit={cancelEdit} />
        ) : (
          <AddItemForm addItem={addItem} categories={memoizedCategories} />
        )}
      </div>
    </div>
  );
};



const AddItemForm = ({ addItem, categories }) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [categoryId, setCategoryId] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    const newItem = {
      id: Date.now(),
      title,
      description,
      price: parseFloat(price),
      category_id: parseInt(categoryId, 10),
    };

    addItem(newItem);

    fetch(`http://localhost:8000/items`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(newItem),
    });

    setTitle("");
    setDescription("");
    setPrice("");
    setCategoryId("");
  };

  return (
    <>
      <form
        onSubmit={handleSubmit}
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "10px",
          marginTop: "20px",
        }}
      >
        <h1 style={{ color: "white" }}>Add Item</h1>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Title"
          required
          style={{
            padding: "10px",
            borderRadius: "4px",
            border: "1px solid #ccc",
          }}
        />
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Description"
          required
          style={{
            padding: "10px",
            borderRadius: "4px",
            border: "1px solid #ccc",
            resize: "vertical",
          }}
        />
        <input
          type="number"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          placeholder="Price"
          step="0.01"
          required
          style={{
            padding: "10px",
            borderRadius: "4px",
            border: "1px solid #ccc",
          }}
        />
        <select
          value={categoryId}
          onChange={(e) => setCategoryId(e.target.value)}
          required
          style={{
            padding: "10px",
            borderRadius: "4px",
            border: "1px solid #ccc",
          }}
        >
          <option value="">Select a category</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.name}
            </option>
          ))}
        </select>
        <button
          type="submit"
          style={{
            padding: "10px",
            borderRadius: "4px",
            border: "none",
            backgroundColor: "#007BFF",
            color: "white",
            cursor: "pointer",
          }}
        >
          Add Item
        </button>
      </form>
    </>
  );
};

export default CrudApp;
