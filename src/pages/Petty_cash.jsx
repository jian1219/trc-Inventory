import React, { useEffect, useState } from 'react'
import Navigation from '../components/Navigation'
import Footer from '../components/Footer'
import { supabase } from '../lib/supabaseClient'

const PettyCash = () => {
  const [showAddExpense, setShowAddExpense] = useState(false)
  const [showHistory, setShowHistory] = useState(false)
  const [showNewCapital, setShowNewCapital] = useState(false)

  const [pettyCashList, setPettyCashList] = useState([]) // parent table: petty_cash_capital
  const [records, setRecords] = useState([]) // child table: petty_cash
  const [selectedId, setSelectedId] = useState(null)

  const [expenseForm, setExpenseForm] = useState({
    date: '',
    description: '',
    expense: '',
  })

  const [capitalForm, setCapitalForm] = useState({
    description: '',
    amount: '',
  })

  // ✅ fetch petty_cash_capital (parent)
  const fetchPettyCashCapital = async () => {
    const { data, error } = await supabase
      .from('petty_cash_capital')
      .select('id, date, petty_cash_id, description, amount, balance')
      .order('date', { ascending: false })

    if (error) {
      console.error('Error fetching petty_cash_capital:', error)
    } else {
      setPettyCashList(data)
    }
  }

  // ✅ fetch petty_cash (child) based on petty_cash_id
  const fetchPettyCash = async (petty_cash_id) => {
    const { data, error } = await supabase
      .from('petty_cash')
      .select('id, date, description, expense')
      .eq('petty_cash_id', petty_cash_id)
      .order('date', { ascending: true })

    if (error) {
      console.error('Error fetching petty_cash:', error)
    } else {
      setRecords(data)
      setSelectedId(petty_cash_id)
    }
  }

  // ✅ Add new petty_cash_capital
  const handleAddCapital = async (e) => {
    e.preventDefault()

    const today = new Date().toISOString().split('T')[0]
    const newCapital = {
      date: today,
      petty_cash_id: crypto.randomUUID(),
      description: capitalForm.description,
      amount: parseFloat(capitalForm.amount),
      balance: parseFloat(capitalForm.amount),
    }

    const { error } = await supabase.from('petty_cash_capital').insert([newCapital])

    if (error) {
      console.error('Error adding capital:', error)
      alert('Failed to add capital.')
    } else {
      alert('New Petty Cash Capital Added!')
      setShowNewCapital(false)
      setCapitalForm({ description: '', amount: '' })
      fetchPettyCashCapital()
    }
  }

  // ✅ Add expense to selected petty_cash_capital
  const handleAddExpense = async (e) => {
    e.preventDefault()

    if (!selectedId) {
      alert('Please select a Petty Cash Capital from History first.')
      return
    }

    const { error } = await supabase.from('petty_cash').insert([
      {
        date: expenseForm.date,
        description: expenseForm.description,
        expense: parseFloat(expenseForm.expense),
        petty_cash_id: selectedId,
      },
    ])

    if (error) {
      console.error('Error adding expense:', error)
      alert('Failed to add expense.')
    } else {
      alert('Expense Added!')
      setShowAddExpense(false)
      setExpenseForm({ date: '', description: '', expense: '' })
      fetchPettyCash(selectedId)
    }
  }

  useEffect(() => {
    fetchPettyCashCapital()
  }, [])

  return (
    <div>
      <Navigation />

      <div className="petty-cash-container">
        <div className="line1">
          <div>
            <h1>Petty Cash Management</h1>
            <button onClick={() => setShowAddExpense(!showAddExpense)}>
              {showAddExpense ? 'Cancel' : 'Add Expense'}
            </button>
          </div>
          <div>
            <button onClick={() => setShowHistory(!showHistory)}>
              {showHistory ? 'Hide LIST' : 'COH LIST'}
            </button>
          </div>
        </div>

        {/* ✅ HISTORY DIV */}
        {showHistory && (
          <div className="history-container">
            <h2 className='text-center'>Petty Cash List</h2>

            <button 
            className='create_new_pettyCash'
            onClick={() => setShowNewCapital(!showNewCapital)}>
              {showNewCapital ? 'Cancel' : 'Create New'}
            </button>

            {/* ✅ New Capital Form */}
            {showNewCapital && (
              <form className='form_create-pettyCash' onSubmit={handleAddCapital}>
                <div className='box'>
                  <div>Date:</div>
                  <input type="text" value={new Date().toISOString().split('T')[0]} readOnly />
                </div>
                <div className='box'>
                  <div>Description:</div>
                  <input
                    type="text"
                    placeholder="Enter description"
                    value={capitalForm.description}
                    onChange={(e) =>
                      setCapitalForm({ ...capitalForm, description: e.target.value })
                    }
                    required
                  />
                </div>
                <div className='box'>
                  <div>Amount:</div>
                  <input
                    type="number"
                    placeholder="Enter amount"
                    value={capitalForm.amount}
                    onChange={(e) =>
                      setCapitalForm({ ...capitalForm, amount: e.target.value })
                    }
                    required
                  />
                </div>
                <button className='create_NewSave' type="submit">Save</button>
              </form>
            )}

            {/* ✅ List of Capitals */}
            {pettyCashList.length > 0 ? (
              <ul>
                {pettyCashList.length > 0 ? (
              <ul>
                {pettyCashList.map((capital) => (
                  <li
                    className='listOfPettycash'
                    key={capital.id}
                    onClick={async () => {
                      await fetchPettyCash(capital.petty_cash_id);
                      setShowHistory(false); // 👈 hide the history section after success
                    }}
                  >
                    {capital.date} — {capital.description} — ₱{capital.amount}
                  </li>
                ))}
              </ul>
              ) : (
                <p>No Petty Cash Capital yet.</p>
              )}

              </ul>
            ) : (
              <p>No Petty Cash Capital yet.</p>
            )}
          </div>
        )}

        {/* ✅ TABLE HEADER */}
        <div className="table">
          <div className="head-columns">
            <div>Date</div>
            <div>Description</div>
            <div>Expense</div>
          </div>
        </div>

        {/* ✅ CHILD RECORDS */}
        <div className="data-table">
          {records.length > 0 ? (
            records.map((record) => (
              <div key={record.id} className="data-columns">
                <div>{record.date}</div>
                <div>{record.description}</div>
                <div>{record.expense}</div>
              </div>
            ))
          ) : (
            <p>No records found. Select a capital from history.</p>
          )}
        </div>

        {/* ✅ ADD EXPENSE FORM */}
        {showAddExpense && (
          <div className="add-expense">
            <form className='form' onSubmit={handleAddExpense}>
              <h2>Add Expense</h2>
              <div className='box'>
                <label>Date:</label>
                <input
                  type="date"
                  value={expenseForm.date}
                  onChange={(e) => setExpenseForm({ ...expenseForm, date: e.target.value })}
                  required
                />
              </div>
              <div className='box'>
                <label>Description:</label>
                <input
                  type="text"
                  placeholder="Description"
                  value={expenseForm.description}
                  onChange={(e) =>
                    setExpenseForm({ ...expenseForm, description: e.target.value })
                  }
                  required
                />
              </div>
              <div className='box'>
                <label>Amount:</label>
                <input
                  type="number"
                  placeholder="Amount"
                  value={expenseForm.expense}
                  onChange={(e) =>
                    setExpenseForm({ ...expenseForm, expense: e.target.value })
                  }
                  required
                />
              </div>
              <button type="submit">Save</button>
            </form>
          </div>
        )}
      </div>

      <Footer />
    </div>
  )
}

export default PettyCash
