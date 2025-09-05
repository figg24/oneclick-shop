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
