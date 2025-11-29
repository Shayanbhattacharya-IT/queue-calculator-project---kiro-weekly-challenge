import getDatabase from './database.js';

export function seedCategories() {
  const db = getDatabase();

  const categories = [
    { name: 'Banks', displayOrder: 1 },
    { name: 'Restaurants', displayOrder: 2 },
    { name: 'Hotels', displayOrder: 3 },
    { name: 'Events', displayOrder: 4 },
    { name: 'Healthcare', displayOrder: 5 },
    { name: 'Government Services', displayOrder: 6 },
    { name: 'Retail', displayOrder: 7 }
  ];

  const insert = db.prepare(`
    INSERT OR IGNORE INTO categories (name, displayOrder)
    VALUES (?, ?)
  `);

  const insertMany = db.transaction((cats) => {
    for (const cat of cats) {
      insert.run(cat.name, cat.displayOrder);
    }
  });

  insertMany(categories);
  console.log('Categories seeded successfully');
}

export function seedSampleData() {
  const db = getDatabase();

  // Seed Indian locations across different states
  const locations = [
    // Banks in Maharashtra
    { name: 'HDFC Bank Nariman Point', categoryId: 1, state: 'Maharashtra', city: 'Mumbai', address: 'Nariman Point, Mumbai' },
    { name: 'ICICI Bank Bandra', categoryId: 1, state: 'Maharashtra', city: 'Mumbai', address: 'Bandra West, Mumbai' },
    { name: 'State Bank of India Pune Camp', categoryId: 1, state: 'Maharashtra', city: 'Pune', address: 'Camp Area, Pune' },
    
    // Banks in Delhi
    { name: 'HDFC Bank Connaught Place', categoryId: 1, state: 'Delhi', city: 'New Delhi', address: 'Connaught Place, New Delhi' },
    { name: 'Axis Bank Karol Bagh', categoryId: 1, state: 'Delhi', city: 'New Delhi', address: 'Karol Bagh, New Delhi' },
    
    // Banks in Karnataka
    { name: 'ICICI Bank Koramangala', categoryId: 1, state: 'Karnataka', city: 'Bangalore', address: 'Koramangala, Bangalore' },
    { name: 'HDFC Bank Indiranagar', categoryId: 1, state: 'Karnataka', city: 'Bangalore', address: 'Indiranagar, Bangalore' },
    
    // Restaurants in Maharashtra
    { name: 'Taj Mahal Palace Restaurant', categoryId: 2, state: 'Maharashtra', city: 'Mumbai', address: 'Colaba, Mumbai' },
    { name: 'Bademiya Restaurant', categoryId: 2, state: 'Maharashtra', city: 'Mumbai', address: 'Colaba Causeway, Mumbai' },
    { name: 'Vaishali Restaurant', categoryId: 2, state: 'Maharashtra', city: 'Pune', address: 'FC Road, Pune' },
    
    // Restaurants in Delhi
    { name: 'Karim Hotel', categoryId: 2, state: 'Delhi', city: 'New Delhi', address: 'Jama Masjid, Old Delhi' },
    { name: 'Indian Accent', categoryId: 2, state: 'Delhi', city: 'New Delhi', address: 'Lodhi Road, New Delhi' },
    
    // Restaurants in Karnataka
    { name: 'MTR Restaurant', categoryId: 2, state: 'Karnataka', city: 'Bangalore', address: 'Lalbagh Road, Bangalore' },
    { name: 'Koshy Restaurant', categoryId: 2, state: 'Karnataka', city: 'Bangalore', address: 'St. Marks Road, Bangalore' },
    
    // Hotels in Maharashtra
    { name: 'Taj Mahal Palace Hotel', categoryId: 3, state: 'Maharashtra', city: 'Mumbai', address: 'Apollo Bunder, Colaba, Mumbai' },
    { name: 'The Oberoi Mumbai', categoryId: 3, state: 'Maharashtra', city: 'Mumbai', address: 'Nariman Point, Mumbai' },
    { name: 'JW Marriott Pune', categoryId: 3, state: 'Maharashtra', city: 'Pune', address: 'Senapati Bapat Road, Pune' },
    
    // Hotels in Delhi
    { name: 'The Leela Palace New Delhi', categoryId: 3, state: 'Delhi', city: 'New Delhi', address: 'Chanakyapuri, New Delhi' },
    { name: 'ITC Maurya', categoryId: 3, state: 'Delhi', city: 'New Delhi', address: 'Sardar Patel Marg, New Delhi' },
    { name: 'The Imperial Hotel', categoryId: 3, state: 'Delhi', city: 'New Delhi', address: 'Janpath, Connaught Place, New Delhi' },
    
    // Hotels in Karnataka
    { name: 'ITC Gardenia Bangalore', categoryId: 3, state: 'Karnataka', city: 'Bangalore', address: 'Residency Road, Bangalore' },
    { name: 'The Oberoi Bangalore', categoryId: 3, state: 'Karnataka', city: 'Bangalore', address: 'MG Road, Bangalore' },
    { name: 'Taj West End', categoryId: 3, state: 'Karnataka', city: 'Bangalore', address: 'Race Course Road, Bangalore' },
    
    // Healthcare in Maharashtra
    { name: 'Lilavati Hospital', categoryId: 4, state: 'Maharashtra', city: 'Mumbai', address: 'Bandra West, Mumbai' },
    { name: 'Ruby Hall Clinic', categoryId: 4, state: 'Maharashtra', city: 'Pune', address: 'Grant Road, Pune' },
    
    // Healthcare in Delhi
    { name: 'AIIMS Delhi', categoryId: 4, state: 'Delhi', city: 'New Delhi', address: 'Ansari Nagar, New Delhi' },
    { name: 'Apollo Hospital Delhi', categoryId: 4, state: 'Delhi', city: 'New Delhi', address: 'Sarita Vihar, New Delhi' },
    
    // Healthcare in Karnataka
    { name: 'Manipal Hospital', categoryId: 4, state: 'Karnataka', city: 'Bangalore', address: 'HAL Airport Road, Bangalore' },
    { name: 'Fortis Hospital', categoryId: 4, state: 'Karnataka', city: 'Bangalore', address: 'Bannerghatta Road, Bangalore' },
    
    // Government Services in Maharashtra
    { name: 'RTO Mumbai Central', categoryId: 5, state: 'Maharashtra', city: 'Mumbai', address: 'Mumbai Central' },
    { name: 'Passport Office Pune', categoryId: 5, state: 'Maharashtra', city: 'Pune', address: 'Koregaon Park, Pune' },
    
    // Government Services in Delhi
    { name: 'Passport Seva Kendra Delhi', categoryId: 5, state: 'Delhi', city: 'New Delhi', address: 'Shastri Bhawan, New Delhi' },
    { name: 'RTO Delhi East', categoryId: 5, state: 'Delhi', city: 'New Delhi', address: 'Laxmi Nagar, New Delhi' },
    
    // Government Services in Karnataka
    { name: 'RTO Bangalore Koramangala', categoryId: 5, state: 'Karnataka', city: 'Bangalore', address: 'Koramangala, Bangalore' },
    { name: 'Passport Office Bangalore', categoryId: 5, state: 'Karnataka', city: 'Bangalore', address: 'Malleshwaram, Bangalore' },
    
    // Retail in Maharashtra
    { name: 'D-Mart Andheri', categoryId: 6, state: 'Maharashtra', city: 'Mumbai', address: 'Andheri West, Mumbai' },
    { name: 'Reliance Fresh Pune', categoryId: 6, state: 'Maharashtra', city: 'Pune', address: 'Shivaji Nagar, Pune' },
    
    // Retail in Delhi
    { name: 'Big Bazaar Lajpat Nagar', categoryId: 6, state: 'Delhi', city: 'New Delhi', address: 'Lajpat Nagar, New Delhi' },
    { name: 'Spencer Retail Saket', categoryId: 6, state: 'Delhi', city: 'New Delhi', address: 'Saket, New Delhi' },
    
    // Retail in Karnataka
    { name: 'More Supermarket Whitefield', categoryId: 6, state: 'Karnataka', city: 'Bangalore', address: 'Whitefield, Bangalore' },
    { name: 'Big Bazaar Jayanagar', categoryId: 6, state: 'Karnataka', city: 'Bangalore', address: 'Jayanagar, Bangalore' }
  ];

  const insert = db.prepare(`
    INSERT OR IGNORE INTO locations (name, categoryId, state, city, address)
    VALUES (?, ?, ?, ?, ?)
  `);

  const insertMany = db.transaction((locs) => {
    for (const loc of locs) {
      insert.run(loc.name, loc.categoryId, loc.state, loc.city, loc.address);
    }
  });

  insertMany(locations);
  console.log('Sample Indian locations seeded successfully');
}

export default seedCategories;
