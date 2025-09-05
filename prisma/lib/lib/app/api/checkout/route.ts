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
