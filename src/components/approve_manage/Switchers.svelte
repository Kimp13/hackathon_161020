<script>
  import { arrayOf } from "../../../utils/arrays";

  export let count;
  export let current;

  const pageCount = parseInt(count / 10, 10) + (count % 10 ? 1 : 0);

  const min = (a, b) => (a > b ? b : a);
  const max = (a, b) => (a > b ? a : b);
</script>

<style lang="scss">
  @import "../../theme/colors";

  .switchers {
    display: flex;
    justify-content: center;

    .switcher {
      padding: .25rem .5rem;
      margin: 0 .5rem;
      text-align: center;
      border-bottom: .1rem solid var(--color);
      color: var(--color);
      transition: background-color .3s ease, color .3s ease;
      --color: rgba($mdc-theme-primary, .8);

      &:not(.current):hover {
        background-color: var(--color);
        color: white;
      }

      &.current {
        --color: $mdc-theme-secondary;
      }

      &.edge {
        --color: $mdc-theme-primary;

        &:first-child {
          margin: 0 2rem 0 0;
        }
        
        &:last-child {
          margin: 0 0 0 2rem;
        }
      }
    }
  }
</style>

<div class="switchers">
  {#if pageCount <= 9}
    {#each arrayOf(1, current) as page}
      <div class="switcher">{page}</div>
    {/each}
    <div class="switcher current">{current}</div>
    {#each arrayOf(current + 1, min(pageCount + 1, 10)) as page}
      <div class="switcher">{page}</div>
    {/each}
  {:else}
    <div class="switcher {current <= 4 ? '' : 'edge'}">1</div>
    {#each arrayOf(min(current - 3, 2), current) as page}
      <div class="switcher">{page}</div>
    {/each}
    <div class="switcher current">{current}</div>
    {#each arrayOf(current + 1, max(10, current + 4)) as page}
      <div class="switcher">{page}</div>
    {/each}
    <div class="switcher {pageCount - current > 3 ? '' : 'edge'}">
      {pageCount}
    </div>
  {/if}
</div>
