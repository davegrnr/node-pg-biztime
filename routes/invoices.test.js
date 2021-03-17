process.env.NODE_ENV = 'test';

const request = require('supertest');
const app = require('../app');
const db = require('../db');

let testInvoice;

beforeEach(async () => {
    const result = await db.query(`INSERT INTO invoices (comp_code, amt, paid, add_date, paid_date) VALUES ('str' ,100, true, '2021-01-01', '2021-02-02') RETURNING id, comp_code, amt, paid, add_date, paid_date`)
    testInvoice = result.rows[0]
})

afterEach(async () => {
    await db.query(`DELETE FROM invoices`)
})

afterAll(async () => {
    await db.end()
})

describe("GET /invoices", () => {
    test("Get a list of all invoices", async () => {
        const res = await request(app).get(`/invoices`)
        expect(res.statusCode).toBe(200)
        expect(res.body).toEqual({ invoices: [
            {id: expect.any(Number), comp_code: 'str', amt: 100, paid: true, add_date: expect.any(String), paid_date: '2021-02-02T05:00:00.000Z'}
        ]
        })
    })  
})

describe("GET /invoices/:id", () => {
    test("Get one invoice by id", async () => {
        const res = await request(app).get(`/invoices/${testInvoice.id}`)
        expect(res.statusCode).toBe(200);
        expect(res.body).toEqual({ 
            invoice: {id: expect.any(Number), comp_code: 'str', amt: 100, paid: true, add_date: expect.any(String), paid_date: '2021-02-02T05:00:00.000Z'}
        })
    })
    test("Respond with 404 for invalid invoice id", async () => {
        const res = await request(app).get(`/invoices/9999`)
        expect(res.statusCode).toBe(404);
    })
})

describe("POST /invoices", () => {
    test("Create new invoice", async () => {
        const res = await request(app).post(`/invoices`).send({comp_code: 'str', amt: 100, paid: false, add_date: "2021-01-01", paid_date: "2021-02-02"});
        expect(res.body).toEqual({
            invoice: {id: expect.any(Number), comp_code: 'str', amt: 100, paid: false, add_date: expect.any(String), paid_date: null}
        })
    })
})

describe("PATCH /invoices/:id", () => {
    test("Update an invoice", async () => {
        const res = await request(app).patch(`/invoices/${testInvoice.id}`).send({ comp_code: 'str', amt: 222, paid: true});
        expect(res.body).toEqual({ 
            invoice: {id: expect.any(Number), comp_code: 'str', amt: 222, paid: true, add_date: expect.any(String), paid_date: '2021-02-02T05:00:00.000Z'}
        })
    })
    test("Repond with 404 for invalid invoice", async () => {
        const res = await request(app).patch(`/invoices/99999`).send({ comp_code: 'str', amt: 222, paid: true})
        expect(res.statusCode).toBe(404)
    })
})

describe("DELETE /invoices/:id", () => {
    test("Delete an invoice by id", async () => {
        const res = await request(app).delete(`/invoices/${testInvoice.id}`);
        expect(res.body).toEqual({
            Message: "Deleted"
        })
    })
})