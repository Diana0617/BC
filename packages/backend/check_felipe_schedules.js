const { User, SpecialistProfile, SpecialistBranchSchedule } = require('./src/models');

(async () => {
  try {
    const felipe = await User.findOne({
      where: { 
        firstName: 'Felipe',
        businessId: 'ce0cfcad-dca8-422c-bee3-e273d9439037'
      },
      include: [{
        model: SpecialistProfile,
        as: 'specialistProfile'
      }]
    });
    
    if (!felipe) {
      console.log('❌ Felipe no encontrado');
      process.exit(0);
    }
    
    console.log('👤 Felipe encontrado:');
    console.log('   userId:', felipe.id);
    console.log('   role:', felipe.role);
    console.log('   specialistProfileId:', felipe.specialistProfile?.id || 'NO TIENE PERFIL');
    
    if (!felipe.specialistProfile) {
      console.log('\n⚠️ Felipe NO tiene SpecialistProfile - necesita ser creado');
      process.exit(0);
    }
    
    const schedules = await SpecialistBranchSchedule.findAll({
      where: { specialistProfileId: felipe.specialistProfile.id }
    });
    
    console.log('\n📅 Horarios configurados:', schedules.length);
    
    if (schedules.length === 0) {
      console.log('\n❌ Felipe NO tiene horarios configurados en specialist_branch_schedules');
      console.log('   Esto explica por qué muestra los horarios del negocio en vez de sus horarios personales');
    } else {
      schedules.forEach((schedule, i) => {
        console.log(`\n📍 Horario ${i + 1}:`);
        console.log('   branchId:', schedule.branchId);
        console.log('   weeklySchedule:', JSON.stringify(schedule.weeklySchedule, null, 2));
      });
    }
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error);
    process.exit(1);
  }
})();
