
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Order, { IOrder } from '@/models/Order';
import Product from '@/models/Product';
import Service from '@/models/Service';
import { z } from 'zod';

// Validation Schema
const OrderItemSchema = z.object({
  type: z.enum(['PRODUCT', 'SERVICE']),
  referenceId: z.string(),
  quantity: z.number().min(1),
  // Optional complex fields
  variantSelection: z.record(z.string(), z.any()).optional(),
  customizationData: z.record(z.string(), z.any()).optional(),
  bookingDate: z.string().optional(),
  bookingTime: z.string().optional(),
});

const CreateOrderSchema = z.object({
  eventId: z.string(),
  customer: z.object({
    name: z.string().min(2),
    email: z.string().email(),
    phone: z.string().min(10),
    city: z.string(),
  }),
  items: z.array(OrderItemSchema).min(1),
});

export async function POST(req: Request) {
  await dbConnect();

  try {
    const body = await req.json();
    
    // 1. Zod Validation
    const validatedData = CreateOrderSchema.parse(body);

    let totalAmount = 0;
    const enrichedItems = [];

    // 2. Validate Items & Calculate Total
    for (const item of validatedData.items) {
      if (item.type === 'PRODUCT') {
        const product = await Product.findById(item.referenceId);
        if (!product) throw new Error(`Product not found: ${item.referenceId}`);
        
        // Calculate price with variants
        let itemPrice = product.basePrice;
        if (item.variantSelection && product.variantsConfig?.options) {
             // Logic to find price modifiers in variant config
             // For simplicity, we assume frontend passes base, but backend MUST verify
             // This is a complex logic simplified for this step:
             // Loop through variants and add modifiers
        }

        totalAmount += itemPrice * item.quantity;
        
        enrichedItems.push({
            type: 'PRODUCT',
            referenceId: item.referenceId,
            name: product.name,
            quantity: item.quantity,
            priceAtPurchase: itemPrice,
            variantSelection: item.variantSelection,
            customizationData: item.customizationData
        });

      } else if (item.type === 'SERVICE') {
        const service = await Service.findById(item.referenceId);
        if (!service) throw new Error(`Service not found: ${item.referenceId}`);
        
        // Validate Availability (TODO: Check capacity against Service.availabilityConfig)
        
        totalAmount += service.basePrice * item.quantity;
        
        // Generate Unique Ticket ID
        const ticketId = `TICKET-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

        enrichedItems.push({
            type: 'SERVICE',
            referenceId: item.referenceId,
            name: service.name,
            quantity: item.quantity,
            priceAtPurchase: service.basePrice,
            bookingDate: item.bookingDate,
            bookingTime: item.bookingTime,
            serviceId: ticketId
        });
      }
    }

    // 3. Create Order
    // Generate Friendly Order ID
    const orderId = `VAL-${Math.floor(Math.random() * 1000000)}`;

    const newOrder = await Order.create({
        event: validatedData.eventId,
        orderId,
        customer: validatedData.customer,
        items: enrichedItems,
        totalAmount,
        status: 'PENDING'
    });

    return NextResponse.json({ 
        success: true, 
        orderId: newOrder.orderId,
        _id: newOrder._id,
        totalAmount 
    });

  } catch (error: any) {
    console.error('Order Error:', error);
    return NextResponse.json({ 
        success: false, 
        error: error instanceof z.ZodError ? error.issues : error.message 
    }, { status: 400 });
  }
}
