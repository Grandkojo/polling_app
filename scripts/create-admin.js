const { createClient } = require('@supabase/supabase-js');
const bcrypt = require('bcryptjs');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function createAdminUser() {
  try {
    const adminEmail = process.env.ADMIN_EMAIL;
    const adminPassword = process.env.ADMIN_PASSWORD;
    const adminName = process.env.ADMIN_NAME;

    // Check if admin user already exists
    const { data: existingUser, error: checkError } = await supabase
      .from('users')
      .select('id, email')
      .eq('email', adminEmail)
      .single();

    if (existingUser) {
      console.log('Admin user already exists:', adminEmail);
      
      console.log('Admin user already exists:', adminEmail);
      console.log('Note: Role column needs to be added to database first.');
      console.log('See ROLE_MANAGEMENT_README.md for setup instructions.');
      return;
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(adminPassword, 12);

    // Create admin user (without role column for now)
    const { data: newUser, error: insertError } = await supabase
      .from('users')
      .insert([
        {
          name: adminName,
          email: adminEmail,
          password: hashedPassword,
          role: 'admin',
        }
      ])
      .select()
      .single();

    if (insertError) {
      console.error('Error creating admin user:', insertError);
      return;
    }

    console.log('Admin user created successfully!');
    console.log('Email:', adminEmail);
    console.log('Password:', adminPassword);
    console.log('Role: admin');
    console.log('\nYou can now login with these credentials.');

  } catch (error) {
    console.error('Error:', error);
  }
}

createAdminUser();
