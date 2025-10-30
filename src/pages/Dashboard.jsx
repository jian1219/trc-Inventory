import React, { useEffect, useState } from 'react';
import Navigation from '../components/Navigation';
import Footer from '../components/Footer';
import { supabase } from '../lib/supabaseClient';

const Dashboard = () => {
  const [list_inventory_count, set_list_inventory_Count] = useState(0);
  const [Ingredients_count, set_ingredients_Count] = useState(0);
  const [petty_cash_capital_count, set_petty_cash_capital_Count] = useState(0); // ✅ new state

  // ✅ Fetch List Inventory Count
  useEffect(() => {
    const fetchListInventoryCount = async () => {
      const { count, error } = await supabase
        .from('list_inventory')
        .select('*', { count: 'exact' });

      if (error) {
        console.error('Error fetching inventory count:', error);
      } else {
        set_list_inventory_Count(count);
      }
    };

    fetchListInventoryCount();
  }, []);

  // ✅ Fetch Ingredients Count
  useEffect(() => {
    const fetchIngredientsCount = async () => {
      const { count, error } = await supabase
        .from('ingredients')
        .select('*', { count: 'exact' });

      if (error) {
        console.error('Error fetching ingredients count:', error);
      } else {
        set_ingredients_Count(count);
      }
    };

    fetchIngredientsCount();
  }, []);

  // ✅ Fetch Petty Cash Capital Count
  useEffect(() => {
    const fetchPettyCashCapitalCount = async () => {
      const { count, error } = await supabase
        .from('petty_cash_capital')
        .select('*', { count: 'exact' });

      if (error) {
        console.error('Error fetching petty cash capital count:', error);
      } else {
        set_petty_cash_capital_Count(count);
      }
    };

    fetchPettyCashCapitalCount();
  }, []);

  return (
    <div>
      <Navigation />

      <div className='dashboard'>
        <h1>Dashboard</h1>

        <div className='container'>
          <div className='box'>
            <h1>{list_inventory_count}</h1>
            <h2>Total Inventory</h2>
          </div>

          <div className='box'>
            <h1>{petty_cash_capital_count}</h1> {/* ✅ display count */}
            <h2>Total List Expense</h2>
          </div>

          <div className='box'>
            <h1>{Ingredients_count}</h1>
            <h2>Total Ingredients</h2>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Dashboard;
