<!-- <script type="module"> -->
<script>
    import { onMount } from "svelte";
    import BattleTable from "./_battleTable.svelte";
    var battleCount = null;
    var battleTez = null;
    var battlePlayed = null;
    var battleCancelled = null;
    var p1Wins = null;
    var p1WinPerc = null;
    var p2Wins = null;
    var p2WinPerc = null;
    var walletData = Array();
    var battleBalance = null;
    var battlePlayedPerc;
    var battleCancelPerc;
    var wagers = Array();
    var wagersAvg;
    var wagerLargest = null;
    var battleToPool = null;
    var battlePoolTxnCount = 0;
    var uniqueWalletCount = null;
    var playerWallets = Array();
    export var battleGames;
    let refreshingBattles = false;
    let dataRefreshBattle = true;
    const settings = {
        blocks: {
            searchInput: true,
            paginationButtons: true,
            paginationRowCount: true,
        },
        sortable: true,
        pagination: true,
        rowsPerPage: 50,
        columnFilter: true,
        css: true,
    };
    let rows;
    var data;
    const battleWallet = "KT1DcrUC4rhnDkmvKDTykD3se7ZSwvqE1Rpr";
    const allWallets = [
        "KT1Sv23ZC6xDC4FtdRv2qwqcYSt2m4rsNG83",
        "KT1J8uugdkykcDx46ycEBxv3shNioDMvv1ad",
        "KT1DcrUC4rhnDkmvKDTykD3se7ZSwvqE1Rpr",
    ];
    const poolWallet = "KT1K6TyRSsAxukmjDWik1EoExSKsTg9wGEEX";

    onMount(async () => {
        updateBattleStats();
        getTxnsToPool();
        setInterval(() => {
            updateBattleStats();
            getTxnsToPool();
        }, 60000);
    });

    async function getTxnsToPool() {
        battlePoolTxnCount = 0;
        for (let wallet of allWallets) {
            let txns = await fetch(
                "https://api.tzkt.io/v1/operations/transactions?limit=10000&sender=" + wallet + "&target=" + poolWallet,
                {
                    headers: { Accept: "application/json" },
                }
            ).catch((e) => console.log(e));
            let txnData = await txns.json();
            for (let txn of txnData) {
                battlePoolTxnCount += txn.amount / 1000000;
            }
        }
        battleToPool = parseFloat(battlePoolTxnCount).toFixed(2);
    }

    async function updateBattleStats() {
        // console.log('updating');
        // clear out counters
        battlePlayed = null;
        battleCancelled = null;
        wagers = Array();
        wagerLargest = null;
        battleBalance = null;
        battleCount = null;
        battleTez = null;
        p1Wins = null;
        p2Wins = null;
        battleGames = [];
        if (dataRefreshBattle) {
            refreshingBattles = true;
        }
        let tempBal = null;
        let tempCount = null;
        let tempTez = null;
        let tempWagerLargest = null;
        let tempPlayed = null;
        let tempCancelled = null;
        let tempP1Wins = 0;
        let tempP2Wins = 0;
        let tempbattleGames = [];

        // loop for all contracts
        for (let wallet of allWallets) {
            let contractData = await fetch("https://api.tzkt.io/v1/contracts/" + wallet, {
                headers: { Accept: "application/json" },
            }).catch((e) => console.log(e));
            let contract = await contractData.json();
            // console.log(contract);
            tempBal = parseInt(contract.balance / 1000000);
            let battleStore = await fetch("https://api.tzkt.io/v1/contracts/" + wallet + "/storage", {
                headers: { Accept: "application/json" },
            }).catch((e) => console.log(e));
            let battleData = await battleStore.json();
            tempCount = tempCount + parseInt(battleData.gamesTotal);
            tempTez = tempTez + parseInt(battleData.flipped / 1000000);
            let battleGameStore = await fetch(
                "https://api.tzkt.io/v1/bigmaps/" + battleData.games + "/keys?limit=10000&sort=id",
                {
                    headers: { Accept: "application/json" },
                }
            ).catch((e) => console.log(e));
            let thisBattleGames = await battleGameStore.json();
            Array.prototype.push.apply(tempbattleGames, thisBattleGames);
            // console.table(battleGames);

            for (let g of thisBattleGames) {
                let status = g.value.status;
                if (status == "1") {
                    tempPlayed++;
                    tempP1Wins++;
                } else if (status == "2") {
                    tempPlayed++;
                    tempP2Wins++;
                } else if (status == "3") {
                    tempCancelled++;
                }
                wagers.push(parseInt(g.value.amount));
                if (!tempWagerLargest || parseInt(g.value.amount / 1000000) > tempWagerLargest) {
                    tempWagerLargest = parseInt(g.value.amount / 1000000);
                }
                if (!playerWallets.includes(g.value.p1)) {
                    playerWallets.push(g.value.p1);
                }
                if (!playerWallets.includes(g.value.p2)) {
                    playerWallets.push(g.value.p2);
                }
            }
        }
        // sums and extrapolation from counters
        battleBalance = tempBal;
        battleCount = tempCount;
        battleTez = tempTez;
        battlePlayed = tempPlayed;
        battleCancelled = tempCancelled;
        wagerLargest = tempWagerLargest;
        battleGames = tempbattleGames;
        p1Wins = tempP1Wins;
        p2Wins = tempP2Wins;
        battlePlayedPerc = parseFloat((battlePlayed / battleCount) * 100).toFixed(2) + "%";
        battleCancelPerc = parseFloat((battleCancelled / battleCount) * 100).toFixed(2) + "%";
        p1WinPerc = parseFloat((p1Wins / battlePlayed) * 100).toFixed(2) + "%";
        p2WinPerc = parseFloat((p2Wins / battlePlayed) * 100).toFixed(2) + "%";
        wagersAvg = parseFloat(wagers.reduce((a, b) => a + b, 0) / wagers.length / 1000000).toFixed(2);
        // wagerLargest = wagerLargest / 1000000;
        uniqueWalletCount = playerWallets.length;
        refreshingBattles = false;
    }

    import SingleStat from "./_singleStat.svelte";
