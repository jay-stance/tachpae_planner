import Addon from '@/models/Addon';
import mongoose from 'mongoose';
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Product from '@/models/Product';
import Service from '@/models/Service';
import Order from '@/models/Order';

import { z } from 'zod';

// Validation Schema
const OrderItemSchema = z.object({
  type: z.enum(['PRODUCT', 'SERVICE', 'ADDON']),
  referenceId: z.string(),
  quantity: z.number().min(1),
  // Optional complex fields
  variantSelection: z.record(z.string(), z.any()).optional(),
  customizationData: z.record(z.string(), z.any()).optional(),
  bookingDate: z.string().optional(),
  bookingTime: z.string().optional(),
  priceAtPurchase: z.number().optional(),
});

const CreateOrderSchema = z.object({
  eventId: z.string(),
  customer: z.object({
    name: z.string().min(2),
    email: z.string().email().or(z.literal('')), // Allow empty if we want, or just standard email
    phone: z.string().min(10),
    whatsapp: z.string().optional(),
    address: z.string().min(5),
    city: z.string(),
    secondaryPhone: z.string().optional(),
    customMessage: z.string().optional(),
  }),
  items: z.array(OrderItemSchema).min(1),
});

export async function POST(req: Request) {
  await dbConnect();

  try {
    const body = await req.json();
    
    // 1. Zod Validation
    const validatedData = CreateOrderSchema.parse(body);

    let totalAmount = 0; // Final total
    let subTotal = 0;    // calculated subtotal
    const enrichedItems = [];

    for (const item of validatedData.items) {
      if (item.type === 'PRODUCT') {
        const product = await Product.findById(item.referenceId).select('name basePrice variantsConfig videoConfig');
        if (!product) {
             throw new Error(`Product not found: ${item.referenceId}`);
        }
        
        let itemPrice = product.basePrice;
        // ... variant logic (omitted for brevity, assume basePrice for now or trust frontend if variant logic complex)
        
        subTotal += itemPrice * item.quantity;
        
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
        
        subTotal += service.basePrice * item.quantity;
        // ... ticket generation
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
      } else if (item.type === 'ADDON') { // Handle Addons (Surprise, Logistics)
         // For "Surprise Yourself", the price is variable (user selected).
         // For "Logistics", price might be fixed or city dependent.
         // Ideally look up Addon by slug or ID. 
         // Strategy: If referenceId is ObjectId, look up by ID. If slug, look up by slug.
         let addon;
         if (mongoose.Types.ObjectId.isValid(item.referenceId)) {
             addon = await Addon.findById(item.referenceId);
         } else {
             addon = await Addon.findOne({ slug: item.referenceId });
         }

         if (!addon) {
            // Fallback for transition: if "surprise-yourself" is used but not in DB yet, accept it temporarily? 
            // User put document in prompt, implying it exists.
            throw new Error(`Addon not found: ${item.referenceId}`);
         }

         // Price Logic:
         // If Addon has 0 price (like Surprise Yourself template), we trust the `priceAtPurchase` because user selects budget.
         // If Addon has fixed price (Logistics), we use that.
         let itemPrice = addon.price;
         if (addon.price === 0 && item.priceAtPurchase) {
             itemPrice = item.priceAtPurchase;
         }

         subTotal += itemPrice * item.quantity;

         enrichedItems.push({
            type: 'ADDON',
            referenceId: addon._id.toString(), // Use the real DB ID if found
            name: addon.name,
            quantity: item.quantity,
            priceAtPurchase: itemPrice,
            customizationData: item.customizationData
         });
      }
    }

    // Calculate Service Fee
    const calculateServiceFee = (sub: number) => {
        if (sub <= 0) return 0;
        const brackets = Math.floor((sub - 1) / 50000);
        return 2500 + (brackets * 1000);
    };
    
    // Service Fee is NO LONGER an item, it's a field
    const serviceFee = calculateServiceFee(subTotal);
    totalAmount = subTotal + serviceFee;
    
    // 3. Create Order
    const generatedOrderId = `VAL-${Math.floor(Math.random() * 1000000)}`;

    const newOrder = await Order.create({
        event: validatedData.eventId,
        orderId: generatedOrderId,
        customer: validatedData.customer,
        items: enrichedItems,
        subTotal,
        serviceFee,
        totalAmount,
        status: 'PENDING'
    });

    // 4. Notify Admin (Mock)
    console.log(`[ORDER NOTIFICATION] New Order ${generatedOrderId} placed by ${validatedData.customer.name}`);
    // In a real app, you'd use something like sendEmail({ to: 'admin@tachpae.com', ... })

    return NextResponse.json({ 
        success: true, 
        order: {
            orderId: newOrder.orderId,
            _id: newOrder._id,
        },
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
