import React, { useEffect } from 'react'
import { supabase } from '../lib/supabaseClient';
import Navigation from '../components/Navigation';
import Footer from '../components/Footer';

const About = () => {

    

    return (
        <div>
          <Navigation />

          <div className="ingredients">
            <div className="head-table">
              <div>Ingredients Name</div>
              <div>Description</div>
              <div>Supplier</div>
              <div>Price</div>

            </div>
          </div>

          <Footer />
        </div>
    );
}

export default About;
