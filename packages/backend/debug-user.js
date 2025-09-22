const { User, Business } = require('./src/models');

async function checkUser() {
  try {
    const userId = 'c7c598df-3d8f-4b09-be32-ff64ef80bf49';
    
    console.log('Buscando usuario:', userId);
    
    const user = await User.findOne({
      where: { 
        id: userId
      },
      include: [{
        model: Business,
        as: 'business',
        attributes: ['id', 'name', 'status', 'trialEndDate']
      }]
    });

    if (!user) {
      console.log('❌ Usuario no encontrado');
    } else {
      console.log('✅ Usuario encontrado:', {
        id: user.id,
        email: user.email,
        role: user.role,
        status: user.status,
        businessId: user.businessId,
        business: user.business ? {
          id: user.business.id,
          name: user.business.name,
          status: user.business.status,
          trialEndDate: user.business.trialEndDate
        } : null
      });
    }

    const userActive = await User.findOne({
      where: { 
        id: userId,
        status: 'ACTIVE'
      }
    });

    console.log('Usuario con status ACTIVE:', !!userActive);
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    process.exit(0);
  }
}

checkUser();
