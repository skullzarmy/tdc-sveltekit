<script type="module">
    import { onMount } from "svelte";
    import CoinTable from "./_coinTable.svelte";
    var flipCount = null;
    var flipTez = null;
    var flipWins = null;
    var flipLosses = null;
    var walletData = Array();
    var flipBalance = null;
    var flipToPool = null;
    var flipPoolTxnCount = 0;
    var uniqueWalletCount = null;
    var playerWallets = {};
    var data,
        mostWins,
        mostLosses,
        mostPlays,
        bestRatio,
        bestRatioUser,
        mostPlaysUser,
        mostWinsUser,
        mostLossesUser,
        mostWon,
        mostLost,
        mostWonUser,
        mostLostUser,
        flipWinPerc,
        flipLosePerc;
    export var flipGames;
    let dataRefreshCoin;
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
    function formatAddress(address) {
        // console.log(address);
        if (!address || address == null) {
            return;
        }
        return address.substring(0, 3) + ".." + address.substring(address.length - 4, address.length);
    }
    function formatWL(address) {
        if (!address || address == null) {
            return;
        }
        return playerWallets[address].wins + "W / " + playerWallets[address].losses + "L";
    }
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
        console.log("refreshing data");
        data = Array();
        for (let game of flipGames.reverse()) {
            data.push(game.value);
        }

        // console.log(flipGames);
        // status 1 = rug & 2 = double

        flipWins = null;
        flipLosses = null;
        playerWallets = {};
        for (let g of flipGames) {
            if (!playerWallets[g.value.player]) {
                playerWallets[g.value.player] = { wins: 0, losses: 0, plays: 0, ratio: 0, balance: 0 };
            }
            playerWallets[g.value.player].plays++;
            if (!mostPlays || playerWallets[g.value.player].plays > mostPlays) {
                mostPlays = playerWallets[g.value.player].plays;
                mostPlaysUser = g.value.player;
            }
            let status = g.value.status;
            if (status == "2") {
                flipWins++;
                playerWallets[g.value.player].wins++;
                playerWallets[g.value.player].balance =
                    playerWallets[g.value.player].balance + Math.floor(parseInt(g.value.amount) / 1000000);
                if (!mostWins || playerWallets[g.value.player].wins > mostWins) {
                    mostWins = playerWallets[g.value.player].wins;
                    mostWinsUser = g.value.player;
                }
                if (!mostWon || playerWallets[g.value.player].balance > mostWon) {
                    mostWon = playerWallets[g.value.player].balance;
                    mostWonUser = g.value.player;
                }
            } else {
                flipLosses++;
                playerWallets[g.value.player].losses++;
                playerWallets[g.value.player].balance =
                    playerWallets[g.value.player].balance - Math.floor(parseInt(g.value.amount) / 1000000);
                if (!mostLosses || playerWallets[g.value.player].losses > mostLosses) {
                    mostLosses = playerWallets[g.value.player].losses;
                    mostLossesUser = g.value.player;
                }
                if (!mostLost || playerWallets[g.value.player].balance < mostLost) {
                    mostLost = playerWallets[g.value.player].balance;
                    mostLostUser = g.value.player;
                }
            }
        }
        // console.log(Object.keys(playerWallets));
        for (let player of Object.keys(playerWallets)) {
            if (playerWallets[player].wins > 5 && playerWallets[player].losses > 0) {
                playerWallets[player].ratio = playerWallets[player].wins / playerWallets[player].losses;
            } else if (playerWallets[player].wins > 5) {
                playerWallets[player].ratio = 100;
            }

            if (!bestRatio || playerWallets[player].ratio > bestRatio) {
                bestRatio = playerWallets[player].ratio;
                bestRatioUser = player;
            }
        }
        // console.log(playerWallets);
        flipWinPerc = parseFloat((flipWins / flipCount) * 100).toFixed(2) + "%";
        flipLosePerc = parseFloat((flipLosses / flipCount) * 100).toFixed(2) + "%";
        uniqueWalletCount = Object.keys(playerWallets).length;

        // mostWinsUser = mostWinsUser.substring(0, 3) + "..." + mostWinsUser.substring(mostWinsUser.length - 3, mostWinsUser.length);
    }
    // let SingleStats = getSingleStats();

    import SingleStat from "./_singleStat.svelte";
</script>

<section class="text-gray-400 body-font pb-4">
    <div class="container mx-auto flex flex-wrap p-5 flex-col md:flex-row items-center">
        <span
            class="flex order-first lg:order-none title-font font-medium text-2xl items-center text-white lg:items-center lg:justify-center mb-4 md:mb-0"
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
            <div tabindex="0" class="collapse collapse-arrow w-full border-transparent">
                <input type="checkbox" />
                <div class="collapse-title text-xl font-medium text-center mx-auto px-0">Player Stats</div>
                <div class="collapse-content flex flex-wrap w-full text-center stats">
                    <SingleStat value={formatAddress(mostWinsUser)} title="Most Wins ({mostWins})" isTez="false" />
                    <SingleStat value={formatAddress(mostWonUser)} title="Most Won ({mostWon}xtz)" isTez="false" />
                    <SingleStat
                        value={formatAddress(mostLossesUser)}
                        title="Most Losses ({mostLosses})"
                        isTez="false"
                    />
                    <SingleStat value={formatAddress(mostLostUser)} title="Most Lost ({mostLost}xtz)" isTez="false" />
                    <SingleStat value={formatAddress(mostPlaysUser)} title="Most Flips ({mostPlays})" isTez="false" />
                    <SingleStat
                        value={formatAddress(bestRatioUser)}
                        title="Luckiest ({formatWL(bestRatioUser)})"
                        isTez="false"
                    />
                </div>
            </div>
            {#if flipGames}
                <div tabindex="0" class="collapse collapse-arrow w-full border-zinc-900">
                    <input type="checkbox" />
                    <div class="collapse-title text-xl font-medium text-center bg-zinc-900 px-0">Flip Log</div>
                    <div class="collapse-content h-[40rem] text-left">
                        <CoinTable {flipGames} />
                    </div>
                </div>
            {/if}
        </div>
    </div>
</section>
