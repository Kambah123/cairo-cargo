# Cairo Cargo - Supabase Integration Guide

## Project Overview

The Cairo Cargo application has been successfully connected to Supabase for backend database management, real-time updates, and authentication.

## Supabase Project Details

- **Project Name**: cairo-cargo
- **Project ID**: sphjjlsutwxywslhenyp
- **Region**: us-east-1
- **Database**: PostgreSQL 17.6.1
- **Status**: ACTIVE_HEALTHY

### API Credentials

- **Project URL**: https://sphjjlsutwxywslhenyp.supabase.co
- **Publishable Key (Anon)**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNwaGpqbHN1dHd4eXdzbGhlbnlwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk1MTI3ODUsImV4cCI6MjA5NTA4ODc4NX0.X2WUhePTayDhliuz1_wx3keEMGhfDqnaruj7UOf7W5M`
- **Publishable Key (Modern)**: `sb_publishable_KaqzllWdbz-oKShzidKqsg_0wHfJITq`

## Database Schema

### Tables Created

#### 1. **profiles** (User Profiles)
- `id` (UUID, Primary Key) - References auth.users
- `username` (TEXT, Unique) - User's unique identifier
- `name` (TEXT) - User's display name
- `role` (user_role enum) - One of: cairo_staff, nigeria_staff, admin
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)

#### 2. **batches** (Flight Batches)
- `id` (TEXT, Primary Key) - Batch identifier
- `destination` (destination enum) - One of: kano, abuja
- `flight_date` (DATE) - Scheduled flight date
- `status` (batch_status enum) - One of: open, closed, shipped
- `shipment_count` (INTEGER) - Number of shipments in batch
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)

#### 3. **shipments** (Cargo Shipments)
- `id` (TEXT, Primary Key) - Shipment ID
- `tracking_number` (TEXT, Unique) - Tracking number
- `sender_name` (TEXT) - Sender's name
- `sender_phone` (TEXT) - Sender's phone
- `receiver_name` (TEXT) - Receiver's name
- `receiver_phone` (TEXT) - Receiver's phone
- `destination` (destination enum) - kano or abuja
- `item_description` (TEXT) - Description of items
- `weight` (DECIMAL) - Package weight
- `weight_unit` (TEXT) - Unit of weight (kg, lbs, etc.)
- `photo_url` (TEXT) - URL to package photo
- `priority_labels` (TEXT[]) - Array of priority labels
- `total_amount` (DECIMAL) - Total cost
- `paid_amount` (DECIMAL) - Amount paid
- `balance_due` (DECIMAL) - Remaining balance
- `status` (shipment_status enum) - Shipment status
- `batch_id` (TEXT, Foreign Key) - References batches table
- `created_by` (UUID, Foreign Key) - References auth.users
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)
- `arrival_confirmation` (JSONB) - Arrival confirmation details
- `delivery_confirmation` (JSONB) - Delivery confirmation details

### Custom Types (Enums)

- **user_role**: cairo_staff, nigeria_staff, admin
- **destination**: kano, abuja
- **shipment_status**: received, awaiting_flight, shipped, arrived, ready_for_pickup, delivered, on_hold
- **batch_status**: open, closed, shipped

## Row Level Security (RLS)

All tables have RLS enabled with the following policies:

### Profiles
- **SELECT**: Public - Anyone can view profiles
- **UPDATE**: Only users can update their own profile

### Batches
- **SELECT**: Authenticated users only
- **ALL**: Cairo staff and admin users

### Shipments
- **SELECT**: Authenticated users only
- **ALL**: Cairo staff, Nigeria staff, and admin users

## Integration in Frontend

### Environment Variables

Create a `.env.local` file in the project root:

```env
VITE_SUPABASE_URL=https://sphjjlsutwxywslhenyp.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNwaGpqbHN1dHd4eXdzbGhlbnlwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk1MTI3ODUsImV4cCI6MjA5NTA4ODc4NX0.X2WUhePTayDhliuz1_wx3keEMGhfDqnaruj7UOf7W5M
```

### Key Files Modified/Created

1. **src/lib/supabase.ts** - Supabase client initialization
2. **src/context/AuthContext.tsx** - Supabase authentication integration
3. **src/context/DataContext.tsx** - Real-time data sync with Supabase
4. **src/pages/LoginPage.tsx** - Updated to use Supabase auth

### Features

#### Authentication
- User registration and login via Supabase Auth
- Role-based access control (cairo_staff, nigeria_staff, admin)
- Session persistence across page refreshes
- Automatic profile creation on signup

#### Real-Time Data Sync
- Real-time updates for shipments and batches
- Automatic UI updates when data changes in the database
- Subscriptions to table changes using Supabase Realtime

#### Data Operations
- Create, read, update shipments
- Manage batches
- Confirm arrivals and deliveries
- Filter shipments by status, destination, or batch

## Usage Examples

### Authentication

```typescript
import { useAuth } from '@/context/AuthContext';

