const bcrypt = require('bcryptjs');

async function testPassword() {
  const password = 'TempPassword123!';
  const email = 'tatianaovallle@gmail.com';
  
  // Simular cómo se hashea en OwnerController
  const salt = await bcrypt.genSalt(12);
  const hashedPassword = await bcrypt.hash(password, salt);
  
  console.log('Password original:', password);
  console.log('Email:', email.toLowerCase());
  console.log('Hash generado:', hashedPassword);
  
  // Verificar que el hash funciona
  const isValid = await bcrypt.compare(password, hashedPassword);
  console.log('Verificación del hash:', isValid ? '✅ Correcto' : '❌ Error');
  
  // Probar con el hash que está en la base de datos de Azure
  console.log('\n🔍 Para verificar en la BD, ejecuta este query:');
  console.log(`SELECT id, email, password, role, status FROM users WHERE email = '${email.toLowerCase()}';`);
  console.log('\nLuego prueba comparar con:');
  console.log(`const dbHash = 'PEGAR_EL_HASH_DE_LA_BD_AQUI';`);
  console.log(`const result = await bcrypt.compare('${password}', dbHash);`);
  console.log(`console.log('Resultado:', result);`);
}

testPassword();
