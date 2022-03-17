<script type="module">
    import { Datatable, SearchInput, PaginationButtons, PaginationRowCount } from "svelte-simple-datatables";
    export let battleGames;
    export var dataRefreshBattle = true;
    let data;
    let rows;
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
    if (dataRefreshBattle) {
        console.log("updating battle games");
        data = Array();
        for (let game of battleGames.reverse()) {
            data.push(game.value);
            data[data.length - 1].amount = data[data.length - 1].amount / 1000000;
        }
    } else {
        console.log(dataRefreshBattle);
    }
</script>

{#if data}
    <Datatable {settings} bind:data bind:dataRows={rows} id={"battleTable"}>
        <table class="w-full bg-zinc-900">
            <!-- <input type="checkbox" name="dataRefreshBattle" id="dataRefreshBattle" bind:checked={dataRefreshBattle} />
            <label for="dataRefreshBattle">&nbsp;&mdash; Data Refresh (resets sort)</label> -->
            <thead>
                <th data-key="player">Player 1</th>
                <th data-key="heads">Player 2</th>
                <th data-key="amount">Bet</th>
                <th data-key="status">Status</th>
                <th data-key="ts">Matched</th>
            </thead>
            <tbody>
                {#if rows}
                    {#each $rows as row}
                        <tr
                            class="border-l-4"
                            class:border-l-green-500={row.status == "1" || row.status == "2"}
                            class:border-l-red-500={row.status == "3"}
                            class:border-l-yellow-500={row.status == "0"}
                        >
                            <td
                                class:text-green-500={row.status == "1"}
                                class:text-red-500={row.status == "2"}
                                class:line-through={row.status == "3"}
                            >
                                <img
                                    src="https://services.tzkt.io/v1/avatars/{row.p1}"
                                    width="35"
                                    height="35"
                                    class="inline-flex"
                                    alt="wallet avatar"
                                />
                                {row.p1}
                            </td>
                            <td class:text-red-500={row.status == "1"} class:text-green-500={row.status == "2"}>
                                {#if row.p2}
                                    <img
                                        src="https://services.tzkt.io/v1/avatars/{row.p2}"
                                        width="35"
                                        height="35"
                                        class="inline-flex"
                                        alt="wallet avatar"
                                    />
                                    {row.p2}
                                {:else}
                                    N/A
                                {/if}
                            </td>
                            <td>
                                {#if row.amount > 10}
                                    <span class="text-amber-500">{Math.floor(row.amount)}xtz</span>
                                {:else}
                                    {Math.floor(row.amount)}xtz
                                {/if}
                            </td>
                            <td>
                                {#if row.status == "2"}
                                    <span class="text-green-500">Player 2 Wins</span>
                                {:else if row.status == "1"}
                                    <span class="text-green-500">Player 1 Wins</span>
                                {:else if row.status == "3"}
                                    <span class="text-red-500">Cancelled</span>
                                {:else}
                                    <span class="text-yellow-500">Waiting</span>
                                {/if}
                            </td>
                            <td>{row.ts}</td>
                        </tr>
                    {/each}
                {/if}
            </tbody>
        </table>
    </Datatable>
{/if}
