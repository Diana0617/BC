# Test Data - Business Control App

## Test Business Information

### Business Details
- **Business Code**: `salon-prueba`
- **Business Name**: Salón de Prueba
- **Subdomain**: salon-prueba
- **Database**: Configured and seeded with test data

## Test User Accounts

### Business Account
- **Email**: `owner@salon-prueba.com`
- **Password**: `Owner123!`
- **Role**: Business
- **Permissions**: Full access to all features, business configuration, user management

### Specialist Account
- **Email**: `specialist@test.com`
- **Password**: `Password123!`
- **Role**: Specialist
- **BusinessId**: `5c4f4c1a-62d4-4c61-9a89-ee8e33585fc7`
- **Permissions**: Appointment management, client services, commission tracking

### Receptionist Account
- **Email**: `receptionist@salon-prueba.com`
- **Password**: `Reception123!`
- **Role**: Receptionist
- **Permissions**: Appointment scheduling, client check-in, basic administrative tasks

## Application Access

### Mobile App
- **Port**: 8082
- **URL**: http://localhost:8082
- **Login Flow**: Welcome → Role Selection → Login → Dashboard

### Web App
- **Port**: 5173
- **URL**: http://localhost:5173
- **API Connection**: http://192.168.0.213:3001

### Backend API
- **Port**: 3001
- **URL**: http://localhost:3001
- **Database**: PostgreSQL with Sequelize ORM

## Login Instructions

1. **Start Mobile App**: `npx expo start` in `packages/mobile-app`
2. **Access Welcome Screen**: Navigate through role selection
3. **Enter Subdomain**: `salon-prueba`
4. **Select User**: Choose any of the test accounts above
5. **Enter Credentials**: Use email and password from test accounts
6. **Access Dashboard**: Role-specific dashboard will load

## Business Features Available

### For Business Role
- Business configuration management
- User and role management
- Financial reports and analytics
- Commission structure configuration
- WhatsApp integration settings

### For Specialist Role
- Appointment management
- Client service tracking
- Commission earnings view
- Receipt generation and WhatsApp delivery
- Business rules compliance

### For Receptionist Role
- Appointment scheduling
- Client check-in/check-out
- Basic appointment management
- Receipt generation assistance

## Database Reset (if needed)

### Complete Database Recreation (after deleting database):

```bash
# Navigate to backend
cd packages/backend

# 1. Run database migrations (creates tables)
npm run migrate

# 2. Seed basic modules and plans
node scripts/seed-modules.js
node scripts/seed-plans.js

# 3. Create test business
node scripts/create-test-business.js

# 4. Create test users
node scripts/create-test-users.js

# 5. Initialize cache (optional but recommended)
node scripts/init-cache.js
```

### Partial Reset (database exists, just reset test data):

```bash
# Navigate to backend
cd packages/backend

# Reset and recreate test business
node scripts/create-test-business.js

# Create test users
node scripts/create-test-users.js
```

## Environment Configuration

### Mobile App (.env.local)
```
EXPO_PUBLIC_API_URL=http://192.168.0.213:3001
```

### Web App (.env.local)
```
VITE_API_URL=http://192.168.0.213:3001
```

## Notes

- All test data is configured for the "salon-prueba" business
- Passwords follow security requirements (uppercase, lowercase, number, special character)
- Each role has different dashboard views and permissions
- The subdomain "salon-prueba" is required for login
- Mobile app uses inline styles for better React Native compatibility
- WhatsApp integration includes "Business Control" branding

## Troubleshooting

### Common Issues
1. **API Connection**: Ensure backend is running on port 3001
2. **Database**: Check PostgreSQL connection and migrations
3. **Mobile Styling**: App uses inline styles instead of Tailwind classes
4. **Test Data**: Use create-test-business.js and create-test-users.js scripts if data is missing

### Quick Verification
- Backend health check: `GET http://localhost:3001/health`
- Database connection: Check backend console for successful DB connection
- Test business exists: Login should work with subdomain "salon-prueba"