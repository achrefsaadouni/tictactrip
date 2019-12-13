const request = require('supertest');


let server;

describe('/api' , ()=>{

    beforeEach(() => {server = require('../app.js');});
    afterEach(() => {server.close();});

    describe('POST /api/token' , () => {
        it('should  return a token with 80000 words left' , async () => {
            const res = await request(server)
                .post("/api/token")
                .send({ email: "foo@bar.com" });
                expect(res.status).toBe(200);

        });
    });
    describe('POST /api/token' , () => {
        it('should  return a token with 50 words left' , async () => {
            const res = await request(server)
                .post("/api/token")
                .send({ email: "foo1@bar.com" });
            expect(res.status).toBe(200);

        });
    });

    describe('POST /api/token' , () => {
        it('should  not return a token' , async () => {
            const res = await request(server)
                .post("/api/token")
                .send({ email: "test@bar.com" });
                expect(res.status).toBe(401);
        });
    });
    describe('POST /api/justify' , () => {
        it('should  return a justified text to 80 character' , async () => {
            const res1 = await request(server)
                .post("/api/token")
                .send({ email: "foo@bar.com" });
            const res = await request(server)
                .post("/api/justify").set('Authorization', 'bearer ' + res1.body.token).set('Content-Type', 'text/plain').
            send("Longtemps, je me suis couché de bonne heure. Parfois, à peine ma bougie éteinte, mes yeux se fermaient si vite que je n’avais pas le temps de me dire: «Je m’endors.» Et, une demi-heure après, la pensée qu’il était temps de chercher le sommeil m’éveillait; je voulais poser le volume que je croyais avoir dans les mains et souffler ma lumière; je n’avais pas cessé en dormant de faire des réflexions sur ce que je venais de lire, mais ces réflexions avaient pris un tour un peu particulier; il me semblait que j’étais moi-même ce dont parlait l’ouvrage: une église, un quatuor, la rivalité de François Ier et de Charles-Quint.");
            expect(res.status).toBe(200);
        });
    });

    describe('POST /api/justify' , () => {
        it('should  return a 402 result status ' , async () => {
            const res1 = await request(server)
                .post("/api/token")
                .send({ email: "foo1@bar.com" });
            const res = await request(server)
                .post("/api/justify").set('Authorization', 'bearer ' + res1.body.token).set('Content-Type', 'text/plain').
                send("Longtemps, je me suis couché de bonne heure. Parfois, à peine ma bougie éteinte, mes yeux se fermaient si vite que je n’avais pas le temps de me dire: «Je m’endors.» Et, une demi-heure après, la pensée qu’il était temps de chercher le sommeil m’éveillait; je voulais poser le volume que je croyais avoir dans les mains et souffler ma lumière; je n’avais pas cessé en dormant de faire des réflexions sur ce que je venais de lire, mais ces réflexions avaient pris un tour un peu particulier; il me semblait que j’étais moi-même ce dont parlait l’ouvrage: une église, un quatuor, la rivalité de François Ier et de Charles-Quint.");
            expect(res.status).toBe(402);
        });
    });

});
