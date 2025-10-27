import React, { useEffect, useState } from 'react'
import Navigation from '../components/Navigation';
import { supabase } from '../lib/supabaseClient'
import Footer from '../components/Footer';

const PettyCash = () => {

    const [showDiv, setShowDiv] = useState(false) // hidden by default

    const handleToggle = () => {
        setShowDiv(!showDiv) // toggle true/false
    }


    const [records, setRecords] = useState([])
    const [loading, setLoading] = useState(true)
    const [form, setForm] = useState({
        date: '',
        description: '',
        amount: '',
        balance: '',
    })

    useEffect(() => {
        const fetchPettyCash = async () => {
        const { data, error } = await supabase
            .from('petty_cash')
            .select('id, date, description, amount, balance')
            .order('date', { ascending: true })

        if (error) {
            console.error('Error fetching petty cash:', error)
        } else {
            setRecords(data)
        }
        setLoading(false)
        console.log(data)
        }

        fetchPettyCash()
    }, [])

    const handleSubmit = async (e) => {
        e.preventDefault()

        const { error } = await supabase.from('petty_cash').insert([
        {
            date: form.date,
            description: form.description,
            amount: parseFloat(form.amount),
            balance: parseFloat(form.balance),
        },
        ])

        if (error) {
        console.error('Error adding expense:', error)
        alert('Failed to add expense.')
        } else {
        alert('Expense added successfully!')
        setShowDiv(false) // hide the form
        setForm({ date: '', description: '', amount: '', balance: '' }) // clear inputs
      
        }
    }

  return (
    <div>
      <Navigation />

      <div className="petty-cash-container">
        <div className="line1">
          <h1>Petty Cash : 3000</h1>
          <div>
            <button  onClick={handleToggle}>
                {showDiv ? 'Cancel' : 'Add Expense'}
            </button>
          </div>
        </div>

        <div className="table">
          <div className="head-columns">
            <div>Date</div>
            <div>Description</div>
            <div>Amount</div>
            <div>Balance</div>
          </div>
        </div>

        <div className="data-table">
          {records.length > 0 ? (
            records.map((item) => (
              <div className="data-columns" key={item.id}>
                <div>{item.date}</div>
                <div>{item.description}</div>
                <div>{item.amount}</div>
                <div>{item.balance}</div>
              </div>
            ))
          ) : (
            <p>No records found.</p>
          )}
        </div>
      </div>

           <div>

      {showDiv && (
        <div className='add-expense'>
         <form onSubmit={handleSubmit}>
            <h2>Add Expense</h2>

            <div className="box">
                <div>Date:</div>
                <input
                    type="date"
                    value={form.date}
                    onChange={(e) => setForm({ ...form, date: e.target.value })}
                    required
                />
            </div>
            <div className="box">
                <div>Description:</div>
                <input
                    type="text"
                    placeholder="Description"
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    required
                />

            </div>
            <div className="box">
                <div>Amount:</div>
                <input
                    type="number"
                    placeholder="Amount"
                    value={form.amount}
                    onChange={(e) => setForm({ ...form, amount: e.target.value })}
                    required
                />

            </div>
            <div className="box">
                <div>Amount:</div>
                <input
                    type="number"
                    placeholder="Balance"
                    value={form.balance}
                    onChange={(e) => setForm({ ...form, balance: e.target.value })}
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
