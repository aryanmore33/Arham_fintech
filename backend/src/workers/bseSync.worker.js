const { fetchTradesPage, fetchClientsPage, fetchEmployees, fetchMappings } = require("../services/bse.service")
const { createSyncRun, updateSyncRun, stageTrades, stageClients, promoteRun } = require("../services/sync.service")
const db = require("../config/db");
const bcrypt = require("bcrypt");
const { BSE_PAGE_SIZE } = require("../config/bse");

const runBseSync = async () => {
    console.log("BSE SYNC STARTED");
    const syncRun = await createSyncRun();
    console.log(`Sync run: ${syncRun.id}`);
    try {
        let offset = 0;
        let totalReceived = 0;
        // Pull clients first: foreign keys can never point at an unseen client.
        while (true) {
          const response = await fetchClientsPage({ offset, limit: BSE_PAGE_SIZE });
          const clients = response.data || [];
          if (!clients.length) break;
          await db.transaction((trx) => stageClients(trx, syncRun.id, clients));
          if (clients.length < BSE_PAGE_SIZE) break;
          offset += BSE_PAGE_SIZE;
        }
        offset = 0;
        while (true) {
            console.log(`Fetching trades from offset ${offset}`)
            const response = await fetchTradesPage({ offset, limit: BSE_PAGE_SIZE })
            const trades = response.data || [];
            if (trades.length === 0) {
                break;
            }
            await db.transaction(async (trx) => {
                await stageTrades(trx, syncRun.id, trades)
            })
            totalReceived += trades.length;
            console.log(`Received ${trades.length} trades`);
            if (trades.length < BSE_PAGE_SIZE) {
                break;
            }
            offset += BSE_PAGE_SIZE
        }
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
