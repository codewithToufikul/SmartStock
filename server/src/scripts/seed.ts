import mongoose from "mongoose";
import bcrypt from "bcrypt";
import { env } from "../config/env.js";
import { User, UserRole } from "../modules/users/user.model.js";
import { Workspace } from "../modules/workspaces/workspace.model.js";
import { Category } from "../modules/categories/category.model.js";
import { Supplier } from "../modules/suppliers/supplier.model.js";
import { Product } from "../modules/products/product.model.js";
import { Sale } from "../modules/sales/sale.model.js";
import { StockMovement } from "../modules/stock-movements/stock-movement.model.js";

async function runSeed() {
    console.log("Connecting to database for seeding...");
    await mongoose.connect(env.MONGODB_URI);
    console.log("Connected to MongoDB.");

    const demoEmail = "owner@smartstock.local";
    let user = await User.findOne({ email: demoEmail });
    let workspaceId: string;

    if (!user) {
        console.log(`Creating demo user: ${demoEmail}...`);
        const passwordHash = await bcrypt.hash("Password123!", 10);
        const tempOwnerId = new mongoose.Types.ObjectId();

        const workspace = await Workspace.create({
            name: "Apex Retail Workspace",
            owner: tempOwnerId,
        });

        user = await User.create({
            name: "Toufikul Islam",
            email: demoEmail,
            passwordHash,
            role: UserRole.OWNER,
            workspace: workspace._id,
        });

        workspace.owner = user._id;
        await workspace.save();
        workspaceId = workspace._id.toString();
    } else {
        workspaceId = user.workspace.toString();
        console.log(`Using existing user workspace: ${workspaceId}`);
    }

    console.log("Seeding categories...");
    const [catElectronics, catAccessories] = await Promise.all([
        Category.findOneAndUpdate(
            { workspace: workspaceId, name: "Electronics" },
            { workspace: workspaceId, name: "Electronics", description: "Gadgets and electronic equipment" },
            { upsert: true, new: true },
        ),
        Category.findOneAndUpdate(
            { workspace: workspaceId, name: "Computer Accessories" },
            { workspace: workspaceId, name: "Computer Accessories", description: "Keyboards, mice, and desk accessories" },
            { upsert: true, new: true },
        ),
    ]);

    console.log("Seeding suppliers...");
    const [supplierApex, supplierLogistics] = await Promise.all([
        Supplier.findOneAndUpdate(
            { workspace: workspaceId, name: "Apex Global Supplies" },
            {
                workspace: workspaceId,
                name: "Apex Global Supplies",
                contactPerson: "Rahim Ahmed",
                email: "rahim@apexsupplies.com",
                phone: "+8801711223344",
                address: "Motijheel C/A, Dhaka",
            },
            { upsert: true, new: true },
        ),
        Supplier.findOneAndUpdate(
            { workspace: workspaceId, name: "TechLogistics Ltd" },
            {
                workspace: workspaceId,
                name: "TechLogistics Ltd",
                contactPerson: "Karim Chowdhury",
                email: "karim@techlogistics.com",
                phone: "+8801819556677",
                address: "Agrabad, Chattogram",
            },
            { upsert: true, new: true },
        ),
    ]);

    console.log("Seeding products...");
    const sampleProducts = [
        {
            name: "Mechanical Wireless Keyboard",
            sku: "KEY-RGB-01",
            description: "RGB Hot-swappable mechanical keyboard",
            costPrice: 4500,
            sellingPrice: 6500,
            stockQuantity: 18,
            lowStockThreshold: 10,
            category: catAccessories?._id,
            supplier: supplierApex?._id,
            leadTimeDays: 7,
            safetyStock: 5,
        },
        {
            name: "Pro Ergonomic Gaming Mouse",
            sku: "MSE-PRO-02",
            description: "Ultra-lightweight wireless gaming mouse",
            costPrice: 2200,
            sellingPrice: 3400,
            stockQuantity: 6, // Low stock trigger!
            lowStockThreshold: 8,
            category: catAccessories?._id,
            supplier: supplierApex?._id,
            leadTimeDays: 5,
            safetyStock: 4,
        },
        {
            name: "7-in-1 USB-C Multiport Adapter",
            sku: "HUB-USBC-03",
            description: "Aluminum 4K HDMI USB-C hub",
            costPrice: 1800,
            sellingPrice: 2800,
            stockQuantity: 0, // Out of stock trigger!
            lowStockThreshold: 5,
            category: catAccessories?._id,
            supplier: supplierLogistics?._id,
            leadTimeDays: 10,
            safetyStock: 3,
        },
        {
            name: "27-inch 4K IPS Monitor",
            sku: "MON-4K-04",
            description: "Ultra-sharp HDR color-accurate monitor",
            costPrice: 28000,
            sellingPrice: 36000,
            stockQuantity: 12,
            lowStockThreshold: 4,
            category: catElectronics?._id,
            supplier: supplierLogistics?._id,
            leadTimeDays: 14,
            safetyStock: 2,
        },
    ];

    const seededProducts = [];
    for (const p of sampleProducts) {
        const prod = await Product.findOneAndUpdate(
            { workspace: workspaceId, sku: p.sku },
            {
                ...p,
                workspace: workspaceId,
                createdBy: user._id,
                isArchived: false,
            },
            { upsert: true, new: true },
        );
        seededProducts.push(prod);
    }

    const existingSalesCount = await Sale.countDocuments({ workspace: workspaceId });
    if (existingSalesCount === 0 && seededProducts.length >= 2) {
        console.log("Generating sample sales transactions over the past 7 days...");
        const now = Date.now();
        const oneDayMs = 24 * 60 * 60 * 1000;

        const p1 = seededProducts[0];
        const p2 = seededProducts[1];

        if (p1 && p2) {
            for (let dayOffset = 6; dayOffset >= 0; dayOffset--) {
                const saleDate = new Date(now - dayOffset * oneDayMs);

                const qty1 = (dayOffset % 3) + 1;
                const qty2 = (dayOffset % 2) + 1;

                const items = [
                    {
                        product: p1._id,
                        name: p1.name,
                        sku: p1.sku,
                        quantity: qty1,
                        unitPrice: p1.sellingPrice,
                        unitCost: p1.costPrice,
                        lineTotal: p1.sellingPrice * qty1,
                    },
                    {
                        product: p2._id,
                        name: p2.name,
                        sku: p2.sku,
                        quantity: qty2,
                        unitPrice: p2.sellingPrice,
                        unitCost: p2.costPrice,
                        lineTotal: p2.sellingPrice * qty2,
                    },
                ];

                const subtotal = items.reduce((acc, i) => acc + i.lineTotal, 0);

                const sale = await Sale.create({
                    workspace: workspaceId,
                    soldBy: user._id,
                    items,
                    subtotal,
                    total: subtotal,
                    status: "COMPLETED",
                    saleNumber: `INV-${Date.now().toString().slice(-4)}${dayOffset}`,
                    createdAt: saleDate,
                    updatedAt: saleDate,
                });

                for (const item of items) {
                    await StockMovement.create({
                        product: item.product,
                        workspace: workspaceId,
                        performedBy: user._id,
                        type: "OUT",
                        quantity: item.quantity,
                        previousQuantity: 30,
                        newQuantity: 30 - item.quantity,
                        reason: `Sale ${sale.saleNumber}`,
                        createdAt: saleDate,
                    });
                }
            }
        }
    }

    console.log("Seeding completed successfully!");
    await mongoose.disconnect();
    process.exit(0);
}

runSeed().catch((err) => {
    console.error("Seeding failed:", err);
    process.exit(1);
});
