import React, { useEffect, useState } from 'react'
import Navigation from '../components/Navigation'
import Footer from '../components/Footer'
import { supabase } from '../lib/supabaseClient'
import Edit_icon from '../icons/pen.png'

// 🩵 Helper function to format date like "October 25, 2025"
const formatDate = (dateString) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

const Inventory = () => {
  const [showDiv, setShowDiv] = useState(false)
  const [items, setItems] = useState([])
  const [list, setList] = useState([])
  const [selectedTableId, setSelectedTableId] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedItem, setSelectedItem] = useState(null)
  const [editingData, setEditingData] = useState({})

  // ✅ Fetch list_inventory (parent table)
  useEffect(() => {
    const fetchListInventory = async () => {
      try {
        setLoading(true)
        const { data, error } = await supabase
          .from('list_inventory')
          .select('id, date, table_id')
          .order('date', { ascending: false }) // latest first

        if (error) throw error
        setList(data)
        console.log('✅ Fetched list_inventory:', data)
      } catch (err) {
        console.error('❌ Error:', err)
        setError('Failed to load list inventory.')
      } finally {
        setLoading(false)
      }
    }

    fetchListInventory()
  }, [])

  // ✅ Fetch inventory (child table) based on selected table_id
  const fetchInventoryByTableId = async (tableId) => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('inventory')
        .select('id, item_name, beggining_stock, qty_used, ending_stock, table_id')
        .eq('table_id', tableId)

      if (error) throw error
      setItems(data)
      setSelectedTableId(tableId)
      console.log('📦 Inventory for table_id', tableId, ':', data)
    } catch (err) {
      console.error('Error fetching inventory:', err)
      setError('Failed to load inventory.')
    } finally {
      setLoading(false)
    }
  }

  // ✅ Add new inventory list — auto fill from ingredients table
  const handleAddInventoryList = async () => {
    const newTableId = crypto.randomUUID()
    const currentDate = new Date().toISOString().split('T')[0] // e.g. "2025-10-26"

    // 🛑 Check if there is already an entry for today's date
    const alreadyExists = list.some((entry) => entry.date === currentDate)

    if (alreadyExists) {
      alert('⚠️ You have already submitted inventory for this day.')
      return
    }

    // 🆕 Insert new list
    const { data: listData, error: listError } = await supabase
      .from('list_inventory')
      .insert([{ date: currentDate, table_id: newTableId }])
      .select()

    if (listError) {
      console.error('Error adding inventory list:', listError)
      alert('❌ Failed to add new inventory list.')
      return
    }

    // ✅ Fetch all ingredients
    const { data: ingredients, error: ingredientsError } = await supabase
      .from('ingredients')
      .select('ingredients_name')

    if (ingredientsError) {
      console.error('Error fetching ingredients:', ingredientsError)
      alert('❌ Failed to fetch ingredients.')
      return
    }

    if (ingredients.length === 0) {
      alert('⚠️ No ingredients found to add.')
      return
    }

    // 🧾 Prepare inventory rows
    const newInventoryRows = ingredients.map((ingredient) => ({
      table_id: newTableId,
      item_name: ingredient.ingredients_name,
      beggining_stock: 0,
      qty_used: 0,
      ending_stock: 0,
    }))

    // 🆕 Insert all ingredients into inventory table
    const { error: inventoryError } = await supabase
      .from('inventory')
      .insert(newInventoryRows)

    if (inventoryError) {
      console.error('Error inserting ingredients into inventory:', inventoryError)
      alert('❌ Failed to add ingredients to inventory.')
      return
    }

    // ✅ Update local list and open new inventory
    setList((prev) => [...listData, ...prev])
    await fetchInventoryByTableId(newTableId)
    setShowDiv(false)
    alert('✅ New inventory list added with all ingredients!')
  }

  // ✅ Add single item manually
  const handleAddItem = async () => {
    if (!selectedTableId) {
      alert('⚠️ Please select a list first!')
      return
    }

    const newItem = {
      table_id: selectedTableId,
      item_name: 'New Item',
      beggining_stock: 0,
      qty_used: 0,
      ending_stock: 0,
    }

    const { data, error } = await supabase.from('inventory').insert([newItem]).select()

    if (error) {
      console.error('Error adding item:', error)
      alert('❌ Failed to add item.')
      return
    }

    setItems((prev) => [...prev, ...data])
    alert('✅ New item added!')
  }

  // ✅ Handle edit click
  const handleEdit = (item) => {
    setSelectedItem(item.id)
    setEditingData({ ...item })
  }

  // ✅ Handle input changes while editing
  const handleChange = (e) => {
    const { name, value } = e.target
    setEditingData((prev) => ({ ...prev, [name]: value }))
  }

  // ✅ Save edited data
  const handleSave = async (id) => {
    const { error } = await supabase
      .from('inventory')
      .update({
        item_name: editingData.item_name,
        beggining_stock: editingData.beggining_stock,
        qty_used: editingData.qty_used,
        ending_stock: editingData.ending_stock,
      })
      .eq('id', id)

    if (error) {
      console.error('Error updating item:', error)
      alert('❌ Failed to update item.')
    } else {
      setItems((prev) =>
        prev.map((item) => (item.id === id ? { ...item, ...editingData } : item))
      )
      setSelectedItem(null)
      alert('✅ Item updated successfully!')
    }
  }

  const handleToggle = () => setShowDiv(!showDiv)

  if (loading) return <p>Loading...</p>
  if (error) return <p>{error}</p>

  return (
    <div>
      <Navigation />
      <div className="inventory_container">
        <h1>INVENTORY</h1>

        {/* 🔹 Header controls */}
        <div className="line1">
          <h2>
            Date:{' '}
            {selectedTableId
              ? formatDate(
                  list.find((entry) => entry.table_id === selectedTableId)?.date
                ) || 'No date found'
              : 'No list selected'}
          </h2>
          <div>
            <button onClick={handleToggle}>
              {showDiv ? 'Hide List' : 'Show List'}
            </button>
          </div>
        </div>

        {/* 🔹 Add item */}
        <div className="line2">
          <button onClick={handleAddItem}>ADD ITEM</button>
        </div>

        {/* 🔹 Table header */}
        <div className="table">
          <div className="head-columns">
            <div>Item name</div>
            <div>Start</div>
            <div>Used</div>
            <div>End</div>
            <div>Action</div>
          </div>
        </div>

        {/* 🔹 Data rows */}
        <div className="data-table">
          {items.length > 0 ? (
            items.map((item) => (
              <div className="data-columns" key={item.id}>
                {selectedItem === item.id ? (
                  <>
                    <input
                      type="text"
                      name="item_name"
                      value={editingData.item_name}
                      onChange={handleChange}
                    />
                    <input
                      type="number"
                      name="beggining_stock"
                      value={editingData.beggining_stock}
                      onChange={handleChange}
                    />
                    <input
                      type="number"
                      name="qty_used"
                      value={editingData.qty_used}
                      onChange={handleChange}
                    />
                    <input
                      type="number"
                      name="ending_stock"
                      value={editingData.ending_stock}
                      onChange={handleChange}
                    />
                    <button className="save" onClick={() => handleSave(item.id)}>
                      Save
                    </button>
                  </>
                ) : (
                  <>
                    <div>{item.item_name}</div>
                    <div>{item.beggining_stock}</div>
                    <div>{item.qty_used}</div>
                    <div>{item.ending_stock}</div>
                    <div
                      className="edit"
                      onClick={() => handleEdit(item)}
                      style={{ cursor: 'pointer' }}
                    >
                      <img className="icon" src={Edit_icon} alt="edit" width="20px" />
                    </div>
                  </>
                )}
              </div>
            ))
          ) : (
            <p>No items found.</p>
          )}
        </div>

        {/* 🔹 List of Inventory Groups */}
        {showDiv && (
          <div className="list_details">
            <h3>📋 Inventory Lists</h3>
            <button
              className="new-Inventory-button"
              onClick={handleAddInventoryList}
            >
              New Inventory
            </button>
            {list.length > 0 ? (
              <ul>
                {list.map((entry) => (
                  <li
                    key={entry.id}
                    onClick={() => {
                      fetchInventoryByTableId(entry.table_id)
                      setShowDiv(false)
                    }}
                    style={{
                      cursor: 'pointer',
                      textDecoration:
                        selectedTableId === entry.table_id ? 'underline' : 'none',
                    }}
                  >
                    Date: {formatDate(entry.date)}
                  </li>
                ))}
              </ul>
            ) : (
              <p>No data found.</p>
            )}
          </div>
        )}
      </div>
      <Footer />
    </div>
  )
}

export default Inventory
