# Tachpae Planner

A robust, multi-tenant Event Planning Platform built for Valentine's Day 2026 and scalable for future events.

## Tech Stack
- **Framework**: Next.js 16 (App Router)
- **Database**: MongoDB (Mongoose)
- **Styling**: Tailwind CSS + Shadcn/UI
- **Storage**: AWS S3

## getting Started

1. **Environment Setup**
   Create a `.env.local` file in the root:
   ```env
   MONGODB_URI=mongodb://localhost:27017/tachpae-planner
   AWS_REGION=us-east-1
   AWS_ACCESS_KEY_ID=your_key
   AWS_SECRET_ACCESS_KEY=your_secret
   AWS_BUCKET_NAME=your_bucket
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Seed Database**
   Run the development server and trigger the seeder:
   ```bash
   npm run dev
   # Open browser or Postman to: POST http://localhost:3000/api/seed
   ```
   This will create:
   - Event: "Valentine 2026"
   - Cities: Lagos, Ibadan, PH, Abeokuta
   - Categories: Money Bouquets, Teddy Bears
   - Products: Digital Moving Frame (Complex Config)
   - Services: Candlelight Dinner at Eko Hotel (Direct Booking)

4. **Explore the App**
   - Visit `http://localhost:3000`
   - Select a City (e.g., Lagos)
   - Browse Gifts and Experiences
   - Try the "Specials" -> "Surprise Yourself" or "Be My Val"

## Architecture
- **Polymorphic Events**: The system fetches `theme_config` from the active Event.
- **Complex Products**: Supported via `ProductConfigurator` which handles Variants (Color/Size) and Wizard Steps (File Uploads/Text).
- **Viral Proposals**: Logic handles User A -> User B -> Video Reaction (S3).

## Testing
Import `postman_collection.json` into Postman to test APIs including Order Creation and S3 Uploads.
