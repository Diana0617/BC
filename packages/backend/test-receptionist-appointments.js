const fetch = require('node-fetch');

async function testReceptionistAppointments() {
  try {
    console.log('🔍 Testing receptionist appointments endpoint...');
    
    // Primero hacer login como recepcionista
    const loginResponse = await fetch('http://localhost:3001/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: 'receptionist@salon-prueba.com',
        password: 'Reception123!'
      })
    });

    if (!loginResponse.ok) {
      throw new Error(`Login failed: ${loginResponse.status}`);
    }

    const loginData = await loginResponse.json();
    console.log('✅ Login successful:', {
      email: loginData.data.user.email,
      role: loginData.data.user.role,
      businessId: loginData.data.user.businessId
    });

    const token = loginData.data.token;
    const businessId = loginData.data.user.businessId;

    // Ahora probar el endpoint de appointments
    const appointmentsUrl = `http://localhost:3001/api/appointments?businessId=${businessId}`;
    console.log('📡 Fetching appointments from:', appointmentsUrl);

    const appointmentsResponse = await fetch(appointmentsUrl, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    console.log('📥 Appointments response status:', appointmentsResponse.status);

    if (!appointmentsResponse.ok) {
      const errorText = await appointmentsResponse.text();
      console.error('❌ Appointments error:', errorText);
      return;
    }

    const appointmentsData = await appointmentsResponse.json();
    console.log('✅ Appointments response:', {
      success: appointmentsData.success,
      appointmentsCount: appointmentsData.data?.appointments?.length || 0,
      totalPages: appointmentsData.data?.pagination?.totalPages || 0,
      total: appointmentsData.data?.pagination?.total || 0
    });

    if (appointmentsData.data?.appointments?.length > 0) {
      console.log('📋 First appointment:', {
        id: appointmentsData.data.appointments[0].id,
        status: appointmentsData.data.appointments[0].status,
        client: appointmentsData.data.appointments[0].client?.firstName,
        specialist: appointmentsData.data.appointments[0].specialist?.firstName,
        service: appointmentsData.data.appointments[0].service?.name,
        startTime: appointmentsData.data.appointments[0].startTime
      });
    } else {
      console.log('⚠️ No appointments found');
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testReceptionistAppointments();