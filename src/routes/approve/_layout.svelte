<script context="module">
  import { getPreloadApiResponse } from "../../../utils/requests";

  export async function preload(page, session) {
    try {
      const count = await getPreloadApiResponse(
        `${session.apiUrl}/users/countApprovable`,
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
  import { stores } from "@sapper/app";

  import Title from "../../components/Title.svelte";
  import TransitionWrapper from "../../components/TransitionWrapper.svelte";
  import Switchers from "../../components/approve_manage/Switchers.svelte";

  export let count;

  const { page } = stores();
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

<Title caption="Подтверждение пользователей" />

<TransitionWrapper>
  {#if count > 0}
    <div class="approve">
      <div class="approve-content">
        <slot />
      </div>
      <div class="switchers">
        <Switchers {count} current={1} />
      </div>
    </div>
  {:else}
    <h2 class="no-approvable">
      Пока что нет людей, которых Вы можете подтвердить.
    </h2>
  {/if}
</TransitionWrapper>
