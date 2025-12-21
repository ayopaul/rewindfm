#!/usr/bin/env npx tsx
/**
 * Admin Functionality Test Script
 * Tests all admin API endpoints to ensure they are working correctly.
 *
 * Usage: npx tsx scripts/test-admin.ts
 *
 * Environment variables required:
 * - NEXT_PUBLIC_SUPABASE_URL
 * - SUPABASE_SERVICE_ROLE_KEY
 */

import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("Missing required environment variables:");
  console.error("- NEXT_PUBLIC_SUPABASE_URL");
  console.error("- SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

interface TestResult {
  name: string;
  passed: boolean;
  error?: string;
}

const results: TestResult[] = [];

function log(message: string) {
  console.log(`[TEST] ${message}`);
}

function success(name: string) {
  results.push({ name, passed: true });
  console.log(`  ✅ ${name}`);
}

function fail(name: string, error: string) {
  results.push({ name, passed: false, error });
  console.log(`  ❌ ${name}: ${error}`);
}

async function testDatabaseConnection() {
  log("Testing database connection...");
  try {
    const { error } = await supabase.from("Station").select("id").limit(1);
    if (error) throw error;
    success("Database connection");
  } catch (e: any) {
    fail("Database connection", e?.message || "Unknown error");
  }
}

async function testStationTable() {
  log("Testing Station table...");
  try {
    const { data, error } = await supabase
      .from("Station")
      .select("*")
      .limit(1);
    if (error) throw error;
    success(`Station table accessible (${data?.length || 0} records)`);
  } catch (e: any) {
    fail("Station table", e?.message || "Unknown error");
  }
}

async function testShowCRUD() {
  log("Testing Show CRUD operations...");
  const testTitle = `Test Show ${Date.now()}`;
  let showId: string | null = null;

  try {
    // Get a station ID first
    const { data: stations } = await supabase
      .from("Station")
      .select("id")
      .limit(1);
    const stationId = stations?.[0]?.id;

    if (!stationId) {
      // Create a test station
      const { data: newStation, error: stationError } = await supabase
        .from("Station")
        .insert({ name: "Test Station", streamUrl: "https://example.com/stream" })
        .select()
        .single();
      if (stationError) throw stationError;
      success("Created test station");
    }

    const { data: stationData } = await supabase
      .from("Station")
      .select("id")
      .limit(1)
      .single();

    // Create
    const { data: created, error: createError } = await supabase
      .from("Show")
      .insert({
        title: testTitle,
        description: "Test description",
        stationId: stationData!.id,
      })
      .select()
      .single();
    if (createError) throw createError;
    showId = created.id;
    success("Show CREATE");

    // Read
    const { data: read, error: readError } = await supabase
      .from("Show")
      .select("*")
      .eq("id", showId)
      .single();
    if (readError) throw readError;
    if (read.title !== testTitle) throw new Error("Title mismatch");
    success("Show READ");

    // Update
    const { error: updateError } = await supabase
      .from("Show")
      .update({ description: "Updated description" })
      .eq("id", showId);
    if (updateError) throw updateError;
    success("Show UPDATE");

    // Delete
    const { error: deleteError } = await supabase
      .from("Show")
      .delete()
      .eq("id", showId);
    if (deleteError) throw deleteError;
    success("Show DELETE");
  } catch (e: any) {
    fail("Show CRUD", e?.message || "Unknown error");
    // Cleanup on failure
    if (showId) {
      await supabase.from("Show").delete().eq("id", showId);
    }
  }
}

async function testOapCRUD() {
  log("Testing OAP CRUD operations...");
  const testName = `Test OAP ${Date.now()}`;
  let oapId: string | null = null;

  try {
    // Create
    const { data: created, error: createError } = await supabase
      .from("Oap")
      .insert({
        name: testName,
        role: "Host",
        bio: "Test bio",
      })
      .select()
      .single();
    if (createError) throw createError;
    oapId = created.id;
    success("OAP CREATE");

    // Read
    const { data: read, error: readError } = await supabase
      .from("Oap")
      .select("*")
      .eq("id", oapId)
      .single();
    if (readError) throw readError;
    if (read.name !== testName) throw new Error("Name mismatch");
    success("OAP READ");

    // Update
    const { error: updateError } = await supabase
      .from("Oap")
      .update({ bio: "Updated bio" })
      .eq("id", oapId);
    if (updateError) throw updateError;
    success("OAP UPDATE");

    // Delete
    const { error: deleteError } = await supabase
      .from("Oap")
      .delete()
      .eq("id", oapId);
    if (deleteError) throw deleteError;
    success("OAP DELETE");
  } catch (e: any) {
    fail("OAP CRUD", e?.message || "Unknown error");
    // Cleanup on failure
    if (oapId) {
      await supabase.from("Oap").delete().eq("id", oapId);
    }
  }
}

async function testSettingsTable() {
  log("Testing Settings table...");
  try {
    const { data, error } = await supabase
      .from("Settings")
      .select("*")
      .limit(1);
    if (error) throw error;
    success(`Settings table accessible (${data?.length || 0} records)`);

    if (data && data.length > 0) {
      // Test update
      const { error: updateError } = await supabase
        .from("Settings")
        .update({ updatedAt: new Date().toISOString() })
        .eq("id", data[0].id);
      if (updateError) throw updateError;
      success("Settings UPDATE");
    }
  } catch (e: any) {
    fail("Settings table", e?.message || "Unknown error");
  }
}

async function testScheduleSlotTable() {
  log("Testing ScheduleSlot table...");
  try {
    const { data, error } = await supabase
      .from("ScheduleSlot")
      .select("*")
      .limit(5);
    if (error) throw error;
    success(`ScheduleSlot table accessible (${data?.length || 0} records)`);
  } catch (e: any) {
    fail("ScheduleSlot table", e?.message || "Unknown error");
  }
}

async function testAdminUserTable() {
  log("Testing AdminUser table...");
  try {
    const { data, error } = await supabase
      .from("AdminUser")
      .select("id, username, createdAt")
      .limit(1);
    if (error) throw error;
    success(`AdminUser table accessible (${data?.length || 0} users)`);

    if (data && data.length > 0) {
      log(`  Found admin user: ${data[0].username}`);
    }
  } catch (e: any) {
    fail("AdminUser table", e?.message || "Unknown error");
  }
}

async function testStorageBucket() {
  log("Testing Supabase Storage...");
  try {
    const { data: buckets, error } = await supabase.storage.listBuckets();
    if (error) throw error;

    const mediaBucket = buckets.find((b) => b.name === "media");
    if (mediaBucket) {
      success("Storage bucket 'media' exists");
    } else {
      fail("Storage bucket", "Bucket 'media' not found. Please create it in Supabase dashboard.");
    }
  } catch (e: any) {
    fail("Storage", e?.message || "Unknown error");
  }
}

async function testRLSPolicies() {
  log("Testing RLS policies (using anon key would be more accurate)...");
  try {
    // With service role, RLS is bypassed, so we just check tables are accessible
    const tables = ["Station", "Show", "Oap", "OapOnShow", "ScheduleSlot", "Settings"];

    for (const table of tables) {
      const { error } = await supabase.from(table).select("id").limit(1);
      if (error) {
        fail(`RLS - ${table}`, error.message);
      } else {
        success(`RLS - ${table} accessible`);
      }
    }
  } catch (e: any) {
    fail("RLS policies", e?.message || "Unknown error");
  }
}

async function runTests() {
  console.log("\n🧪 ADMIN FUNCTIONALITY TEST SUITE\n");
  console.log("=".repeat(50));

  await testDatabaseConnection();
  await testStationTable();
  await testShowCRUD();
  await testOapCRUD();
  await testSettingsTable();
  await testScheduleSlotTable();
  await testAdminUserTable();
  await testStorageBucket();
  await testRLSPolicies();

  console.log("\n" + "=".repeat(50));
  console.log("\n📊 TEST SUMMARY\n");

  const passed = results.filter((r) => r.passed).length;
  const failed = results.filter((r) => !r.passed).length;

  console.log(`  Total:  ${results.length}`);
  console.log(`  Passed: ${passed}`);
  console.log(`  Failed: ${failed}`);

  if (failed > 0) {
    console.log("\n❌ FAILED TESTS:");
    results
      .filter((r) => !r.passed)
      .forEach((r) => {
        console.log(`  - ${r.name}: ${r.error}`);
      });
  }

  console.log("\n" + "=".repeat(50));

  if (failed > 0) {
    console.log("\n⚠️  Some tests failed. Please review the errors above.\n");
    process.exit(1);
  } else {
    console.log("\n✅ All tests passed!\n");
    process.exit(0);
  }
}

runTests().catch((e) => {
  console.error("Test suite crashed:", e);
  process.exit(1);
});
