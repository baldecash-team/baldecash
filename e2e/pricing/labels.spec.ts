import { test, expect } from '@playwright/test';

const API = 'http://localhost:8001/api/v1';

async function getToken(page: any): Promise<string> {
  const res = await page.request.post(`${API}/auth/login`, {
    form: { username: 'emilio.gonzales@baldecash.com', password: 'password123.A' },
  });
  return (await res.json()).access_token;
}

async function assignLabel(page: any, token: string, landingIds: number[], productIds: number[], labelIds: number[]) {
  return page.request.put(`${API}/pricing/universe/labels/assign`, {
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    data: { landing_ids: landingIds, product_ids: productIds, label_ids: labelIds, is_global: false, force_override: true },
  });
}

async function getCurrentLabels(page: any, token: string, landingId: number, productId: number) {
  const res = await page.request.post(`${API}/pricing/universe/labels/current`, {
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    data: { landing_id: landingId, product_ids: [productId] },
  });
  const data: any[] = await res.json();
  return data.find((i: any) => i.product_id === productId);
}

async function getAvailableLabels(page: any, token: string): Promise<any[]> {
  const res = await page.request.get(`${API}/pricing/universe/labels/available`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.json();
}

// ============================================================
// L8 — Asignar label per-landing → current_labels lo refleja
// ============================================================
test('L8 - Asignar label en CADE → current_labels lo incluye en label_ids', async ({ page }) => {
  const token = await getToken(page);
  const labels = await getAvailableLabels(page, token);
  if (labels.length === 0) return;

  const label = labels[0];

  // Asignar label al Samsung Tab (634) en CADE (152)
  const assignRes = await assignLabel(page, token, [152], [634], [label.id]);
  const assignData = await assignRes.json();
  expect(assignData.added).toBeGreaterThanOrEqual(0);

  // Verificar en current_labels
  const current = await getCurrentLabels(page, token, 152, 634);
  expect(current).toBeDefined();
  expect(current.label_ids).toContain(label.id);

  // Limpiar
  await assignLabel(page, token, [152], [634], []);
});

// ============================================================
// L9 — Producto sin LPL → label_ids vacío, global_label_ids puede tener
// ============================================================
test('L9 - Producto sin override per-landing tiene label_ids vacío', async ({ page }) => {
  const token = await getToken(page);

  // Asegurar que Samsung Tab en Home (1) no tiene override
  await assignLabel(page, token, [1], [634], []);

  const current = await getCurrentLabels(page, token, 1, 634);
  expect(current).toBeDefined();
  expect(current.label_ids).toEqual([]);
});

// ============================================================
// L10 — Asignar y quitar: BD queda limpia
// ============================================================
test('L10 - Asignar label y luego quitar → label_ids queda vacío', async ({ page }) => {
  const token = await getToken(page);
  const labels = await getAvailableLabels(page, token);
  if (labels.length === 0) return;

  const label = labels[0];

  // Asignar al Lenovo (491) en Home (1)
  await assignLabel(page, token, [1], [491], [label.id]);
  const after = await getCurrentLabels(page, token, 1, 491);
  expect(after.label_ids).toContain(label.id);

  // Quitar
  await assignLabel(page, token, [1], [491], []);
  const cleaned = await getCurrentLabels(page, token, 1, 491);
  expect(cleaned.label_ids).toEqual([]);
});

// ============================================================
// L11 — Override en CADE no afecta label_ids en Home
// ============================================================
test('L11 - Override per-landing en CADE no contamina Home', async ({ page }) => {
  const token = await getToken(page);
  const labels = await getAvailableLabels(page, token);
  if (labels.length === 0) return;

  const label = labels[0];

  // Asignar solo en CADE (152), NO en Home (1)
  await assignLabel(page, token, [152], [634], [label.id]);

  // Home no debe tener ese label en label_ids
  const homeState = await getCurrentLabels(page, token, 1, 634);
  expect(homeState).toBeDefined();
  expect(homeState.label_ids).not.toContain(label.id);

  // CADE sí lo tiene
  const cadeState = await getCurrentLabels(page, token, 152, 634);
  expect(cadeState.label_ids).toContain(label.id);

  // Limpiar
  await assignLabel(page, token, [152], [634], []);
});

// ============================================================
// L12 — Multi-landing: misma etiqueta en CADE, CADE A, CADE B
// ============================================================
test('L12 - Bulk multi-landing: label asignado en 3 landings simultáneamente', async ({ page }) => {
  const token = await getToken(page);
  const labels = await getAvailableLabels(page, token);
  if (labels.length === 0) return;

  const label = labels[0];

  // Asignar en las 3 landings CADE a la vez
  const res = await assignLabel(page, token, [152, 155, 156], [634], [label.id]);
  const data = await res.json();
  expect(data.added).toBeGreaterThanOrEqual(0);
  expect(data.landings_affected).toBe(3);

  // Verificar en cada landing
  for (const landingId of [152, 155, 156]) {
    const current = await getCurrentLabels(page, token, landingId, 634);
    expect(current.label_ids).toContain(label.id);
  }

  // Limpiar
  await assignLabel(page, token, [152, 155, 156], [634], []);
});
