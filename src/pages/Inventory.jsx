import React, { useEffect, useState } from 'react'
import Navigation from '../components/Navigation'
import Footer from '../components/Footer'
import { supabase } from '../lib/supabaseClient'
import Edit_icon from '../icons/pen.png'

const Inventory = () => {
  const [showDiv, setShowDiv] = useState(false)
  const [items, setItems] = useState([])
  const [list, setList] = useState([])
  const [selectedTableId, setSelectedTableId] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // 🩵 Missing states added
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

  // ✅ Add new inventory list
  const handleAddInventoryList = async () => {
    const newTableId = crypto.randomUUID()
    const currentDate = new Date().toISOString().split('T')[0]

    const { data, error } = await supabase
      .from('list_inventory')
      .insert([{ date: currentDate, table_id: newTableId }])
      .select()

    if (error) {
      console.error('Error adding inventory list:', error)
      alert('❌ Failed to add new inventory list.')
      return
    }

    setList((prev) => [...prev, ...data])
    alert('✅ New inventory list added!')
  }

  // ✅ Add item to selected list
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
              ? list.find((entry) => entry.table_id === selectedTableId)?.date || 'No date found'
              : 'No list selected'}
          </h2>
          <div>
            <button onClick={handleToggle}>
              {showDiv ? 'Hide List' : 'Show List'}
            </button>
            <button onClick={handleAddInventoryList}>New Inventory</button>
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
                    <button className='save' onClick={() => handleSave(item.id)}>Save</button>
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
            {list.length > 0 ? (
              <ul>
                {list.map((entry) => (
                  <li
                    key={entry.id}
                    onClick={() => {
                      fetchInventoryByTableId(entry.table_id)
                      setShowDiv(false) // ✅ Hide the div after selecting
                    }}
                    style={{
                      cursor: 'pointer',
                      textDecoration:
                        selectedTableId === entry.table_id ? 'underline' : 'none',
                    }}
                  >
                    Date: {entry.date}
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
