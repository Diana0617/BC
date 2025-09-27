const { sequelize } = require('./src/config/database');
const Module = require('./src/models/Module');

async function listAllModules() {
  try {
    await sequelize.authenticate();
    const modules = await Module.findAll({
      attributes: ['name', 'displayName', 'category', 'requiresConfiguration'],
      order: [['category', 'ASC'], ['name', 'ASC']]
    });

    console.log('📦 TODOS LOS MÓDULOS DISPONIBLES:');
    console.log('='.repeat(80));

    const categories = {};
    modules.forEach(module => {
      if (!categories[module.category]) {
        categories[module.category] = [];
      }
      categories[module.category].push(module);
    });

    Object.keys(categories).forEach(category => {
      console.log(`\n🔹 ${category}:`);
      categories[category].forEach(module => {
        const configIcon = module.requiresConfiguration ? '⚙️' : '✅';
        console.log(`  ${configIcon} ${module.displayName} (${module.name})`);
      });
    });

    console.log(`\n📊 Total: ${modules.length} módulos`);

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await sequelize.close();
  }
}

listAllModules();