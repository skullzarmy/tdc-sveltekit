<script>
    import { onMount } from "svelte";
    import CoinTable from "./_coinTable.svelte";
    var flipCount = null;
    var flipTez = null;
    var flipWins = null;
    var flipLosses = null;
    var walletData = Array();
    var flipBalance = null;
    var flipWinPerc;
    var flipLosePerc;
    var flipToPool = null;
    var flipPoolTxnCount = 0;
    var uniqueWalletCount = null;
    var playerWallets = Array();
    var data;
    let dataRefresh = true;
    export var flipGames;
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
    const flipWallet = "KT1NkWx47WzJeHCSyB62WjLtFn4tRf3uXBur";
    const poolWallet = "KT1K6TyRSsAxukmjDWik1EoExSKsTg9wGEEX";
    onMount(async () => {
        updateCoinFlip();
        setInterval(() => {
            updateCoinFlip();
            getTxnsToPool();
        }, 30000);
        getTxnsToPool();
    });

    async function getTxnsToPool() {
        let txns = await fetch(
            "https://api.tzkt.io/v1/operations/transactions?limit=10000&sender=" + flipWallet + "&target=" + poolWallet,
            {
                headers: { Accept: "application/json" },
            }
        ).catch((e) => console.log(e));
        let txnData = await txns.json();
        flipPoolTxnCount = 0;
        for (let txn of txnData) {
            flipPoolTxnCount += txn.amount / 1000000;
        }
        flipToPool = parseFloat(flipPoolTxnCount).toFixed(2);
    }

    async function updateCoinFlip() {
        let contractData = await fetch("https://api.tzkt.io/v1/contracts/" + flipWallet, {
            headers: { Accept: "application/json" },
        }).catch((e) => console.log(e));
        let contract = await contractData.json();
        flipBalance = contract.balance / 1000000;
        let flipStore = await fetch("https://api.tzkt.io/v1/contracts/" + flipWallet + "/storage", {
            headers: { Accept: "application/json" },
        }).catch((e) => console.log(e));
        let flipData = await flipStore.json();
        flipCount = flipData.gamesPlayed;
        flipTez = JSON.stringify(flipData.flipped / 1000000);
        let limit;
        var pages = 1;
        if (flipCount / 10000 > 1) {
            limit = 10000;
            pages = Math.ceil(flipCount / 10000);
        } else {
            limit = flipCount;
        }
        let flipGameStore = await fetch(
            "https://api.tzkt.io/v1/bigmaps/" + flipData.games + "/keys?limit=" + limit + "&sort=id",
            {
                headers: { Accept: "application/json" },
            }
        ).catch((e) => console.log(e));
        flipGames = await flipGameStore.json();
        if (dataRefresh) {
            data = Array();
            for (let game of flipGames.reverse()) {
                data.push(game.value);
            }
        }
        // console.log(flipGames);
        // status 1 = rug & 2 = double

        flipWins = null;
        flipLosses = null;
        for (let g of flipGames) {
            let status = g.value.status;
            if (status == "2") {
                flipWins++;
            } else {
                flipLosses++;
            }
            if (!playerWallets.includes(g.value.player)) {
                playerWallets.push(g.value.player);
            }
        }
        flipWinPerc = parseFloat((flipWins / flipCount) * 100).toFixed(2) + "%";
        flipLosePerc = parseFloat((flipLosses / flipCount) * 100).toFixed(2) + "%";
        uniqueWalletCount = playerWallets.length;
    }
    // let SingleStats = getSingleStats();

    import SingleStat from "./_singleStat.svelte";
</script>

<section class="text-gray-400 body-font">
    <div class="container mx-auto flex flex-wrap p-5 flex-col md:flex-row items-center">
        <span
            class="flex order-first lg:order-none title-font font-medium text-2xl underline items-center text-white lg:items-center lg:justify-center mb-4 md:mb-0"
            >Coin Flip Stats</span
        >
        <nav class="md:ml-auto md:mr-auto flex flex-wrap items-center text-base justify-center" />
        {#if !flipBalance}
            <a
                href="https://better-call.dev/mainnet/{flipWallet}/storage"
                target="_blank"
                class="btn btn-outline loading"
            >
                Flip Contract<span class="pl-1">loading</span>
            </a>
        {:else}
            <a
                href="https://better-call.dev/mainnet/{flipWallet}/storage"
                target="_blank"
                class="btn btn-primary md:self-end"
            >
                Flip Contract<span class="pl-1">{flipBalance}</span>xtz
            </a>
        {/if}
    </div>

    <div class="container px-5 pb-4 pt-0 mx-auto">
        <div class="flex flex-wrap -m-4 text-center stats">
            <SingleStat value={flipCount} title="Games Played" isTez="false" />
            <SingleStat value={flipTez} title="Wagered" isTez="true" />
            <SingleStat value={flipWins} title="Doubles ({flipWinPerc})" isTez="false" />
            <SingleStat value={flipLosses} title="Rugs ({flipLosePerc})" isTez="false" />
            <SingleStat value={flipToPool} title="Sent to Pool" isTez="true" />
            <SingleStat value={uniqueWalletCount} title="Unique Players" isTez="false" />
        </div>
    </div>
    {#if flipGames}
        <div class="container px-5 pb-24 pt-0 mx-auto mt-0 rounded-lg">
            <div tabindex="0" class="collapse collapse-arrow">
                <input type="checkbox" />
                <div class="collapse-title text-xl font-medium text-center bg-zinc-900 rounded-lg mx-0 underline">
                    VIEW FLIP GAMES
                </div>
                <div class="collapse-content h-[40rem] ">
                    <CoinTable {flipGames} />
                </div>
            </div>
        </div>
    {/if}
</section>