</script>

<section class="text-gray-400 body-font">
    <div class="container mx-auto flex flex-wrap p-5 flex-col md:flex-row items-center">
        <span
            class="flex order-first lg:order-none title-font font-medium text-2xl items-center text-white lg:items-center lg:justify-center mb-4 md:mb-0"
            >Degen Battle Stats</span
        >
        <nav class="md:ml-auto md:mr-auto flex flex-wrap items-center text-base justify-center" />
        {#if !battleBalance}
            <a href="https://better-call.dev/mainnet/{battleWallet}/storage" target="_blank" class="btn btn-primary">
                Battle Contract<span class="pl-1" />
            </a>
        {:else}
            <a
                href="https://better-call.dev/mainnet/{battleWallet}/storage"
                target="_blank"
                class="btn btn-primary md:self-end"
            >
                Battle Contract<span class="pl-1">{battleBalance}</span>xtz
            </a>
        {/if}
    </div>

    <div class="container px-5 pb-24 pt-0 mx-auto">
        <div class="flex flex-wrap -m-4 text-center stats">
            <SingleStat value={battlePlayed} title="Played ({battlePlayedPerc})" isTez="false" />
            <SingleStat value={battleTez} title="Wagered" isTez="true" />
            <SingleStat value={battleCount} title="Started" isTez="false" />
            <SingleStat value={battleCancelled} title="Cancelled ({battleCancelPerc})" isTez="false" />
            <SingleStat value={p1Wins} title="Player 1 Wins ({p1WinPerc})" isTez="false" />
            <SingleStat value={p2Wins} title="Player 2 Wins ({p2WinPerc})" isTez="false" />
            <SingleStat value={wagersAvg} title="Average Bet" isTez="true" />
            <SingleStat value={wagerLargest} title="Largest Bet" isTez="true" />
            <SingleStat value={battleToPool} title="Sent to Pool" isTez="true" />
            <SingleStat value={uniqueWalletCount} title="Unique Players" isTez="false" />
            {#if battleGames && !refreshingBattles}
                <div tabindex="0" class="collapse collapse-arrow w-full border-zinc-900">
                    <input type="checkbox" />
                    <div class="collapse-title text-xl font-medium text-center bg-zinc-900 mx-0 px-0">Battle Log</div>
                    <div class="collapse-content h-[40rem] text-left">
                        <BattleTable {battleGames} />
                    </div>
                </div>
            {/if}
        </div>
    </div>
</section>
