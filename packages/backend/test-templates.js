require('dotenv').config();
const { RuleTemplate, sequelize } = require('./src/models');

async function checkRuleTemplates() {
  try {
    console.log('=== RULE TEMPLATES TEST ===');
    const templates = await RuleTemplate.findAll({
      where: { isActive: true },
      attributes: ['id', 'key', 'type', 'category', 'description', 'defaultValue'],
      order: [['category', 'ASC'], ['key', 'ASC']]
    });
    
    console.log('Found', templates.length, 'active rule templates');
    
    const categories = {};
    templates.forEach(t => {
      if (!categories[t.category]) categories[t.category] = [];
      categories[t.category].push(t.key);
    });
    
    Object.keys(categories).forEach(category => {
      console.log(`${category}: ${categories[category].length} rules`);
      categories[category].forEach(key => console.log(`  - ${key}`));
    });

    await sequelize.close();
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

checkRuleTemplates();