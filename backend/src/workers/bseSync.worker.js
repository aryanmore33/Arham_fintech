const { fetchTradesPage } = require("../services/bse.service")
const { createSyncRun, updateSyncRun, stageTrades } = require("../services/sync.service")
const db = require("../config/database");
const { BSE_PAGE_SIZE } = require("../config/bse");

const runBseSync = async () => {
    console.log("BSE SYNC STARTED");
    console.log(`Sync run: ${syncRun.id}`);
    try {
        let offset = 0;
        let totalReceived = 0;
        while (true) {
            console.log(`Fetching trades from offset ${offset}`)
            const response = await fetchTradesPage({ offset, limit=BSE_PAGE_SIZE })
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
        await updateSyncRun(
            syncRun.id, {
            status: "SUCCESS",
            completed_at: db.fn.now(),
            records_received: totalReceived,
            records_imported: 0,
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