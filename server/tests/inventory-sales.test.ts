import { describe, it, expect, beforeAll, afterAll } from "vitest";
import request from "supertest";
import mongoose from "mongoose";
import app from "../src/app.js";
import { connectDatabase, disconnectDatabase } from "../src/config/db.js";
import { User } from "../src/modules/users/user.model.js";
import { Workspace } from "../src/modules/workspaces/workspace.model.js";
import { Product } from "../src/modules/products/product.model.js";
import { Sale } from "../src/modules/sales/sale.model.js";
import { StockMovement } from "../src/modules/stock-movements/stock-movement.model.js";

describe("Core Inventory & Sales Workflow (SRS Section 12.6)", () => {
    let token: string;
    let workspaceId: string;
    let userId: string;
    let testUserEmail: string;

    beforeAll(async () => {
        await connectDatabase();

        // Create an isolated test user and workspace
        testUserEmail = `test-runner-${Date.now()}@smartstock.local`;
        const registerRes = await request(app)
            .post("/api/v1/auth/register")
            .send({
                name: "Test Runner",
                email: testUserEmail,
                password: "Password123!",
            });

        expect(registerRes.status).toBe(201);
        token = registerRes.body.data.accessToken;
        workspaceId = registerRes.body.data.user.workspaceId;
        userId = registerRes.body.data.user.id;
    });

    afterAll(async () => {
        // Clean up test data
        if (workspaceId) {
            await Product.deleteMany({ workspace: workspaceId });
            await Sale.deleteMany({ workspace: workspaceId });
            await StockMovement.deleteMany({ workspace: workspaceId });
            await Workspace.findByIdAndDelete(workspaceId);
            await User.findByIdAndDelete(userId);
        }
        await disconnectDatabase();
    });

    it("Section 12.6: Given a product with 10 units, when a valid sale removes 3 units, the resulting stock must be 7 and the movement history must record a delta of -3", async () => {
        // 1. Create a product with 10 units
        const createProductRes = await request(app)
            .post("/api/v1/products")
            .set("Authorization", `Bearer ${token}`)
            .send({
                name: "Premium Wireless Keyboard",
                sku: `KB-${Date.now()}`,
                description: "Mechanical wireless keyboard",
                costPrice: 40,
                sellingPrice: 85,
                stockQuantity: 10,
                lowStockThreshold: 3,
            });

        expect(createProductRes.status).toBe(201);
        const productId = createProductRes.body.data.product._id;
        expect(createProductRes.body.data.product.stockQuantity).toBe(10);

        // 2. Perform a sale removing 3 units
        const saleRes = await request(app)
            .post("/api/v1/sales")
            .set("Authorization", `Bearer ${token}`)
            .send({
                items: [
                    {
                        productId,
                        quantity: 3,
                    },
                ],
            });

        expect(saleRes.status).toBe(201);
        expect(saleRes.body.success).toBe(true);
        expect(saleRes.body.data.sale.total).toBe(85 * 3); // 255
        expect(saleRes.body.data.sale.items[0].quantity).toBe(3);

        // 3. Verify resulting product stock is 7
        const getProductRes = await request(app)
            .get(`/api/v1/products/${productId}`)
            .set("Authorization", `Bearer ${token}`);

        expect(getProductRes.status).toBe(200);
        expect(getProductRes.body.data.product.stockQuantity).toBe(7);

        // 4. Verify movement history records the -3 deduction
        const movementRes = await request(app)
            .get(`/api/v1/stock-movements/${productId}/history`)
            .set("Authorization", `Bearer ${token}`);

        expect(movementRes.status).toBe(200);
        expect(movementRes.body.data.movements.length).toBeGreaterThan(0);

        const latestMovement = movementRes.body.data.movements[0];
        expect(latestMovement.type).toBe("OUT");
        expect(latestMovement.quantity).toBe(3);
        expect(latestMovement.previousQuantity).toBe(10);
        expect(latestMovement.newQuantity).toBe(7);
    });

    it("Section 12.6: Insufficient stock prevents the sale and preserves inventory", async () => {
        // 1. Create a product with 5 units
        const createProductRes = await request(app)
            .post("/api/v1/products")
            .set("Authorization", `Bearer ${token}`)
            .send({
                name: "Gaming Mouse",
                sku: `MS-${Date.now()}`,
                costPrice: 20,
                sellingPrice: 45,
                stockQuantity: 5,
                lowStockThreshold: 2,
            });

        expect(createProductRes.status).toBe(201);
        const productId = createProductRes.body.data.product._id;

        // 2. Attempt to sell 8 units (exceeds available 5)
        const saleRes = await request(app)
            .post("/api/v1/sales")
            .set("Authorization", `Bearer ${token}`)
            .send({
                items: [
                    {
                        productId,
                        quantity: 8,
                    },
                ],
            });

        // Must reject with 409 Conflict
        expect(saleRes.status).toBe(409);
        expect(saleRes.body.success).toBe(false);

        // 3. Verify product stock is untouched and remains 5
        const checkProductRes = await request(app)
            .get(`/api/v1/products/${productId}`)
            .set("Authorization", `Bearer ${token}`);

        expect(checkProductRes.status).toBe(200);
        expect(checkProductRes.body.data.product.stockQuantity).toBe(5);
    });

    it("Section 12.4: Multi-item sale is atomic and does not partially commit if one item has insufficient stock", async () => {
        // Product 1 has plenty of stock (10)
        const p1Res = await request(app)
            .post("/api/v1/products")
            .set("Authorization", `Bearer ${token}`)
            .send({
                name: "USB-C Cable",
                sku: `CBL-${Date.now()}`,
                costPrice: 5,
                sellingPrice: 12,
                stockQuantity: 10,
                lowStockThreshold: 2,
            });
        const p1Id = p1Res.body.data.product._id;

        // Product 2 has only 1 unit
        const p2Res = await request(app)
            .post("/api/v1/products")
            .set("Authorization", `Bearer ${token}`)
            .send({
                name: "Laptop Stand",
                sku: `STND-${Date.now()}`,
                costPrice: 15,
                sellingPrice: 35,
                stockQuantity: 1,
                lowStockThreshold: 1,
            });
        const p2Id = p2Res.body.data.product._id;

        // Request 2 of p1 and 5 of p2 (p2 will fail)
        const saleRes = await request(app)
            .post("/api/v1/sales")
            .set("Authorization", `Bearer ${token}`)
            .send({
                items: [
                    { productId: p1Id, quantity: 2 },
                    { productId: p2Id, quantity: 5 },
                ],
            });

        expect(saleRes.status).toBe(409);

        // Verify Product 1 was not partially deducted
        const checkP1 = await request(app)
            .get(`/api/v1/products/${p1Id}`)
            .set("Authorization", `Bearer ${token}`);
        expect(checkP1.body.data.product.stockQuantity).toBe(10);

        // Verify Product 2 is still 1
        const checkP2 = await request(app)
            .get(`/api/v1/products/${p2Id}`)
            .set("Authorization", `Bearer ${token}`);
        expect(checkP2.body.data.product.stockQuantity).toBe(1);
    });
});
