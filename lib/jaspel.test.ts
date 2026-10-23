import test from 'node:test';
import assert from 'node:assert/strict';
import { calculateDistribution, DEFAULT_TOTAL_AMOUNT, formatRupiah } from './jaspel';

test('Calculates default distribution matching reference CSV accurately', () => {
  const result = calculateDistribution(DEFAULT_TOTAL_AMOUNT);

  assert.equal(result.totalAmount, 59490280);
  
  // Find KABAG & KABID
  const kabagKabid = result.groups.find(g => g.id === 'kabag_kabid');
  assert.ok(kabagKabid, 'kabag_kabid group should exist');
  assert.equal(kabagKabid.totalGroupAmount, 12481061);
  assert.equal(kabagKabid.perPersonAmount, 3120265);
  assert.equal(kabagKabid.recipientCount, 4);

  // Find KASUBAG & KASIE
  const kasubagKasie = result.groups.find(g => g.id === 'kasubag_kasie');
  assert.ok(kasubagKasie, 'kasubag_kasie group should exist');
  assert.equal(kasubagKasie.totalGroupAmount, 17008271);
  assert.equal(kasubagKasie.perPersonAmount, 1889808);
  assert.equal(kasubagKasie.recipientCount, 9);

  // Find Bendahara Penerimaan
  const bp = result.groups.find(g => g.id === 'bendahara_penerimaan');
  assert.ok(bp);
  assert.equal(bp.totalGroupAmount, 892354);

  // Find Bendahara Pengeluaran
  const bpg = result.groups.find(g => g.id === 'bendahara_pengeluaran');
  assert.ok(bpg);
  assert.equal(bpg.totalGroupAmount, 1189806);

  // Find Akuntansi
  const ak = result.groups.find(g => g.id === 'akuntansi');
  assert.ok(ak);
  assert.equal(ak.totalGroupAmount, 1189806);

  // Find Staf Manajemen
  const staf = result.groups.find(g => g.id === 'staf_manajemen');
  assert.ok(staf);
  assert.equal(staf.totalGroupAmount, 5881804);
  assert.equal(staf.perPersonAmount, 735225);

  // Find Aset
  const aset = result.groups.find(g => g.id === 'aset');
  assert.ok(aset);
  assert.equal(aset.totalGroupAmount, 773374);
  assert.equal(aset.perPersonAmount, 386687);

  // Find Surveilans
  const surv = result.groups.find(g => g.id === 'surveilans');
  assert.ok(surv);
  assert.equal(surv.totalGroupAmount, 885215);
  assert.equal(surv.perPersonAmount, 442608);

  // Find Suci & Icha
  const suci = result.groups.find(g => g.id === 'suci');
  assert.ok(suci);
  assert.equal(suci.totalGroupAmount, 237961);

  const icha = result.groups.find(g => g.id === 'icha');
  assert.ok(icha);
  assert.equal(icha.totalGroupAmount, 386687);

  // Find Tim Pendukung
  const tp = result.groups.find(g => g.id === 'tim_pendukung');
  assert.ok(tp);
  assert.equal(tp.totalGroupAmount, 2183293);
  assert.equal(tp.perPersonAmount, 545823);

  // Find Non Medik / Loket
  const nml = result.groups.find(g => g.id === 'non_medik_loket');
  assert.ok(nml);
  assert.equal(nml.totalGroupAmount, 249859);
  assert.equal(nml.perPersonAmount, 62465);

  // Find Sopir
  const sopir = result.groups.find(g => g.id === 'sopir');
  assert.ok(sopir);
  assert.equal(sopir.totalGroupAmount, 0);

  // Find Biaya Umum
  const bu = result.groups.find(g => g.id === 'biaya_umum');
  assert.ok(bu);
  assert.equal(bu.totalGroupAmount, 5056674);

  // Find Pengelola
  const pengelola = result.groups.find(g => g.id === 'pengelola');
  assert.ok(pengelola);
  assert.equal(pengelola.totalGroupAmount, 10181761);

  // Overall check
  assert.equal(result.totalAllocated, 59490280);
});

test('Calculates dynamic custom fee correctly', () => {
  const result = calculateDistribution(100000000);
  assert.equal(result.totalAmount, 100000000);
  const kabagKabid = result.groups.find(g => g.id === 'kabag_kabid');
  assert.equal(kabagKabid?.totalGroupAmount, 20980000);
  assert.equal(kabagKabid?.perPersonAmount, 5245000);
});

test('Format rupiah helper returns Indonesian currency string', () => {
  assert.equal(formatRupiah(1000000), 'Rp 1.000.000');
  assert.equal(formatRupiah(0), 'Rp 0');
});

test('Recalculates automatically when employees are added to a group', () => {
  const groupsCopy = JSON.parse(JSON.stringify(calculateDistribution(DEFAULT_TOTAL_AMOUNT).groups));
  // Find KASUBAG & KASIE which currently has 9 people
  const kasubagGroup = groupsCopy.find((g: any) => g.id === 'kasubag_kasie');
  assert.equal(kasubagGroup.recipientCount, 9);
  assert.equal(kasubagGroup.perPersonAmount, 1889808);

  // Add 1 employee to make it 10 people
  kasubagGroup.recipients.push({
    id: 'ks-10',
    name: 'PEGAWAI BARU',
    position: 'KASIE BARU',
  });

  const recalculated = calculateDistribution(DEFAULT_TOTAL_AMOUNT, groupsCopy);
  const updatedKasubag = recalculated.groups.find(g => g.id === 'kasubag_kasie');
  assert.equal(updatedKasubag?.recipientCount, 10);
  // 17,008,271 / 10 = 1,700,827 per person
  assert.equal(updatedKasubag?.perPersonAmount, 1700827);
  // Total group allocation remains preserved
  assert.equal(updatedKasubag?.totalGroupAmount, 17008271);
});

test('Recalculates automatically when employees are removed from a group', () => {
  const groupsCopy = JSON.parse(JSON.stringify(calculateDistribution(DEFAULT_TOTAL_AMOUNT).groups));
  const stafGroup = groupsCopy.find((g: any) => g.id === 'staf_manajemen');
  assert.equal(stafGroup.recipients.length, 8);

  // Remove 1 employee from staf_manajemen (now 7 people)
  stafGroup.recipients.pop();

  const recalculated = calculateDistribution(DEFAULT_TOTAL_AMOUNT, groupsCopy);
  const updatedStaf = recalculated.groups.find(g => g.id === 'staf_manajemen');
  assert.equal(updatedStaf?.recipientCount, 7);
  // 5,881,804 / 7 = 840,258 (approx)
  assert.equal(updatedStaf?.perPersonAmount, Math.round(5881804 / 7));
  assert.equal(updatedStaf?.totalGroupAmount, 5881804);
});

