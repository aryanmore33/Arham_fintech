const { createExport, fetchExportPage, fetchEmployees, fetchMappings } = require("../services/bse.service")
const { createSyncRun, updateSyncRun, stageTrades, stageClients, promoteRun } = require("../services/sync.service")
const db = require("../config/db");
const bcrypt = require("bcrypt");
const { BSE_PAGE_SIZE, BSE_EXPORT_POLL_MS } = require("../config/bse");
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Starts a server-side BSE export instantly, then polls its tiny status/page
// requests. No HTTP request is held open for the source's 10-minute runtime.
const pullExport = async (resource, filters, onPage) => {
  const job = await createExport({ resource, ...filters });
  let offset = 0;
  while (true) {
    const response = await fetchExportPage(job.data.id, { offset, limit: BSE_PAGE_SIZE });
    if (response.status === "PENDING") { await sleep(Math.min(response.retryAfterMs || BSE_EXPORT_POLL_MS, BSE_EXPORT_POLL_MS)); continue; }
    const rows = response.data || [];
    if (rows.length) await onPage(rows);
    if (!response.hasMore) return;
    offset += rows.length;
  }
};

const runBseSync = async () => {
    console.log("BSE SYNC STARTED");
    const syncRun = await createSyncRun();
    console.log(`Sync run: ${syncRun.id}`);
    try {
        let totalReceived = 0;
        // Clients arrive before trades so promotion cannot violate foreign keys.
        await pullExport("clients", {}, (clients) => db.transaction((trx) => stageClients(trx, syncRun.id, clients)));
        await pullExport("trades", {}, async (trades) => { await db.transaction((trx) => stageTrades(trx, syncRun.id, trades)); totalReceived += trades.length; });
        const [employees, mappings] = await Promise.all([fetchEmployees(), fetchMappings()]);
        const imported = await db.transaction(async (trx) => {
          const promoted = await promoteRun(trx, syncRun.id);
          const passwordHash = await bcrypt.hash("password123", 10);
          await trx("employees").insert((employees.data || employees).map((e) => ({ id: e.id, name: e.name, email: e.email, role: e.role, password_hash: passwordHash }))).onConflict("id").merge();
          await trx("employee_clients").insert((mappings.data || mappings).map((m) => ({ employee_id: m.employeeId, client_id: m.clientId }))).onConflict(["employee_id", "client_id"]).ignore();
          return promoted;
        });
        await updateSyncRun(
            syncRun.id, {
            status: "SUCCESS",
            completed_at: db.fn.now(),
            records_received: totalReceived,
            records_imported: imported,
        }
        )
        console.log(`BSE SYNC SUCCESS: ${totalReceived} trades`)
        return {
            success: true,
            syncRunId: syncRun.id,
            recordsReceived: totalReceived,
        };
    } catch (error) {
        console.error("BSE SYNC FAILED:", error.message)
        await updateSyncRun(
            syncRun.id, {
            status: "FAILED",
            completed_at: db.fn.now(),
            error_message: error.message,
        })
        return {
            success: false,
            syncRunId: syncRun.id,
            error: error.message,
        }
    }
}
module.exports = {
    runBseSync,
};
