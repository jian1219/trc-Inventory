import React, { useEffect, useState } from 'react';
import Navigation from '../components/Navigation';
import Footer from '../components/Footer'

import { supabase } from '../lib/supabaseClient'



const Dashboard = () => {

    const [list_inventory_count, set_list_inventory_Count] = useState(0);
    const [Ingredients_count, set_ingredients_Count] = useState(0);

    useEffect(() => {
        const fetchListInventoryCount = async () => {
            const { data, count, error } = await supabase
            .from('list_inventory')
            .select('*', { count: 'exact' }); // ✅ get total count

            if (error) {
            console.error('Error fetching count:', error);
            } else {
            console.log('List inventory count:', count);
            set_list_inventory_Count(count);
            }
        };

        fetchListInventoryCount();
    }, []);

    useEffect(() => {
        const fetchIngredientsCount = async () => {
            const { data, count, error } = await supabase
            .from('ingredients')
            .select('*', { count: 'exact' }); // ✅ get total count

            if (error) {
            console.error('Error fetching count:', error);
            } else {
            console.log('List inventory count:', count);
            set_ingredients_Count(count);
            }
        };

        fetchIngredientsCount();
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
                        <h1>0</h1>
                        <h2>Total list Petty Cash</h2>
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
}

export default Dashboard;