function MyComponent() {
  const { user, login, logout, isAuthenticated } = useAuth();

  const handleLogin = async () => {
    try {
      await login('username', 'cairo_staff');
    } catch (error) {
      console.error('Login failed:', error);
    }
  };

  return (
    <div>
      {isAuthenticated ? (
        <>
          <p>Welcome, {user?.name}</p>
          <button onClick={logout}>Logout</button>
        </>
      ) : (
        <button onClick={handleLogin}>Login</button>
      )}
    </div>
  );
}
```

### Data Operations

```typescript
import { useData } from '@/context/DataContext';

function ShipmentsComponent() {
  const { shipments, addShipment, updateShipmentStatus } = useData();

  const handleAddShipment = async () => {
    const newShipment: Shipment = {
      id: 'NEW-001',
      trackingNumber: 'NEW-001',
      // ... other fields
    };
    await addShipment(newShipment);
  };

  const handleStatusUpdate = async (shipmentId: string) => {
    await updateShipmentStatus(shipmentId, 'shipped');
  };

  return (
    <div>
      {shipments.map(shipment => (
        <div key={shipment.id}>
          <p>{shipment.trackingNumber}</p>
          <button onClick={() => handleStatusUpdate(shipment.id)}>
            Mark as Shipped
          </button>
        </div>
      ))}
    </div>
  );
}
```

## Running the Application

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Start development server**:
   ```bash
   npm run dev
   ```

3. **Build for production**:
   ```bash
   npm run build
   ```

## Security Considerations

1. **API Keys**: The anon key is safe to expose in the frontend. It's restricted by RLS policies.
2. **Row Level Security**: All tables have RLS enabled to ensure users can only access data they're authorized to see.
3. **Authentication**: Supabase Auth handles secure password storage and session management.
4. **Environment Variables**: Never commit `.env.local` to version control.

## Next Steps

1. **Enable Email Verification**: Configure email templates in Supabase Auth settings
2. **Add OAuth Providers**: Set up Google, GitHub, or other OAuth providers
3. **Implement File Storage**: Use Supabase Storage for package photos
4. **Add Webhooks**: Set up webhooks for automated notifications
5. **Monitor Performance**: Use Supabase dashboard to monitor database performance
6. **Backup Strategy**: Configure automated backups in Supabase settings

## Troubleshooting

### Connection Issues
- Verify the Supabase URL and API key are correct in `.env.local`
- Check that the project is in ACTIVE_HEALTHY status
- Ensure your network allows connections to Supabase

### Authentication Issues
- Clear browser localStorage and try again
- Check that the user profile was created in the profiles table
- Verify RLS policies are correctly configured

### Real-Time Updates Not Working
- Ensure Realtime is enabled in Supabase project settings
- Check browser console for subscription errors
- Verify RLS policies allow the user to access the data

## Support

For more information about Supabase:
- [Supabase Documentation](https://supabase.com/docs)
- [Supabase JavaScript Client](https://supabase.com/docs/reference/javascript/introduction)
- [Supabase Auth](https://supabase.com/docs/guides/auth)
- [Supabase Realtime](https://supabase.com/docs/guides/realtime)
