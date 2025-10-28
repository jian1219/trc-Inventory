import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import Navigation from '../components/Navigation';
import Footer from '../components/Footer';
import editIcon from '../icons/pen.png';

const About = () => {
  const [ingredients, setIngredients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [editingId, setEditingId] = useState(null);
  const [editData, setEditData] = useState({
    ingredients_name: '',
    description: '',
    supplier: '',
    price: '',
  });

  // ✅ Fetch ingredients
  useEffect(() => {
    const fetchIngredients = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('ingredients')
          .select('id, ingredients_name, description, supplier, price');

        if (error) throw error;
        setIngredients(data);
      } catch (err) {
        console.error('❌ Error fetching ingredients:', err.message);
        setError('Failed to load ingredients.');
      } finally {
        setLoading(false);
      }
    };

    fetchIngredients();
  }, []);

  // ✅ Add a new ingredient
  const handleAddIngredient = async () => {
    const newIngredient = {
      ingredients_name: 'New Ingredient',
      description: 'Write description here',
      supplier: 'Supplier Name',
      price: 0,
    };

    const { data, error } = await supabase
      .from('ingredients')
      .insert([newIngredient])
      .select();

    if (error) {
      console.error('❌ Error adding ingredient:', error.message);
      alert('Failed to add ingredient.');
    } else {
      setIngredients((prev) => [...prev, ...data]);
    }
  };

  // ✅ Click edit icon
  const handleEdit = (item) => {
    setEditingId(item.id);
    setEditData({ ...item });
  };

  // ✅ Handle form changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setEditData((prev) => ({ ...prev, [name]: value }));
  };

  // ✅ Save edited data to Supabase
  const handleSave = async (id) => {
    const { error } = await supabase
      .from('ingredients')
      .update({
        ingredients_name: editData.ingredients_name,
        description: editData.description,
        supplier: editData.supplier,
        price: editData.price,
      })
      .eq('id', id);

    if (error) {
      console.error('❌ Error updating ingredient:', error.message);
      alert('Failed to update ingredient.');
    } else {
      setIngredients((prev) =>
        prev.map((item) => (item.id === id ? { ...editData } : item))
      );
      setEditingId(null);
    }
  };

  return (
    <div>
      <Navigation />

      <div className="ingredients">
        <h1>Ingredients List</h1>

        <div className='addButton'>
          <button onClick={handleAddIngredient} className='button'>ADD</button>
        </div>

        <div className="head-table">
          <div>Ingredients Name</div>
          <div>Description</div>
          <div>Supplier</div>
          <div>Price</div>
        </div>

        {loading ? (
          <p>Loading...</p>
        ) : error ? (
          <p>{error}</p>
        ) : ingredients.length > 0 ? (
          ingredients.map((item) => (
            <div key={item.id} className="child-table">
              {editingId === item.id ? (
                <>
                  <input
                    type="text"
                    name="ingredients_name"
                    value={editData.ingredients_name}
                    onChange={handleChange}
                  />
                  <input
                    type="text"
                    name="description"
                    value={editData.description}
                    onChange={handleChange}
                  />
                  <input
                    type="text"
                    name="supplier"
                    value={editData.supplier}
                    onChange={handleChange}
                  />
                  <input
                    type="number"
                    name="price"
                    value={editData.price}
                    onChange={handleChange}
                  />
                  <button className='saveButton' onClick={() => handleSave(item.id)}>Save</button>
                </>
              ) : (
                <>
                  <div>{item.ingredients_name}</div>
                  <div>{item.description}</div>
                  <div>{item.supplier}</div>
                  <div>{item.price}</div>
                  <div
                    onClick={() => handleEdit(item)}
                    style={{ cursor: 'pointer' }}
                  >
                    <img src={editIcon} alt="edit" width="20px" />
                  </div>
                </>
              )}
            </div>
          ))
        ) : (
          <p>No ingredients found.</p>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default About;
