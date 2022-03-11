<script>
    import { Datatable, SearchInput, PaginationButtons, PaginationRowCount } from "svelte-simple-datatables";
    export let flipGames;
    export let dataRefresh = true;
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
    if (dataRefresh) {
        data = Array();
        for (let game of flipGames.reverse()) {
            data.push(game.value);
        }
    }
</script>

{#if data}
    <Datatable {settings} bind:data bind:dataRows={rows} id={"flipTable"}>
        <table class="w-full bg-zinc-900">
            <input type="checkbox" name="dataRefresh" id="dataRefresh" bind:checked={dataRefresh} />
            <label for="dataRefresh">&nbsp;&mdash; Data Refresh (resets sort)</label>
            <thead>
                <th data-key="player">Player</th>
                <th data-key="heads">Heads / Tails</th>
                <th data-key="amount">Bet</th>
                <th data-key="status">Status</th>
                <th data-key="ts">Time</th>
            </thead>
            <tbody>
                {#if rows}
                    {#each $rows as row}
                        <tr
                            class="border-l-4"
                            class:border-l-green-500={row.status == "2"}
                            class:border-l-red-500={row.status == "1"}
                            class:border-l-yellow-500={row.status == "0"}
                        >
                            <td
                                ><img
                                    src="https://services.tzkt.io/v1/avatars/{row.player}"
                                    width="35"
                                    height="35"
                                    class="inline-flex"
                                />
                                {row.player}</td
                            >
                            <td>
                                {#if row.heads == true}
                                    Heads
                                {:else}
                                    Tails
                                {/if}
                            </td>
                            <td>
                                {#if row.amount > 4000000}
                                    <span class="text-amber-500">{Math.floor(row.amount / 1000000)}</span>
                                {:else}
                                    {Math.floor(row.amount / 1000000)}
                                {/if}
                            </td>
                            <td>
                                {#if row.status == "2"}
                                    <span class="text-green-500">Doubled</span>
                                {:else if row.status == "1"}
                                    <span class="text-red-500">Rugged</span>
                                {:else}
                                    <span class="text-yellow-500">Unresolved</span>
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
