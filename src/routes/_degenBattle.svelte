<script>
    import { onMount } from "svelte";
    var battleCount = null;
    var battleTez = null;
    var battlePlayed = null;
    var battleCancelled = null;
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
    const battleWallet = "KT1J8uugdkykcDx46ycEBxv3shNioDMvv1ad";
    const poolWallet = "KT1K6TyRSsAxukmjDWik1EoExSKsTg9wGEEX";

    onMount(async () => {
        updateBattleStats();
        getTxnsToPool();
        setInterval(() => {
            updateBattleStats();
            getTxnsToPool();
        }, 30000);
    });

    async function getTxnsToPool() {
        let txns = await fetch(
            "https://api.tzkt.io/v1/operations/transactions?limit=10000&sender=" +
                battleWallet +
                "&target=" +
                poolWallet,
            {
                headers: { Accept: "application/json" },
            }
        ).catch((e) => console.log(e));
        let txnData = await txns.json();
        for (let txn of txnData) {
            battlePoolTxnCount += txn.amount / 1000000;
        }
        battleToPool = parseFloat(battlePoolTxnCount).toFixed(2);
    }

    async function updateBattleStats() {
        // console.log('updating');
        let contractData = await fetch("https://api.tzkt.io/v1/contracts/" + battleWallet, {
            headers: { Accept: "application/json" },
        }).catch((e) => console.log(e));
        let contract = await contractData.json();
        // console.log(contract);
        battleBalance = contract.balance / 1000000;
        let battleStore = await fetch("https://api.tzkt.io/v1/contracts/" + battleWallet + "/storage", {
            headers: { Accept: "application/json" },
        }).catch((e) => console.log(e));
        let battleData = await battleStore.json();
        battleCount = battleData.gamesTotal;
        battleTez = JSON.stringify(battleData.flipped / 1000000);
        let battleGameStore = await fetch(
            "https://api.tzkt.io/v1/bigmaps/" + battleData.games + "/keys?limit=10000&sort=id",
            {
                headers: { Accept: "application/json" },
            }
        ).catch((e) => console.log(e));
        let battleGames = await battleGameStore.json();
        battlePlayed = null;
        battleCancelled = null;
        wagers = Array();
        wagerLargest = null;
        for (let g of battleGames) {
            let status = g.value.status;
            if (status == "1" || status == "2") {
                battlePlayed++;
            } else if (status == "3") {
                battleCancelled++;
            }
            wagers.push(parseInt(g.value.amount));
            if (!wagerLargest || g.value.amount > wagerLargest) {
                wagerLargest = parseInt(g.value.amount);
            }
            if (!playerWallets.includes(g.value.p1)) {
                playerWallets.push(g.value.p1);
            }
            if (!playerWallets.includes(g.value.p2)) {
                playerWallets.push(g.value.p2);
            }
            // let playerWallet = g.value.player;
            // let gameInfo = [];
            battlePlayedPerc = parseFloat((battlePlayed / battleCount) * 100).toFixed(2) + "%";
            battleCancelPerc = parseFloat((battleCancelled / battleCount) * 100).toFixed(2) + "%";
        }
        console.log(wagers);
        wagersAvg = parseFloat(wagers.reduce((a, b) => a + b, 0) / wagers.length / 1000000).toFixed(2);
        wagerLargest = wagerLargest / 1000000;
        console.log(wagerLargest);
        uniqueWalletCount = playerWallets.length;
    }

    import SingleStat from "./_singleStat.svelte";
</script>

<section class="text-gray-400 body-font">
    <div class="container mx-auto flex flex-wrap p-5 flex-col md:flex-row items-center">
        <span
            class="flex order-first lg:order-none title-font font-medium text-2xl underline items-center text-white lg:items-center lg:justify-center mb-4 md:mb-0"
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
            <SingleStat value={battleCount} title="Games Started" isTez="false" />
            <SingleStat value={battleTez} title="Wagered" isTez="true" />
            <SingleStat value={battlePlayed} title="Games Played ({battlePlayedPerc})" isTez="false" />
            <SingleStat value={battleCancelled} title="Games Cancelled ({battleCancelPerc})" isTez="false" />
            <SingleStat value={wagersAvg} title="Average Bet" isTez="true" />
            <SingleStat value={wagerLargest} title="Largest Bet" isTez="true" />
            <SingleStat value={battleToPool} title="Sent to Pool" isTez="true" />
            <SingleStat value={uniqueWalletCount} title="Unique Players" isTez="false" />
        </div>
    </div>
</section>
