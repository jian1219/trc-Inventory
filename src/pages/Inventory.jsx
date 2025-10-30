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
          .order('date', { ascending: false })

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

  // ✅ Fetch inventory (child table)
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

  // ✅ Add new inventory list — auto fill from previous day's ending_stock
  const handleAddInventoryList = async () => {
    const newTableId = crypto.randomUUID()
    const currentDate = new Date().toISOString().split('T')[0]

    // 🛑 Check if today already exists
    const alreadyExists = list.some((entry) => entry.date === currentDate)
    if (alreadyExists) {
      alert('⚠️ You already created inventory for today.')
      return
    }

    // 🆕 Create new list record
    const { data: listData, error: listError } = await supabase
      .from('list_inventory')
      .insert([{ date: currentDate, table_id: newTableId }])
      .select()

    if (listError) {
      console.error('Error adding new list:', listError)
      alert('❌ Failed to add new list.')
      return
    }

    // 🧭 Get most recent (previous) inventory list
    const { data: prevList, error: prevError } = await supabase
      .from('list_inventory')
      .select('table_id, date')
      .order('date', { ascending: false })
      .range(1, 1) // get the 2nd newest (yesterday)

    if (prevError) console.error('Error getting previous list:', prevError)

    let newInventoryRows = []

    if (prevList && prevList.length > 0) {
      // ✅ Copy yesterday’s inventory ending_stock → new beginning_stock
      const prevTableId = prevList[0].table_id
      const { data: prevInventory, error: invError } = await supabase
        .from('inventory')
        .select('item_name, ending_stock')
        .eq('table_id', prevTableId)

      if (invError) {
        console.error('Error fetching previous inventory:', invError)
        alert('❌ Failed to fetch previous inventory.')
        return
      }

      newInventoryRows = prevInventory.map((item) => ({
        table_id: newTableId,
        item_name: item.item_name,
        beggining_stock: item.ending_stock || 0,
        qty_used: 0,
        ending_stock: 0,
      }))
    } else {
      // 🧾 If no previous list, use ingredients as base
      const { data: ingredients, error: ingredientsError } = await supabase
        .from('ingredients')
        .select('ingredients_name')

      if (ingredientsError) {
        console.error('Error fetching ingredients:', ingredientsError)
        alert('❌ Failed to fetch ingredients.')
        return
      }

      newInventoryRows = ingredients.map((ingredient) => ({
        table_id: newTableId,
        item_name: ingredient.ingredients_name,
        beggining_stock: 0,
        qty_used: 0,
        ending_stock: 0,
      }))
    }

    // 🆕 Insert new inventory rows
    const { error: insertError } = await supabase
      .from('inventory')
      .insert(newInventoryRows)

    if (insertError) {
      console.error('Error inserting new inventory:', insertError)
      alert('❌ Failed to add inventory rows.')
      return
    }

    // ✅ Update UI and open the new list
    setList((prev) => [...listData, ...prev])
    await fetchInventoryByTableId(newTableId)
    setShowDiv(false)
    alert('✅ New daily inventory created successfully!')
  }

  // ✅ Add item manually
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

  // ✅ Edit handler
  const handleEdit = (item) => {
    setSelectedItem(item.id)
    setEditingData({ ...item })
  }

  // ✅ Input change
  const handleChange = (e) => {
    const { name, value } = e.target
    setEditingData((prev) => ({ ...prev, [name]: value }))
  }

  // ✅ Save edit
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

        <div className="line1">
          <h2>
            Date:{' '}
            {selectedTableId
              ? formatDate(list.find((e) => e.table_id === selectedTableId)?.date)
              : 'No list selected'}
          </h2>
          <div>
            <button onClick={handleToggle}>
              {showDiv ? 'Hide List' : 'Show List'}
            </button>
          </div>
        </div>

        <div className="line2">
          <button onClick={handleAddItem}>ADD ITEM</button>
        </div>

        {/* Table */}
        <div className="table">
          <div className="head-columns">
            <div>Item name</div>
            <div>Start</div>
            <div>Used</div>
            <div>End</div>
            <div>Action</div>
          </div>
        </div>

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
                      type="text"
                      name="beggining_stock"
                      value={editingData.beggining_stock}
                      onChange={handleChange}
                    />
                    <input
                      type="text"
                      name="qty_used"
                      value={editingData.qty_used}
                      onChange={handleChange}
                    />
                    <input
                      type="text"
                      name="ending_stock"
                      value={editingData.ending_stock}
                      onChange={handleChange}
                    />
                    <button onClick={() => handleSave(item.id)}>Save</button>
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

        {/* 🔹 Hidden div: List of Inventories */}
        {showDiv && (
          <div className="list_details">
            <h3>📋 Inventory Lists</h3>
            <button className="new-Inventory-button" onClick={handleAddInventoryList}>
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
