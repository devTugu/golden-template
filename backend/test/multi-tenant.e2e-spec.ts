import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { createE2eApp } from './e2e-setup';

describe('Multi-tenant isolation (e2e)', () => {
  let app: INestApplication<App>;
  let adminToken: string;

  beforeAll(async () => {
    app = await createE2eApp();
    const login = await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({
        email: process.env.SEED_ADMIN_EMAIL ?? 'admin@example.com',
        password: process.env.SEED_ADMIN_PASSWORD ?? 'admin123!',
      });
    const body = login.body.data ?? login.body;
    adminToken = body.accessToken;
  });

  afterAll(async () => {
    await app.close();
  });

  async function switchOrg(
    token: string,
    organizationId: number,
  ): Promise<string> {
    const response = await request(app.getHttpServer())
      .post('/api/v1/auth/switch-organization')
      .set('Authorization', `Bearer ${token}`)
      .send({ organizationId })
      .expect(200);
    const body = response.body.data ?? response.body;
    return body.accessToken as string;
  }

  it('scopes users and admin site settings to the active organization', async () => {
    const me = await request(app.getHttpServer())
      .get('/api/v1/auth/me')
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200);
    const adminUserId = (me.body.data ?? me.body).id as number;

    const slug = `tenant-b-${Date.now()}`;
    const orgResponse = await request(app.getHttpServer())
      .post('/api/v1/admin/organizations')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ slug, name: 'Tenant B' })
      .expect(201);
    const orgBId = (orgResponse.body.data ?? orgResponse.body).id as number;

    await request(app.getHttpServer())
      .post(`/api/v1/admin/organizations/${orgBId}/members`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ userId: adminUserId, role: 'owner' })
      .expect(201);

    const tokenB = await switchOrg(adminToken, orgBId);

    const emailB = `tenant-b-${Date.now()}@example.com`;
    const created = await request(app.getHttpServer())
      .post('/api/v1/users')
      .set('Authorization', `Bearer ${tokenB}`)
      .send({
        email: emailB,
        password: 'TempUser1!',
        isActive: true,
      })
      .expect(201);
    const userBId = (created.body.data ?? created.body).id as number;

    await request(app.getHttpServer())
      .patch('/api/v1/admin/site-settings')
      .set('Authorization', `Bearer ${tokenB}`)
      .send({ hero: { title: { en: 'TENANT_B_HERO', mn: '' } } })
      .expect(200);

    const memberships = await request(app.getHttpServer())
      .get('/api/v1/auth/organizations')
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200);
    const orgList = memberships.body.data ?? memberships.body;
    const defaultOrgId = (orgList as { id: number }[]).find(
      (org) => org.id !== orgBId,
    )?.id;
    expect(defaultOrgId).toBeDefined();

    const tokenA = await switchOrg(adminToken, defaultOrgId!);

    await request(app.getHttpServer())
      .get(`/api/v1/users/${userBId}`)
      .set('Authorization', `Bearer ${tokenA}`)
      .expect(404);

    const usersList = await request(app.getHttpServer())
      .get('/api/v1/users')
      .set('Authorization', `Bearer ${tokenA}`)
      .expect(200);
    const listed = usersList.body.data ?? usersList.body;
    const ids = (listed.items as { id: number }[]).map((u) => u.id);
    expect(ids).not.toContain(userBId);

    const settings = await request(app.getHttpServer())
      .get('/api/v1/admin/site-settings')
      .set('Authorization', `Bearer ${tokenA}`)
      .expect(200);
    const heroTitle = (settings.body.data ?? settings.body).hero.title.en;
    expect(heroTitle).not.toBe('TENANT_B_HERO');
  });

  it('returns 403 when switching to an organization without membership', async () => {
    const slug = `tenant-c-${Date.now()}`;
    const orgResponse = await request(app.getHttpServer())
      .post('/api/v1/admin/organizations')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ slug, name: 'Tenant C' })
      .expect(201);
    const orgCId = (orgResponse.body.data ?? orgResponse.body).id as number;

    const viewerLogin = await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({
        email: process.env.SEED_VIEWER_EMAIL ?? 'viewer@example.com',
        password: process.env.SEED_VIEWER_PASSWORD ?? 'viewer123!',
      })
      .expect(200);
    const viewerToken = (viewerLogin.body.data ?? viewerLogin.body)
      .accessToken as string;

    await request(app.getHttpServer())
      .post('/api/v1/auth/switch-organization')
      .set('Authorization', `Bearer ${viewerToken}`)
      .send({ organizationId: orgCId })
      .expect(403);
  });
});
