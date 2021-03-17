process.env.NODE_ENV = 'test';

const request = require('supertest');
const app = require('../app');
const db = require('../db');

let testCompany;

beforeEach(async () => {
    const result = await db.query(`INSERT INTO companies (code, name, description) VALUES ('str', 'Strava', 'Makes fitness app') RETURNING code, name, description`)
    testCompany = result.rows[0]
})

afterEach(async () => {
    await db.query(`DELETE FROM companies`)
})

afterAll(async () => {
    await db.end()
})

describe("GET /companies", () => {
    test("Get a list of all companies", async() => {
        const res = await request(app).get('/companies');
        expect(res.statusCode).toBe(200);
        expect(res.body).toEqual({companies: [testCompany]});
    })
})

describe("GET /companies/:code", () => {
    test("Gets a single company", async () => {
        const res = await request(app).get(`/companies/${testCompany.code}`)
        expect(res.statusCode).toBe(200);
        expect(res.body).toEqual({ companies: [testCompany]})
    })
    test("Responds with 404 for invalid company cody", async () => {
        const res = await request(app).get(`/companies/0`)
        expect(res.statusCode).toBe(404)
    })
})

describe("POST /companies", () => {
    test("Creates a new company", async () => {
        const res = await request(app).post('/companies').send({code: 'a', name: 'b', description: 'c'})
        expect(res.statusCode).toBe(201)
        expect(res.body).toEqual({
            company: {code: 'a', name: 'b', description: 'c'}
        })
    })
})

describe("PATCH /companies/:code", () => {
    test("Updates existing company", async () => {
        const res = await request(app).patch(`/companies/${testCompany.code}`).send({ name: 'b', description: 'c'})
        expect(res.statusCode).toBe(200)
        expect(res.body).toEqual({
            company: { code: 'str', name: 'b', description: 'c'}
        })
    })
    test("Responds with 404 for invalid company code", async () => {
        const res = await request(app).patch(`/companies/0`).send({ name: 'b', description: 'c'})
        expect(res.statusCode).toBe(404)
    })
})

describe("DELETE /companies/:code", () => {
    test("Deletes a single company", async () => {
        const res = await request(app).delete(`/companies/${testCompany.code}`)
        expect(res.statusCode).toBe(200)
        expect(res.body).toEqual({ Message: "Deleted"})
    })
})