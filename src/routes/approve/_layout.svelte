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
  import Title from "../../components/Title.svelte";
import TransitionWrapper from "../../components/TransitionWrapper.svelte";

  export let count;
</script>

<style lang="sass">
  @import "../../theme/colors"

  .no-approvable
    color: $mdc-theme-secondary
    margin: .25rem .5rem
    text-align: center
</style>

<Title caption="Подтверждение пользователей" />

<TransitionWrapper>
  {#if count > 0}
    <slot />
  {:else}
    <h2 class="no-approvable">
      Пока что нет людей, которых Вы можете подтвердить.
    </h2>
  {/if}
</TransitionWrapper>
