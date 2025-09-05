# One-Click Digital Shop — Full Local Scaffold (MVP)

> This document contains the full code scaffold, setup instructions, and exact files to run the **Next.js + Supabase + Stripe** MVP locally. Use this to review before deployment. Copy the files into a new project folder `oneclick-shop/` and follow the commands in the README section.

---

## Project overview

Tech stack (exact versions recommended):
- Node >= 18
- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- Supabase JS (for auth/storage)
- Prisma (Postgres ORM) targeting Supabase Postgres
- Stripe (server-side Checkout)

---

## File tree (exact)

```
oneclick-shop/
  README.md
  .env.example
  package.json
  next.config.js
  prisma/schema.prisma
  tailwind.config.js
  postcss.config.js
  app/
    layout.tsx
    page.tsx
    onboarding/page.tsx
    api/
      checkout/route.ts
      webhook/stripe/route.ts
  components/
    OnboardingWizard.tsx
    ProductCard.tsx
  lib/
    supabaseClient.ts
    stripeServer.ts
  public/
    placeholder.png
  styles/globals.css
  tsconfig.json
```

---

## .env.example (exact — fill values in your local .env)

```
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=public-anon-key
SUPABASE_SERVICE_ROLE_KEY=service-role-key

# Stripe
STRIPE_SECRET_KEY=sk_test_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx

# App
NEXTAUTH_SECRET=random_long_secret
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## package.json (exact)

```json
{
  "name": "oneclick-shop",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "prisma:migrate": "prisma migrate dev --name init"
  },
  "dependencies": {
    "next": "14.0.0",
    "react": "18.2.0",
    "react-dom": "18.2.0",
    "@supabase/supabase-js": "2.27.0",
    "stripe": "12.12.0",
    "prisma": "5.10.0"
  },
  "devDependencies": {
    "typescript": "5.2.2",
    "tailwindcss": "3.4.7",
    "postcss": "8.4.23",
    "autoprefixer": "10.4.14"
  }
}
```

---

## prisma/schema.prisma (exact)

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id        String   @id @default(uuid())
  email     String   @unique
  createdAt DateTime @default(now())
  stores    Store[]
}

model Store {
  id        String   @id @default(uuid())
  ownerId   String
  name      String
  subdomain String   @unique
  currency  String   @default("USD")
  createdAt DateTime @default(now())
  owner     User     @relation(fields: [ownerId], references: [id])
  products  Product[]
  settings  Setting?
}

model Product {
  id          String   @id @default(uuid())
  storeId     String
  title       String
  slug        String   @unique
  description String?
  priceCents  Int
  fileUrl     String
  coverUrl    String?
  status      String   @default("draft")
  createdAt   DateTime @default(now())
  store       Store    @relation(fields: [storeId], references: [id])
}

model Purchase {
  id                    String   @id @default(uuid())
  userId                String
  productId             String
  amountCents           Int
  currency              String
  stripePaymentIntentId String?
  createdAt             DateTime @default(now())
}

model Setting {
  id              String  @id @default(uuid())
  storeId         String  @unique
  priceMode       String  @default("recommended")
  adBudgetDaily   Int     @default(5)
  store           Store   @relation(fields: [storeId], references: [id])
}
```

---

## lib/supabaseClient.ts

```ts
import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(url, anon, {
  auth: { persistSession: false }
});
```

---

## lib/stripeServer.ts

```ts
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: "2024-11-15" });
export default stripe;
```

---

## app/api/checkout/route.ts (Next.js route handler)

```ts
import { NextResponse } from 'next/server';
import stripe from '@/lib/stripeServer';

export async function POST(req: Request) {
  const body = await req.json();
  const { product } = body; // product: {title, amountCents, currency, id}

  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    payment_method_types: ['card'],
    line_items: [{
      price_data: {
        currency: product.currency,
        product_data: { name: product.title },
        unit_amount: product.amountCents
      },
      quantity: 1
    }],
    success_url: `${process.env.NEXT_PUBLIC_APP_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/cancel`
  });

  return NextResponse.json({ url: session.url });
}
```

---

## app/api/webhook/stripe/route.ts

```ts
import { NextResponse } from 'next/server';
import stripe from '@/lib/stripeServer';

export async function POST(req: Request) {
  const payload = await req.text();
  const sig = req.headers.get('stripe-signature') || '';
  try {
    const event = stripe.webhooks.constructEvent(payload, sig, process.env.STRIPE_WEBHOOK_SECRET!);
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as any;
      // TODO: fulfill order: create Purchase row, send email with secure file link
    }
    return NextResponse.json({ received: true });
  } catch (err) {
    return new NextResponse('Webhook error', { status: 400 });
  }
}
```

---

## components/OnboardingWizard.tsx

> NOTE: Use the preview UI code you reviewed earlier. Paste that component here as `OnboardingWizard.tsx` and import into `app/onboarding/page.tsx`.

---

## app/onboarding/page.tsx

```tsx
import OnboardingWizard from '@/components/OnboardingWizard';

export default function Page() {
  return <OnboardingWizard />;
}
```

---

## Tailwind & CSS

Create `styles/globals.css` with Tailwind base/imports and `tailwind.config.js` default config. Use the Tailwind docs for exact minimal setup.

---

## README.md (exact steps — copy these)

1. Clone/create project folder and paste files above.
2. `cp .env.example .env` and fill values (you must set DATABASE_URL to your Supabase Postgres connection string; optionally use the Supabase UI to get it).
3. `npm install`
4. `npx prisma generate`
5. `npx prisma migrate dev --name init` (this will create the tables in your Supabase Postgres)
6. `npm run dev`
7. Open `http://localhost:3000/onboarding` to test the onboarding preview UI.

**Stripe testing:**
- In Stripe Dashboard > Developers > Webhooks, add a webhook endpoint: `http://localhost:3000/api/webhook/stripe` and use the signing secret in `.env`.
- Use Stripe CLI to forward events or create Checkout sessions to test.

---

## Next steps I will execute for you (if you say "go")

1. Paste this scaffold into the canvas as downloadable files (or provide a Git repo link if you want). 
2. Implement the webhook fulfillment logic to create `Purchase` rows (Prisma client code) and generate temporary Supabase storage links.
3. Add Stripe Checkout client integration on the product page and a basic store front.
4. Wire Supabase Auth magic link for store owners to sign up and create stores.

---

**Review this scaffold in the canvas.** Tell me "go" and I will: 
- add the Prisma/Prisma client code and exact API fulfillment logic, 
- create the product seeder (20 starter products), 
- and produce a single `zip` you can run locally. 

If you want me to instead push this to a GitHub repo and connect to Vercel for staging (zero cost until traffic), say "deploy" and I will prepare commits and instructions for pushing your keys securely.
