const { User, SpecialistProfile, SpecialistBranchSchedule } = require('./src/models');

(async () => {
  try {
    const specialists = await User.findAll({
      where: { 
        businessId: 'ce0cfcad-dca8-422c-bee3-e273d9439037'
      },
      include: [{
        model: SpecialistProfile,
        as: 'specialistProfile',
        required: false
      }]
    });
    
    console.log(`\n👥 Total usuarios en el negocio: ${specialists.length}\n`);
    
    for (const user of specialists) {
      console.log(`👤 ${user.firstName} ${user.lastName}`);
      console.log(`   userId: ${user.id}`);
      console.log(`   role: ${user.role}`);
      console.log(`   email: ${user.email}`);
      console.log(`   specialistProfileId: ${user.specialistProfile?.id || 'NO TIENE'}`);
      
      if (user.specialistProfile) {
        const schedules = await SpecialistBranchSchedule.findAll({
          where: { specialistProfileId: user.specialistProfile.id }
        });
        console.log(`   📅 Horarios configurados: ${schedules.length}`);
      }
      console.log('');
    }
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error);
    process.exit(1);
  }
})();
