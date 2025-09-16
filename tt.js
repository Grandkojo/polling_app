async function login(email, password) {
  try {
    // Input validation
    if (!email || !password) {
      throw new Error('Email and password are required');
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      throw new Error('Invalid email format');
    }

    // Send credentials securely
    const res = await fetch("/api/login", {
      method: "POST",
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email, password }),
      credentials: 'include' // Allow cookies to be sent/received
    });

    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.message || 'Login failed');
    }

    const data = await res.json();

    // Store user data in memory only, not localStorage
    const sessionData = {
      user: data.user,
      expiresAt: new Date().getTime() + (24 * 60 * 60 * 1000) // 24 hours
    };

    // Return session data to be managed by the app
    return sessionData;

  } catch (error) {
    throw new Error(`Login error: ${error.message}`);
  }
}