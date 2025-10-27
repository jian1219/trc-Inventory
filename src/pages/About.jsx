import React, { useEffect } from 'react'
import { supabase } from '../lib/supabaseClient';

const About = () => {

       useEffect(() => {
    const fetchData = async () => {
      try {
        // Step 1: Fetch parent table (list_inventory)
        const { data: listData, error: listError } = await supabase
          .from('list_inventory')
          .select('date, table_id')

        if (listError) throw listError

        console.log('🟩 Parent Table (list_inventory):', listData)

        // Step 2: For each parent table_id, fetch its child items
        for (const parent of listData) {
          const { data: items, error: itemsError } = await supabase
            .from('inventory')
            .select('item_name, table_id')
            .eq('table_id', parent.table_id)

          if (itemsError) throw itemsError

          console.log(`📦 Items for table_id ${parent.table_id}:`, items)
        }
      } catch (err) {
        console.error('❌ Error fetching data:', err)
      }
    }

    fetchData()
  }, [])

    return (
        <div>
            About
        </div>
    );
}

export default About;
