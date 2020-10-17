<script context="module">
  import { getPreloadApiResponse } from "../../../utils/requests";

  export async function preload(page, session) {
    try {
      const count = await getPreloadApiResponse(
        `${session.apiUrl}/users/countManageable`,
        {},
        this
      );

      return {
        count,
      };
    } catch (e) {
      await this.redirect(301, "/auth");

      console.log(e);

      return {
        count: false,
      };
    }
  }
</script>

<script>
  import { stores, goto } from "@sapper/app";
  import { onMount } from "svelte";

  import Title from "../../components/Title.svelte";
  import TransitionWrapper from "../../components/TransitionWrapper.svelte";
  import Select from "../../components/Select.svelte";
  import Switchers from "../../components/approve_manage/Switchers.svelte";

  export let count;

  let sortSelect, i, mounted = false;
  const { page } = stores();
  const sortWays = [
    ["Имя", "first_name"],
    ["Фамилия", "last_name"],
    ["По умолчанию", "id"],
  ];

  for (i = 0; i < sortWays.length; i += 1) {
    if ($page.query.sort_by === sortWays[i][1]) {
      sortSelect = i;
      break;
    }
  }

  if (i === sortWays.length) {
    sortSelect = sortWays.length - 1;
  }

  onMount(() => {
    mounted = true;
  });

  const checkSelect = () => {
    if (mounted) {
      if (sortWays[sortSelect][1] !== $page.query.sort_by) {
        goto($page.path + "?sort_by=" + sortWays[sortSelect][1]);
      }
    }
  };

  $: if (sortSelect >= 0) {
    checkSelect();
  }
</script>

<style lang="sass">
  @import "../../theme/colors"

  .approve
    max-width: 40rem
    margin: 0 auto

    .switchers
      margin: .5rem 0 0

  .no-approvable
    color: $mdc-theme-secondary
    margin: .25rem .5rem
    text-align: center
</style>

<Title caption="Подчинённые" />

<TransitionWrapper>
  {#if count > 0}
    <div class="approve">
      <Select
        label="Сортировка"
        options={sortWays.map((way) => way[0])}
        bind:selectedIndex={sortSelect} />
      <div class="approve-content">
        <slot />
      </div>
      <div class="switchers">
        <Switchers {count} current={1} />
      </div>
    </div>
  {:else}
    <h2 class="no-approvable">У Вас нет подчинённых.</h2>
  {/if}
</TransitionWrapper>
